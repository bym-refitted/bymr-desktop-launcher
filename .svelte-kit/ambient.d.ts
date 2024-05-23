
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const RUST_RECURSION_COUNT: string;
	export const USER: string;
	export const npm_config_user_agent: string;
	export const TAURI_DEBUG: string;
	export const GIT_ASKPASS: string;
	export const npm_node_execpath: string;
	export const LD_LIBRARY_PATH: string;
	export const RUSTUP_TOOLCHAIN: string;
	export const SHLVL: string;
	export const TAURI_PLATFORM_VERSION: string;
	export const npm_config_noproxy: string;
	export const HOME: string;
	export const OLDPWD: string;
	export const TERM_PROGRAM_VERSION: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const npm_package_json: string;
	export const TAURI_ARCH: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const SSL_CERT_FILE: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_config_userconfig: string;
	export const npm_config_local_prefix: string;
	export const TAURI_PLATFORM_TYPE: string;
	export const COLORTERM: string;
	export const WSL_DISTRO_NAME: string;
	export const COLOR: string;
	export const WAYLAND_DISPLAY: string;
	export const LOGNAME: string;
	export const NAME: string;
	export const PULSE_SERVER: string;
	export const TAURI_FAMILY: string;
	export const WSL_INTEROP: string;
	export const _: string;
	export const npm_config_prefix: string;
	export const npm_config_npm_version: string;
	export const USER_ZDOTDIR: string;
	export const TERM: string;
	export const npm_config_cache: string;
	export const RUSTUP_HOME: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const XDG_RUNTIME_DIR: string;
	export const DISPLAY: string;
	export const SSL_CERT_DIR: string;
	export const TAURI_PLATFORM: string;
	export const LANG: string;
	export const MACOSX_DEPLOYMENT_TARGET: string;
	export const VSCODE_INJECTION: string;
	export const TERM_PROGRAM: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_lifecycle_script: string;
	export const SHELL: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const CARGO: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const PWD: string;
	export const npm_execpath: string;
	export const CARGO_HOME: string;
	export const TAURI_TARGET_TRIPLE: string;
	export const ZDOTDIR: string;
	export const npm_config_global_prefix: string;
	export const npm_command: string;
	export const HOSTTYPE: string;
	export const WSL2_GUI_APPS_ENABLED: string;
	export const WSLENV: string;
	export const INIT_CWD: string;
	export const EDITOR: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		RUST_RECURSION_COUNT: string;
		USER: string;
		npm_config_user_agent: string;
		TAURI_DEBUG: string;
		GIT_ASKPASS: string;
		npm_node_execpath: string;
		LD_LIBRARY_PATH: string;
		RUSTUP_TOOLCHAIN: string;
		SHLVL: string;
		TAURI_PLATFORM_VERSION: string;
		npm_config_noproxy: string;
		HOME: string;
		OLDPWD: string;
		TERM_PROGRAM_VERSION: string;
		VSCODE_IPC_HOOK_CLI: string;
		npm_package_json: string;
		TAURI_ARCH: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		SSL_CERT_FILE: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_config_userconfig: string;
		npm_config_local_prefix: string;
		TAURI_PLATFORM_TYPE: string;
		COLORTERM: string;
		WSL_DISTRO_NAME: string;
		COLOR: string;
		WAYLAND_DISPLAY: string;
		LOGNAME: string;
		NAME: string;
		PULSE_SERVER: string;
		TAURI_FAMILY: string;
		WSL_INTEROP: string;
		_: string;
		npm_config_prefix: string;
		npm_config_npm_version: string;
		USER_ZDOTDIR: string;
		TERM: string;
		npm_config_cache: string;
		RUSTUP_HOME: string;
		npm_config_node_gyp: string;
		PATH: string;
		NODE: string;
		npm_package_name: string;
		XDG_RUNTIME_DIR: string;
		DISPLAY: string;
		SSL_CERT_DIR: string;
		TAURI_PLATFORM: string;
		LANG: string;
		MACOSX_DEPLOYMENT_TARGET: string;
		VSCODE_INJECTION: string;
		TERM_PROGRAM: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_lifecycle_script: string;
		SHELL: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		CARGO: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		PWD: string;
		npm_execpath: string;
		CARGO_HOME: string;
		TAURI_TARGET_TRIPLE: string;
		ZDOTDIR: string;
		npm_config_global_prefix: string;
		npm_command: string;
		HOSTTYPE: string;
		WSL2_GUI_APPS_ENABLED: string;
		WSLENV: string;
		INIT_CWD: string;
		EDITOR: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
