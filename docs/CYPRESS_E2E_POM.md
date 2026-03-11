# Cypress E2E Tests (Page Object Model)

## Folder structure

```
cypress/
├── e2e/                    # Test specs by feature
│   ├── auth.cy.ts          # Authentication: login success/failure, register success
│   ├── navigation.cy.ts    # Navigation: Home→Map, Map→Request, Profile→Logout
│   ├── request.cy.ts      # Request flow: create request, update status
│   ├── map.cy.ts          # Map: open provider bottom sheet, request service
│   └── admin.cy.ts        # Admin: open AdminUsers, edit user role
├── pages/                  # Page Object Model
│   ├── BasePage.ts        # Base class (getByTestId / data-testid)
│   ├── AuthPage.ts        # Launch, Login, Register
│   ├── HomePage.ts        # Home, open Map card
│   ├── MapPage.ts         # Map, request service, bottom sheet
│   ├── RequestPage.ts     # Create request, status buttons
│   ├── ProfilePage.ts     # Profile, logout
│   ├── AdminPage.ts       # Admin dashboard, AdminUsers, edit user
│   └── index.ts           # Barrel export
├── fixtures/
│   └── auth.json          # Fixture data for auth
├── support/
│   ├── e2e.ts             # Support file (loads commands)
│   └── commands.ts        # Custom commands (visitApp, fillLogin, getByTestId, etc.)
└── (cypress.config.ts at project root)
```

## data-testid selectors used

Selectors are set in the app and used by page objects:

| Screen / Component   | testID                         | Purpose                          |
|----------------------|--------------------------------|----------------------------------|
| Home                 | `home-open-map`                | Card to navigate to Map          |
| Login                | `login-email`, `login-password`, `login-submit`, `login-error` | Login form |
| Register             | `register-name`, `register-email`, `register-password`, `register-submit`, `register-error` | Register form |
| Map                  | `map-request-service`          | Request Service in bottom card    |
| ProviderBottomSheet  | `map-sheet-request-service`    | Request Service in sheet          |
| Request              | `request-create`, `request-status-accepted`, `request-status-on-the-way`, `request-status-completed`, `request-status-cancelled` | Create and status |
| Profile              | `profile-logout`               | Logout button                    |
| Admin Dashboard      | `admin-manage-users`           | Navigate to Admin Users           |
| Admin Users          | `admin-user-card-first`, `admin-user-edit`, `admin-role-*`, `admin-sheet-save`, `admin-sheet-cancel` | User list and edit sheet |

## Running tests

```bash
# Open Cypress UI
npm run cypress:open

# Headless run
npm run cypress:run
```

Ensure the app is running (e.g. `npm run web`) with `baseUrl` in `cypress.config.ts` (e.g. `http://localhost:8082`).

## Test coverage by feature

- **Authentication**: Login success, login failure (API + empty fields), register success.
- **Navigation**: Home → Map, Map → Request (with providers), Profile → Logout.
- **Request flow**: Create request (POST intercept), update status (PATCH intercept).
- **Map**: Open provider bottom sheet, Request Service from card and from sheet.
- **Admin**: Open AdminUsers, edit first user (open sheet, set role, save), cancel edit.

All tests use the Page Object Model and `data-testid` where available; otherwise role/text selectors.
