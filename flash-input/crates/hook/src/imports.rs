//! Locates and replaces USER32 import slots of the running player executable.

use std::ffi::{CStr, c_void};
use std::ptr::{addr_of, null};
use std::sync::atomic::{AtomicPtr, Ordering};

use windows_sys::Win32::Foundation::{GetLastError, WIN32_ERROR};
use windows_sys::Win32::System::Diagnostics::Debug::{
    IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT, IMAGE_DIRECTORY_ENTRY_IMPORT, IMAGE_NT_HEADERS32,
};
use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
use windows_sys::Win32::System::Memory::{PAGE_READWRITE, VirtualProtect};
use windows_sys::Win32::System::SystemServices::{
    IMAGE_DOS_HEADER, IMAGE_IMPORT_BY_NAME, IMAGE_IMPORT_DESCRIPTOR, IMAGE_ORDINAL_FLAG32,
};
use windows_sys::Win32::System::WindowsProgramming::{
    IMAGE_DELAYLOAD_DESCRIPTOR, IMAGE_THUNK_DATA32,
};

/// A function pointer slot in the import address table of the executable in memory.
pub type ImportSlot = *mut *mut c_void;

/// Set in `IMAGE_DELAYLOAD_DESCRIPTOR::Attributes` when the descriptor holds RVAs.
const DELAYLOAD_RVA_BASED: u32 = 1;

/// Finds the slot the player calls a USER32 function through, searching both
/// the regular and the delay-loaded import tables.
///
/// # Safety
/// The process executable must be a loaded 32-bit PE image.
pub unsafe fn find_user32_import(function: &CStr) -> Option<ImportSlot> {
    unsafe {
        let image = GetModuleHandleW(null()).cast::<u8>();
        let dos_header = image.cast::<IMAGE_DOS_HEADER>();
        let headers = image
            .offset((*dos_header).e_lfanew as isize)
            .cast::<IMAGE_NT_HEADERS32>();
        let directories = &(*headers).OptionalHeader.DataDirectory;

        let imports_rva = directories[IMAGE_DIRECTORY_ENTRY_IMPORT as usize].VirtualAddress;
        if imports_rva != 0 {
            let mut library = image
                .add(imports_rva as usize)
                .cast::<IMAGE_IMPORT_DESCRIPTOR>();
            while (*library).Name != 0 {
                if is_user32(image, (*library).Name) {
                    let names_rva = (*library).Anonymous.OriginalFirstThunk;
                    let slot = find_function(image, names_rva, (*library).FirstThunk, function);
                    if slot.is_some() {
                        return slot;
                    }
                }
                library = library.add(1);
            }
        }

        // The standalone Flash Player imports USER32 through this delay-load table.
        let delay_imports_rva =
            directories[IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT as usize].VirtualAddress;
        if delay_imports_rva != 0 {
            let mut library = image
                .add(delay_imports_rva as usize)
                .cast::<IMAGE_DELAYLOAD_DESCRIPTOR>();
            while (*library).DllNameRVA != 0 {
                if (*library).Attributes.AllAttributes & DELAYLOAD_RVA_BASED != 0
                    && is_user32(image, (*library).DllNameRVA)
                {
                    let slot = find_function(
                        image,
                        (*library).ImportNameTableRVA,
                        (*library).ImportAddressTableRVA,
                        function,
                    );
                    if slot.is_some() {
                        return slot;
                    }
                }
                library = library.add(1);
            }
        }

        None
    }
}

/// Atomically points an import slot at `replacement`.
///
/// # Safety
/// `slot` must come from [`find_user32_import`], and `replacement` must be a
/// function with the signature of the import it replaces that stays loaded.
pub unsafe fn replace_import(
    slot: ImportSlot,
    replacement: *mut c_void,
) -> Result<(), WIN32_ERROR> {
    const SLOT_SIZE: usize = size_of::<*mut c_void>();

    unsafe {
        let mut protection = 0;
        if VirtualProtect(slot.cast(), SLOT_SIZE, PAGE_READWRITE, &mut protection) == 0 {
            return Err(GetLastError());
        }

        AtomicPtr::from_ptr(slot).store(replacement, Ordering::SeqCst);
        VirtualProtect(slot.cast(), SLOT_SIZE, protection, &mut protection);
    }

    Ok(())
}

/// # Safety
/// `name_rva` must locate a NUL-terminated string inside the loaded `image`.
unsafe fn is_user32(image: *mut u8, name_rva: u32) -> bool {
    let name = unsafe { CStr::from_ptr(image.add(name_rva as usize).cast()) };
    name.to_bytes().eq_ignore_ascii_case(b"USER32.dll")
}

/// Walks one library's parallel name and address tables for `function`.
///
/// # Safety
/// Non-zero RVAs must locate that library's thunk tables inside the loaded `image`.
unsafe fn find_function(
    image: *mut u8,
    names_rva: u32,
    slots_rva: u32,
    function: &CStr,
) -> Option<ImportSlot> {
    if names_rva == 0 || slots_rva == 0 {
        return None;
    }

    unsafe {
        let mut name = image.add(names_rva as usize).cast::<IMAGE_THUNK_DATA32>();
        let mut slot = image.add(slots_rva as usize).cast::<IMAGE_THUNK_DATA32>();
        while (*name).u1.AddressOfData != 0 {
            let name_rva = (*name).u1.AddressOfData;
            if name_rva & IMAGE_ORDINAL_FLAG32 == 0 {
                let entry = image.add(name_rva as usize).cast::<IMAGE_IMPORT_BY_NAME>();
                if CStr::from_ptr(addr_of!((*entry).Name).cast()) == function {
                    return Some(slot.cast());
                }
            }
            name = name.add(1);
            slot = slot.add(1);
        }
    }

    None
}
