# Mixi Config UI — Ant Design Pro Migration

## Outcome

`mixi-config-ui` is migrated from PrimeReact/Sakai UI primitives to the Ant
Design implementation provided by `@w-iris/react`. Routes, authentication,
authorization, API contracts, React Query keys, and React Hook Form payloads
remain unchanged.

The visual direction is **precision utility**: a restrained admin canvas,
compact navigation, clear operational scope, soft card geometry, and one
primary action per task. The local `ant-design-pro` repository is a composition
reference only; Umi runtime code and demo assets are not copied into Next.js.

## Architecture boundary

```text
Next.js route
  -> feature orchestration and server-state hooks
  -> product UI adapter
  -> @w-iris/react
  -> Ant Design / Pro Components
```

- `src/app` owns route composition, providers, metadata, and route states.
- `src/features/config-center` owns config-center behavior and API mutations.
- `src/components/ui/antd-adapter.tsx` is a temporary compatibility boundary
  for legacy-shaped props while each feature adopts native Ant Design props.
- `MixiAdminShell`, `AdminUserMenu`, and `MixiAccountPages` remain owned by
  `@w-iris/react`; the application must not fork their markup.
- Browser auth storage and API authorization are unchanged in this UI migration.

## Component mapping

| Previous UI                   | Target implementation                | Notes                                               |
| ----------------------------- | ------------------------------------ | --------------------------------------------------- |
| `WPrimeProvider`              | `AntdProvider`                       | English Ant locale and shared theme tokens          |
| Sakai shell                   | `MixiAdminShell`                     | Typed menu and active-route behavior preserved      |
| Prime user overlay            | `AdminUserMenu`                      | Profile, settings, security, and logout preserved   |
| Prime account pages           | `MixiAccountPages`                   | New Ant Design profile/settings/security pages      |
| `Button`                      | adapter -> `AntdButton`              | Ant icons and pending state                         |
| `Dropdown`                    | adapter -> `AntdSelect`              | Existing `{ value }` callback preserved temporarily |
| `InputText` / `InputTextarea` | `AntdInput` / `AntdTextArea`         | RHF registration preserved                          |
| `Dialog`                      | `AntdModal`                          | Existing visibility contract preserved temporarily  |
| `DataTable` / `Column`        | Ant table wrapper in `@w-iris/react` | Row keys and pagination preserved                   |
| Prime skeleton                | Ant Design skeleton adapter          | Final-geometry placeholders preserved               |
| PrimeIcons                    | `@ant-design/icons`                  | No icon-font runtime dependency                     |

## Delivery plan and status

### Phase 0 — Baseline and safety

- [x] Preserve routes, API contracts, auth behavior, test IDs, and query keys.
- [x] Record rollback procedure in `backup-runbook.md`.
- [ ] Push the documented backup branch and immutable tag before production rollout.
- [ ] Capture approved desktop and mobile baseline screenshots in the release PR.

### Phase 1 — Dependency and provider migration

- [x] Upgrade to `@w-iris/react` 0.2.1.
- [x] Add compatible Ant Design, icons, and Pro Components dependencies.
- [x] Replace `WPrimeProvider` with `AntdProvider`.
- [x] Set the document language and component locale to English.
- [x] Remove `@w-iris/themes`, PrimeReact, PrimeFlex, and PrimeIcons dependencies.

### Phase 2 — Shared shell and account experience

- [x] Use `MixiAdminShell` as the only authenticated shell.
- [x] Use `AdminUserMenu` and shared account menu items.
- [x] Use shared profile, settings, and security pages.
- [x] Expose `/profile`, `/settings`, and `/security` aliases without duplicating
      shared account UI.
- [x] Remove the unused local Sakai shell implementation.
- [ ] Add browser assertions for account navigation and mobile sider behavior.

### Phase 3 — Config Center vertical slice

- [x] Migrate dashboard selectors, search, action buttons, and skeletons.
- [x] Migrate project/service/environment tables.
- [x] Migrate entity and ENV import dialogs.
- [x] Migrate service config detail, inline save, bulk edit, and row actions.
- [x] Migrate runtime guide and history actions.
- [ ] Replace the temporary prop-compatible adapter with native Ant props as a
      follow-up refactor after functional acceptance.

### Phase 4 — Verification and rollout

- [x] Lint, typecheck, unit tests, UI audit, and production build pass.
- [x] Chromium desktop and mobile login journeys pass.
- [ ] No hydration warning, console error, clipped action, or horizontal page overflow.
- [ ] Preview deployment is approved before production promotion.

## State and data policy

- React Query remains the owner of server state. Existing query keys and
  invalidation behavior are retained.
- React Hook Form remains the owner of dialog form state and validation.
- URL/route state remains the owner of the selected config-center/account view.
- Local state is limited to transient UI behavior such as dialogs, draft values,
  pending row IDs, and responsive navigation.
- Mutations continue to disable or deduplicate unsafe repeated submissions.

## Accessibility and responsive acceptance

- All fields retain visible labels or accessible names.
- Icon-only buttons require an accessible name and visible focus state.
- Dialogs use the Ant Design focus trap and Escape behavior.
- Loading skeletons match the table, scope header, and runtime panel geometry.
- Validate widths at 320, 375, 768, 1024, and wide desktop viewports.
- Primary actions must remain reachable without horizontal page scrolling.

## Release and rollback

Release the migration as one immutable preview artifact, then promote that same
artifact after acceptance. Abort rollout for auth regressions, mutation errors,
hydration failures, missing mobile actions, or critical E2E failures.

Prefer reverting the migration pull request. If a full code rollback is needed,
follow `backup-runbook.md`; never force-reset `main` directly.

## Known dependency follow-up

Non-breaking overrides pin patched `postcss` and `path-to-regexp` releases.
The remaining Next.js 14 audit advisory cannot be resolved inside the current
Next.js 14/React 18 migration boundary; npm proposes a breaking upgrade to
Next.js 16. Track that framework upgrade separately and do not use
`npm audit fix --force` in this migration.

## Verification commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run standards:check
```
