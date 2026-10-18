# flash-input

An input scheduling fix for the standalone Windows Flash Player, used to run Backyard Monsters Refitted.

It builds two files that must sit side by side:

| File | Role |
|------|------|
| `bymr-player.exe` | Starts Flash Player and loads the fix into it |
| `bymr_input.dll` | The fix itself, running inside Flash Player |

## The problem

The standalone Flash Player yields to input by setting a zero-delay window timer:

```c
SetTimer(window, 1, 0, NULL);
```

Windows does not honour a zero delay. From the [`SetTimer` documentation](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-settimer):

> If *uElapse* is less than **USER_TIMER_MINIMUM** (0x0000000A), the timeout is set to **USER_TIMER_MINIMUM**.

So every time the player defers, it waits at least 10 ms before it carries on, however little input there was to handle. This is documented Windows behaviour rather than a bug Microsoft will fix, and Flash Player is no longer updated, so the player has to be corrected from the outside.

## The fix

`bymr_input.dll` replaces the player's `SetTimer` and `KillTimer` imports in memory. When it sees that specific timer (ID 1, zero delay, no callback, on the player's `Messaging` window), it:

1. lets the original `SetTimer` call through, so the player's own timer remains as a fallback
2. arms a [high-resolution waitable timer](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createwaitabletimerexw) for 1 ms
3. posts the same `WM_TIMER` to the player when that timer fires

The player receives its wake-up after about 1 ms instead of 10 ms. Every other timer is passed through untouched, and the game SWF is not modified.

The 1 ms delay is deliberate. Posting the message immediately would put it ahead of pending input in the message queue, which is what the player's timer exists to avoid.

## How it gets into the player

`bymr-player.exe` starts Flash Player normally, then:

1. waits for the player's UI thread to be ready
2. installs a `WH_GETMESSAGE` hook on that thread, which makes Windows load the DLL into the player
3. posts a registered message asking the DLL to install the fix
4. waits for the DLL to answer with the result, then removes the hook

The DLL pins itself in memory, so it stays loaded after the hook is removed.

## If the fix cannot be applied

The player is already running by the time the fix is attempted, so the game is never blocked. If the DLL is missing, the player is not 32-bit, Windows is too old, or the install does not answer within 15 seconds, `bymr-player.exe` prints a warning and Flash Player carries on without the fix.

The only fatal error is Flash Player itself failing to start.

## Shipping with the launcher

The Windows launcher bundles both files and starts Flash Player through `bymr-player.exe` (`src-tauri/src/flash_input.rs`):

- **Build:** the Windows CI workflow builds this folder, then bundles both files into `<install dir>/flash-input/` through `src-tauri/tauri.flash-input.conf.json`.
- **Launch:** the launcher starts the wrapper without a console window and shows its output in the launcher's Activity Logs.
- **Fallback:** if the wrapper is missing or fails to start, the launcher starts Flash Player directly.
- **Opt-in switch:** the launcher only uses the fix when the CDN `versionManifest.json` has `"launcherFlashInputFix": true`; `false`, a missing key or an unreachable manifest launch Flash Player directly, without a launcher release.

Output is written with `report!`/`report_error!`, which never panic. The launcher may close the pipe while the game runs, and a panic would abort the wrapper and close Flash Player through the job object.

## Requirements

- Windows 10 version 1803 or later, for high-resolution waitable timers. On older versions the game runs without the fix.
- The 32-bit standalone Flash Player. The DLL and the launcher are 32-bit to match it.

## Building

Requires Rust with the 32-bit MSVC target:

```bash
rustup target add i686-pc-windows-msvc
cargo build --release
```

Run `cargo build` from this folder. `.cargo/config.toml` selects the 32-bit target and links the C runtime statically, so the DLL adds no dependencies to the player.

Output is in `target/i686-pc-windows-msvc/release/`.

## Usage

```bash
bymr-player.exe [--stats] <flashplayer.exe> <game.swf>
```

The second argument is passed to Flash Player unchanged. `bymr-player.exe` stays running until the player exits and returns its exit code. If `bymr-player.exe` is stopped, the player is closed with it.

## Checking that it works

On start, `bymr-player.exe` prints whether the fix was installed:

```
Flash Player PID 5940: input scheduling fix active.
```

That line means the DLL is loaded in the player and its timer imports are replaced. To see the fix acting on the player's timers, pass `--stats`:

```bash
bymr-player.exe --stats <flashplayer.exe> <game.swf>
```

For every second in which the fix woke the player early, it prints a line such as:

```
Input fix: 7 early wake-ups in the last second, player resumed 1.8 ms after deferring on average.
```

Without the fix that average cannot be below 10 ms. Nothing is printed while the player is idle, because it only sets this timer when it has work to defer, so interact with the game while watching the output.

`--stats` is for development. Without it the DLL counts and times nothing, and no reporting thread is started, so leave it off for players. The DLL never writes log files or sends anything over the network; the statistics only travel to the `bymr-player.exe` console that asked for them.

To try it against a local build of the game, with the game server running:

```bash
cargo build --release
target/i686-pc-windows-msvc/release/bymr-player.exe --stats <path to flashplayer.exe> <path to bymr-local.swf>
```

## Layout

```
flash-input/
├── Cargo.toml          workspace root
├── .cargo/config.toml  32-bit target, static C runtime
└── crates/
    ├── protocol/       names both sides agree on: DLL file, hook export, install message
    ├── hook/           bymr_input.dll
    └── player/         bymr-player.exe
```
