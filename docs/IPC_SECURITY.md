# IPC Security

easyS3 uses Electron IPC between the renderer and main process. The renderer must never get direct access to Node.js, `ipcRenderer`, or privileged APIs. This document defines the required pattern for all current and future IPC.

## Architecture

```
Renderer (untrusted)  →  window.api  →  Preload (bridge)  →  Main (handlers)
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Renderer | `src/renderer/` | Call only `window.api.*` methods |
| Preload | `src/preload/index.ts` | Expose a narrow API via `contextBridge` |
| Channels | `src/shared/ipc.ts` | Single source of truth for channel names |
| Validation | `src/shared/settings-validation.ts` | Shared key/value checks |
| Guards | `src/main/ipc-guards.ts` | Trusted sender + argument parsing |
| Handlers | `src/main/ipc/` | `ipcMain.on` / `ipcMain.handle` implementations |

## BrowserWindow defaults

Every `BrowserWindow` must use these `webPreferences` (see `src/main/index.ts`):

- `contextIsolation: true`
- `nodeIntegration: false`
- `nodeIntegrationInWorker: false`
- `sandbox: true`
- `webSecurity: true`
- `preload` pointing at the built preload script

Do not disable these for convenience.

## Preload rules

1. **Expose only curated APIs** on `window.api` using `contextBridge.exposeInMainWorld`.
2. **Never** expose `ipcRenderer`, `process`, `require`, or packages like `@electron-toolkit/preload` that re-export generic IPC.
3. **Require** `process.contextIsolated` — throw at startup if it is disabled (no fallback that assigns to `window` directly).
4. **Whitelist channels** — import names from `src/shared/ipc.ts`; do not use string literals inline.
5. **Validate arguments** in preload before `invoke` / `sendSync` (defense in depth).
6. Prefer `invoke` (async). Use `sendSync` only when necessary (e.g. settings bootstrap before first paint) and only for read-only operations.

## Main-process handler rules

1. Register handlers in `src/main/ipc/` (one file per domain, e.g. `settings-handlers.ts`).
2. Register everything once via `registerIpcHandlers()` from `app.whenReady()`.
3. Call `assertTrustedSender(event)` at the start of every handler.
4. Treat all IPC arguments as `unknown`; parse with helpers in `ipc-guards.ts` or domain validators.
5. Never trust TypeScript types on IPC payloads — they are erased at runtime.
6. Keep handlers thin: validate → delegate to services/store → return serializable data.

## Adding a new IPC capability

1. Add the channel name to `src/shared/ipc.ts`.
2. Add a typed method on the appropriate object in `src/preload/index.ts` and update `src/preload/index.d.ts`.
3. Create or extend a handler file under `src/main/ipc/`.
4. Re-export registration from `src/main/ipc/index.ts` if adding a new domain file.
5. Add validation for any new argument shapes (shared module if used from preload and main).
6. Update this document if the pattern changes.

## Current channels (settings)

| Channel | Type | Purpose |
|---------|------|---------|
| `settings:getAllSync` | `on` + `returnValue` | Read all settings before first paint |
| `settings:getAll` | `handle` | Read all settings (async) |
| `settings:get` | `handle` | Read one setting by key |
| `settings:set` | `handle` | Write one setting (validated) |
| `settings:selectDownloadDirectory` | `handle` | Native folder picker |

## What not to do

- Do not expose `window.electron` or raw `ipcRenderer` to the renderer.
- Do not register handlers in `src/main/index.ts` — use `src/main/ipc/`.
- Do not add debug channels (`ping`, etc.) without the same security checks.
- Do not load remote/untrusted content in the same `webPreferences` profile without a separate security review.
- Do not bypass validation in preload because main “also checks” — both sides must validate.

## References

- [Electron security tutorial](https://www.electronjs.org/docs/latest/tutorial/security)
- [contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
