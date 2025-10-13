# Android APK Signing Script for Windows
# NOTE: Run this from the project root, not the scripts folder!

Write-Host "`n=== Android APK Signing Helper ===" -ForegroundColor Cyan

# Get project root (parent of scripts folder)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Write-Host "Working directory: $ProjectRoot" -ForegroundColor Gray

# Keystore configuration
$KeystorePath = Join-Path $ProjectRoot "android-release-key.jks"
$KeyAlias = "bymr-launcher"
$ApkPath = Join-Path $ProjectRoot "src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-unsigned.apk"

# Find jarsigner
Write-Host "`nLocating Java tools..." -ForegroundColor Cyan
$jarsigner = $null
$keytool = $null

$jdkPaths = @(
    "C:\Program Files\Java\jdk*",
    "C:\Program Files\Android\Android Studio\jbr",
    "$env:JAVA_HOME"
)

foreach ($path in $jdkPaths) {
    if ($path -and (Test-Path $path -ErrorAction SilentlyContinue)) {
        $found = Get-ChildItem -Path $path -Filter "jarsigner.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $jarsigner = $found.FullName
            $keytool = Join-Path (Split-Path $jarsigner) "keytool.exe"
            Write-Host "Found Java tools in: $(Split-Path $jarsigner)" -ForegroundColor Green
            break
        }
    }
}

if (-not $jarsigner) {
    Write-Host "jarsigner not found! Please install JDK 11 or later." -ForegroundColor Red
    Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
    Read-Host
    exit 1
}

# Check if keystore exists
if (-not (Test-Path $KeystorePath)) {
    Write-Host "`nKeystore not found. Creating new keystore..." -ForegroundColor Yellow
    Write-Host "Please answer the following questions to create your keystore:`n" -ForegroundColor Green
    
    & $keytool -genkeypair -v -keystore $KeystorePath -alias $KeyAlias -keyalg RSA -keysize 2048 -validity 10000
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nKeystore created successfully!" -ForegroundColor Green
        Write-Host "Location: $KeystorePath" -ForegroundColor Green
        Write-Host "IMPORTANT: Keep this file and the password safe! You'll need it for future updates.`n" -ForegroundColor Yellow
    }
    else {
        Write-Host "`nFailed to create keystore." -ForegroundColor Red
        Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
        Read-Host
        exit 1
    }
}
else {
    Write-Host "`nUsing existing keystore: $KeystorePath" -ForegroundColor Green
}

# Check if unsigned APK exists
if (-not (Test-Path $ApkPath)) {
    Write-Host "`nUnsigned APK not found!" -ForegroundColor Red
    Write-Host "Expected location: $ApkPath" -ForegroundColor Yellow
    Write-Host "Please build the APK first using: npm run tauri android build`n" -ForegroundColor Yellow
    Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
    Read-Host
    exit 1
}

$apkSize = (Get-Item $ApkPath).Length / 1MB
Write-Host "Found unsigned APK ($([math]::Round($apkSize, 2)) MB)" -ForegroundColor Green

# Find apksigner (newer, better tool that supports V2 signatures)
$apksigner = $null
$zipalign = $null

if ($env:ANDROID_HOME) {
    $buildTools = Get-ChildItem -Path "$env:ANDROID_HOME\build-tools" -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if ($buildTools) {
        $apksigner = Join-Path $buildTools.FullName "apksigner.bat"
        $zipalign = Join-Path $buildTools.FullName "zipalign.exe"
    }
}

$AlignedApk = Join-Path (Split-Path $ApkPath) "app-aligned.apk"
$FinalApk = Join-Path (Split-Path $ApkPath) "BYM Refitted.apk"

if ($apksigner -and (Test-Path $apksigner)) {
    Write-Host "`nUsing modern apksigner (V1 + V2 signatures)..." -ForegroundColor Cyan
    
    # Step 1: Zipalign FIRST (required before apksigner)
    if ($zipalign -and (Test-Path $zipalign)) {
        Write-Host "Step 1: Optimizing with zipalign..." -ForegroundColor Cyan
        & $zipalign -v -p 4 $ApkPath $AlignedApk
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "zipalign failed!" -ForegroundColor Red
            Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
            Read-Host
            exit 1
        }
    }
    else {
        Write-Host "zipalign not found - skipping optimization (not recommended)" -ForegroundColor Yellow
        Copy-Item $ApkPath $AlignedApk -Force
    }
    
    # Step 2: Sign with apksigner (V1 + V2)
    Write-Host "Step 2: Signing with apksigner (V1 + V2 signatures)..." -ForegroundColor Cyan
    & $apksigner sign --ks $KeystorePath --ks-key-alias $KeyAlias --out $FinalApk $AlignedApk
    
    if ($LASTEXITCODE -eq 0) {
        # Verify
        Write-Host "Step 3: Verifying signatures..." -ForegroundColor Cyan
        & $apksigner verify --verbose $FinalApk
        
        if ($LASTEXITCODE -eq 0) {
            # Clean up temp file
            if (Test-Path $AlignedApk) {
                Remove-Item $AlignedApk -Force
            }
            
            $apkSize = (Get-Item $FinalApk).Length / 1MB
            Write-Host "`nAPK signed successfully with V1 + V2 signatures!" -ForegroundColor Green
            Write-Host "Final APK: BYM Refitted.apk" -ForegroundColor Green
            Write-Host "Location: $FinalApk" -ForegroundColor Gray
            Write-Host "Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Gray
            Write-Host "`nThis APK should install on all Android devices!`n" -ForegroundColor Green
        }
        else {
            Write-Host "Signature verification failed!" -ForegroundColor Red
            Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
            Read-Host
            exit 1
        }
    }
    else {
        Write-Host "apksigner failed!" -ForegroundColor Red
        Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
        Read-Host
        exit 1
    }
}
else {
    Write-Host "`napksigner not found - falling back to jarsigner (V1 only, may not work on modern Android)" -ForegroundColor Yellow
    Write-Host "Set ANDROID_HOME environment variable to use apksigner" -ForegroundColor Yellow
    
    # Fallback to old method - just copy and warn
    Copy-Item $ApkPath $FinalApk -Force
    
    $apkSize = (Get-Item $FinalApk).Length / 1MB
    Write-Host "`nAPK copied (unsigned)" -ForegroundColor Yellow
    Write-Host "Final APK: BYM Refitted.apk" -ForegroundColor Yellow
    Write-Host "Location: $FinalApk" -ForegroundColor Gray
    Write-Host "Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Gray
    Write-Host "`nWARNING: This APK is NOT signed properly! Install Android SDK build-tools to use apksigner!`n" -ForegroundColor Red
}

Write-Host "`nDone! Press Enter to exit..." -ForegroundColor Green
Read-Host
