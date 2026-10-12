# PalRyz Studio

Original browser-based 3D game editor, built with React, Three.js, Express, and SQLite. All starter assets are procedural geometry; no Roblox artwork or branding is used.

## Run

Node.js 22.13+ required (`node:sqlite`).

```sh
npm install
npm run dev
# http://localhost:3000
```

The server binds to `0.0.0.0:3000`. Browser requests use relative `/api` URLs. Fonts are bundled locally, not fetched from a third-party CDN.

## Included

- Editable woodland starter scene, orbit/pan/zoom camera, selection outlines, transform gizmos, grid snapping.
- Explorer: search, rename, duplicate, delete, visibility, hierarchy drag-and-drop with cycle prevention.
- Live transform, appearance, collision and physics properties; seven materials.
- Procedural asset library with click-to-add and viewport drag/drop.
- Undo/redo, new/open/duplicate/delete projects, JSON import/export.
- SQLite persistence, debounced auto-save, and browser-local recovery **of project data only**.
- Preview player with WASD/arrow keys, jump, mobile controls, follow camera, pause/reset/stop, simple axis-aligned collision and gravity for unanchored parts.
- Script attachment, highlighted Luau text, line numbers, indentation, basic bracket/string checks, output console.
- Block-based terrain tools and a draggable UI layout designer (layouts saved in project JSON).
- Responsive desktop workspace and compact mobile Explorer/Properties drawers.
- Server-side Roblox connection settings and experimental Open Cloud place publishing.

## Honest beta limitations

This is a working mini-studio, **not a full Roblox Studio replacement**.

- No full Lua/Luau interpreter or parser. Run check evaluates only top-level literal string `print`, `warn`, and `error` calls; event callbacks do not execute in-browser. Scripts are saved and can be included in place exports.
- Preview collision is axis-aligned and simplified, not Roblox physics. Terrain actions operate on blocks/the entire baseplate, not a voxel brush.
- UI layouts are visual designs stored in JSON; they are not yet rendered by the preview game or exported as Roblox UI instances.
- Current Roblox XML conversion preserves basic part positions/sizes/colors, anchored/collision flags, transparency, and attached scripts. Complex procedural assets, hierarchy, rotation, lighting and advanced materials are not faithfully converted. Use a **test place**, not a live production place.
- Roblox publish uses a real upstream API request, not simulated success. This sandbox's outbound allowlist excludes `apis.roblox.com`, so external validation/publication cannot succeed here. Deploy somewhere with Roblox API access to test with real credentials.
- Identity is a private anonymous server session, not a login/OAuth account. Projects are isolated per session and are not portable across browsers unless exported. Add account authentication and session migration before multi-device/public production use.

## Security & deployment

`.data/`, `.env`, dependencies and build output are ignored by Git. SQLite project records and AES-256-GCM-encrypted API secrets live in `.data/`. The development encryption key is generated automatically in `.data/key` with mode 0600. Production **requires** `SECRET_ENCRYPTION_KEY` (32 random bytes as 64 hex characters) from the deployment's secret manager.

```sh
npm run build
NODE_ENV=production SECRET_ENCRYPTION_KEY="$YOUR_SECRET_MANAGER_VALUE" node server.js
```

Put Node behind an HTTPS reverse proxy. Production cookies are `Secure`, `HttpOnly`, and `SameSite=Strict`. HTTP-only deployment is unsupported in production. Restrict direct access to Node and trust only your proxy. Proxy host/origin must be preserved. Mount `.data/` on persistent encrypted storage, back it up, and restrict filesystem access. This app does not provision TLS certificates.

API requests require a session CSRF token for writes; CORS is same-origin only. Project reads/writes are scoped to the session owner. Input and body limits, rate limits, and secret-safe upstream error messages are included. Roblox API keys are submitted once over HTTPS, encrypted server-side, and never returned in status responses or stored in localStorage. The password input is cleared after saving. No analytics/third-party key services are used.

`ROBLOX_API_BASE` is a server-only configurable base URL, restricted to `apis.roblox.com` so credentials cannot be sent to an arbitrary host. Read validation and publish routes are centralized in `server.js`; adjust those backend routes if Roblox changes its API. Give keys only the required universe/place read and place-write permissions, with suitable IP restrictions. Rotate keys after suspected exposure.

## API

- `GET /api/session`: anonymous session + CSRF token
- `GET /api/projects`: list own projects
- `POST /api/projects`: create
- `GET /api/projects/:id`: read own project
- `PUT /api/projects/:id`: update own project
- `DELETE /api/projects/:id`: delete own project
- `GET /api/roblox/status`: configured flag and non-secret IDs only
- `POST /api/roblox/settings`: encrypt/save API key + target IDs
- `POST /api/roblox/validate`: validate against Roblox place endpoint
- `POST /api/roblox/publish`: save-to-Roblox place version API, using a project owned by the session

## Tests

Start the dev server, then:

```sh
node tests/api.mjs
node tests/smoke.mjs
npm run build
```

The browser smoke test uses Playwright and npm-distributed Chromium. It checks desktop rendering, adding objects, properties, saving, preview, settings, and mobile overflow. On Linux, install Chromium shared-library dependencies or supply them via `LD_LIBRARY_PATH`. Screenshots go outside the repository to `/home/user/studio-*.png`.

API tests cover CSRF rejection, schema rejection, project CRUD, cross-session ownership isolation, and integration errors. Real Roblox publishing is not covered without external network access and a test key.
