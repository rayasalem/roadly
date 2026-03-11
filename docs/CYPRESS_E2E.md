# Cypress E2E Tests

End-to-end tests for the web build of the app (Expo web). Run against `http://localhost:8082` (or set `baseUrl` in `cypress.config.ts`).

## Folder structure

```
cypress/
├── e2e/
│   ├── auth.cy.ts       # Login success/failure, Register, Logout
│   ├── map.cy.ts        # Map loading, providers API, provider bottom sheet
│   ├── dashboards.cy.ts # Navigation between role dashboards (mock login)
│   ├── admin.cy.ts      # Admin user list, edit user sheet, save
│   ├── profile.cy.ts    # Profile service editing (Add service sheet, save/cancel)
│   ├── user-flow.cy.ts  # (legacy) smoke
│   └── admin-panel.cy.ts# (legacy) admin smoke
├── fixtures/
│   └── auth.json        # Sample credentials and API responses
├── support/
│   ├── e2e.ts           # Loads commands
│   └── commands.ts      # Custom commands (visitApp, fillLogin, loginByApi, etc.)
└── (config: cypress.config.ts at project root)
```

## Requirements

1. **Web app running**  
   Start the app on the same port as `baseUrl` in `cypress.config.ts` (default `8082`):

   ```bash
   npx expo start --web --port 8082 --offline
   ```

2. **Install dependencies**  
   Cypress is in `devDependencies`. If missing:

   ```bash
   npm install
   ```

## Run tests

- **Interactive (Cypress UI):**  
  `npm run cypress:open`  
  Choose E2E, pick a browser, then run one or all specs.

- **Headless:**  
  `npm run cypress:run`  
  Runs all specs and exits with the appropriate code.

- **Single spec:**  
  `npx cypress run --spec cypress/e2e/auth.cy.ts`

## Test flows covered

| Flow | Spec | Notes |
|------|------|--------|
| Login success | auth.cy.ts | Intercepts POST /auth/login, fills form, asserts redirect |
| Login failure | auth.cy.ts | 401 response, asserts error element visible |
| Register | auth.cy.ts | Intercepts POST /auth/register, submits form |
| Logout | auth.cy.ts | Login then Profile → Log out, intercepts /auth/logout |
| Map loading | map.cy.ts | Mock User login, navigate to Map, assert content |
| Providers loading | map.cy.ts | Intercepts GET /providers/nearby, waits for response |
| Provider bottom sheet | map.cy.ts | Clicks provider or "Request service", asserts sheet content |
| Dashboards navigation | dashboards.cy.ts | Mock login as Mechanic/Tow/Rental/Admin, assert dashboard text |
| Admin user editing | admin.cy.ts | Admin login → Manage users → open edit sheet → Save |
| Profile service editing | profile.cy.ts | Mechanic login → Profile → Add service → toggle → Save/Cancel |

## Selectors

- **data-testid:** Used where added in the app (e.g. `login-email`, `login-submit`, `profile-add-service`). React Native Web exposes `testID` as `data-testid` on the DOM.
- **Role + text:** `cy.get('[role="button"]').contains(/Sign in/i)` for buttons.
- **Intercepts:** `cy.intercept('POST', '**/auth/login', ...)` to stub API and wait with `cy.wait('@login')`.

## Best practices

- Use `cy.intercept()` for auth and providers so tests don’t depend on a real backend.
- Use `cy.wait('@alias')` after actions that trigger the request.
- Prefer `data-testid` for critical elements (auth, profile, admin) to avoid i18n and layout changes.
- Viewport is set to 390x844 in config to approximate a mobile web layout.
