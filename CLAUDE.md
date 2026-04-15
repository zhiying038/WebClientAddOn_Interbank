# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Orchestration

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use subagents liberally to keep the main context window clean
- After ANY correction from the user, update a lessons file with the pattern
- Write rules for yourself that prevent the same mistake
- Never mark a task complete without proving it works

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Type-check + build
pnpm lint       # ESLint
pnpm format     # Prettier (auto-fix)
```

## Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 8** with React Compiler (`babel-plugin-react-compiler`) — manual `useMemo`/`useCallback` is unnecessary
- **UI5 Web Components React** (`@ui5/webcomponents-react`) for all UI components
- **TanStack Query** (`@tanstack/react-query`) for server state
- **Prettier** + **ESLint** — run `pnpm format` before committing

## Key Conventions

- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports
- `noUnusedLocals` and `noUnusedParameters` are enforced by the TypeScript compiler
- The React Compiler handles memoization automatically — do not add manual `memo`, `useMemo`, or `useCallback` unless there's a specific reason
- `QueryClient` is instantiated once in `main.tsx`; do not create additional instances
- UI5 theme is runtime-switchable via `setTheme()` from `@ui5/webcomponents-base`

## Architecture

This is an **Interbank Add-On** for SAP Business One — a single-screen app that processes interbank payments.

### Two API Clients

The app uses two separate clients that must be initialized in sequence during startup (`App.tsx`):

1. **`sl-client.ts`** (`serviceLayerApi` singleton) — SAP Business One Service Layer (OData/REST). Used for login, fetching API config from `FTAPICONFIG`, and getting the current user.
2. **`api-client.ts`** (`SapApiClient` singleton) — Custom SAP Web API. Initialized with config fetched from Service Layer. Axios-based with Bearer token auth stored in `localStorage` under `"AUTH_TOKEN"`. Auto-retries on 401 with token refresh.
   - Use `SapApiClient.getSapInstance()` in hooks/mutations to get the client — it throws if not initialized (never returns null)
   - Use `SapApiClient.getInstance()` only when you need the nullable form (e.g. `enabled: !!SapApiClient.getInstance()`)

### Startup Sequence

`App.tsx` chains 4 queries (each enabled only after the previous succeeds):
1. Service Layer login → 2. Fetch SAP API config → 3. SAP API login → 4. Get current user

In dev mode (`import.meta.env.DEV`), credentials come from `.env.local`:
```
VITE_SL_BASE_URL, VITE_SL_COMPANY, VITE_SL_USER, VITE_SL_PASSWORD
```

### Data Flow

1. User fills out the interbank posting form (`InterbankScreen.tsx`) — bank, method, date, doc range
2. "Download" opens `PaymentPreview` dialog, which lazily queries payments & errors (only while open)
3. User can edit payment types per-row via `PaymentTypeDialog`
4. "Generate File" calls the mutation → downloads a `.txt`/`.csv` file via `utils/file.ts`
5. Optionally import a feedback file back (shown only if the selected bank supports it)

### Query Conventions

- All TanStack Query logic lives in `src/hooks/` — one file per domain
- Default client config (in `main.tsx`): no retry, no refetch on window focus/mount
- Global query errors show a modal via `QueryCache.onError`
- Mutations show success/error modals using UI5 `Modals` from `@ui5/webcomponents-react`
