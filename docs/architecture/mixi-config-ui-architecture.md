# mixi-config-ui architecture and UI direction

## Product direction

- Audience/job: platform operators manage service configuration safely.
- Tone: precise, calm, operational.
- Hierarchy/layout: persistent service/environment context, focused configuration workspace, responsive stacked panels.
- Typography: compact sans-serif utility text with clear heading scale and readable data values.
- Color/surfaces: neutral canvas, blue action color, semantic success/warning/error states, restrained elevation.
- Motion: short opacity/transform feedback; respect reduced-motion preferences.
- Signature device: the selected service/environment context rail remains visible while editing.

## Route and data boundaries

| Route | Rendering/auth | Data/cache | States |
| --- | --- | --- | --- |
| `/login` | client form; unauthenticated | auth API mutation; no cache | idle/pending/invalid/success |
| `/config-center` | server composition + client feature modules | authenticated config reads; private/no-store | loading/empty/partial/error/denied |
| config API calls | browser client to authenticated service API | explicit invalidation after mutations | saving/saved/failed |

## Architecture and security decisions

- Feature modules own config-center behavior; route files compose screens.
- Auth tokens remain in the existing auth boundary and are never rendered into HTML or public env values.
- Security headers are configured in `next.config.js` and remote data is treated as user/tenant scoped.
- Runtime integration guides are documentation strings only; secrets are represented by placeholders.
- Owner: config platform team. Review date: 2026-10-23.

