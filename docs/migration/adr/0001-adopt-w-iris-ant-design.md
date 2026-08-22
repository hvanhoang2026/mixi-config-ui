# ADR 0001: Adopt the w-iris Ant Design foundation

- Status: Accepted
- Date: 2026-08-22
- Scope: `mixi-config-ui`

## Context

The application used PrimeReact, PrimeFlex, PrimeIcons, a local Sakai-inspired
shell, and an older `@w-iris/react` package. The updated w-iris foundation now
provides Ant Design providers, an Ant Design Pro shell, account pages, forms,
tables, feedback, and shared Mixi navigation patterns.

Maintaining both UI systems increases CSS collisions, bundle size, accessibility
review cost, and visual inconsistency.

## Decision

Use `@w-iris/react` 0.2.x as the shared Mixi UI boundary and Ant Design 5 with
Pro Components as the underlying component stack. Use `MixiAdminShell`,
`AdminUserMenu`, and `MixiAccountPages` directly. Keep a small application-owned
adapter only for temporary prop compatibility during migration.

The local `ant-design-pro` repository is used for information architecture and
interaction references. Its Umi runtime, generated services, language defaults,
and demo assets are not copied into the Next.js application.

## Consequences

- PrimeReact, PrimeFlex, PrimeIcons, and `@w-iris/themes` can be removed.
- Existing route, API, auth, query, and form contracts remain stable.
- Feature CSS must target semantic product classes and Ant Design states.
- The compatibility adapter must not accumulate business logic and should be
  removed incrementally after migration acceptance.
- UI changes require desktop/mobile visual inspection and critical E2E coverage.

## Rollback

Revert the migration pull request or redeploy the previous immutable artifact.
No API or persistence rollback is required because contracts are unchanged.
