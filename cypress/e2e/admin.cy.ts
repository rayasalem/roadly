/**
 * Admin E2E: open AdminUsers, edit user role.
 * Uses Page Object Model (AdminPage).
 */
import { AuthPage } from '../pages/AuthPage';
import { AdminPage } from '../pages/AdminPage';

const auth = new AuthPage();
const admin = new AdminPage();

describe('Admin', () => {
  beforeEach(() => {
    cy.visit('/');
    auth.goToLogin();
    auth.loginByRole('Admin');
    cy.wait(600);
  });

  describe('Open AdminUsers', () => {
    it('navigates to Admin Users screen when tapping Manage users', () => {
      admin.getManageUsersCard().should('be.visible').click();
      admin.expectAdminUsersScreen();
    });
  });

  describe('Edit user role', () => {
    it('opens edit sheet for first user and can change role and save', () => {
      admin.openAdminUsers();
      cy.wait(400);
      admin.getFirstUserCard().should('be.visible').click();
      admin.expectEditSheetOpen();
      admin.setRole('mechanic');
      admin.getSheetSaveButton().should('be.visible').click();
      cy.wait(300);
      admin.expectAdminUsersScreen();
    });

    it('opens edit sheet via Edit button and cancels', () => {
      admin.openAdminUsers();
      cy.wait(500);
      admin.getEditUserButton().first().click();
      admin.expectEditSheetOpen();
      admin.getSheetCancelButton().click();
      cy.wait(300);
      admin.expectAdminUsersScreen();
    });
  });
});
