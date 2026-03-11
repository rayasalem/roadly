import { BasePage } from './BasePage';

/**
 * Page object for Admin: dashboard, AdminUsers, edit user role.
 */
export class AdminPage extends BasePage {
  /** "Manage users" card that navigates to AdminUsers */
  getManageUsersCard() {
    return cy.get(this.getByTestId('admin-manage-users'));
  }

  openAdminUsers() {
    this.getManageUsersCard().click();
    return this;
  }

  /** First user card in the list */
  getFirstUserCard() {
    return cy.get(this.getByTestId('admin-user-card-first'));
  }

  getEditUserButton() {
    return cy.get(this.getByTestId('admin-user-edit'));
  }

  openFirstUserEdit() {
    this.getFirstUserCard().click();
    return this;
  }

  /** Role chip in edit sheet: user, mechanic, tow, rental, admin */
  getRoleChip(role: string) {
    return cy.get(this.getByTestId(`admin-role-${role}`));
  }

  setRole(role: string) {
    this.getRoleChip(role).click();
    return this;
  }

  getSheetSaveButton() {
    return cy.get(this.getByTestId('admin-sheet-save'));
  }

  getSheetCancelButton() {
    return cy.get(this.getByTestId('admin-sheet-cancel'));
  }

  saveUserEdit() {
    this.getSheetSaveButton().click();
    return this;
  }

  cancelUserEdit() {
    this.getSheetCancelButton().click();
    return this;
  }

  expectAdminUsersScreen() {
    return cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return /Manage users|إدارة المستخدمين|Users list|قائمة المستخدمين/i.test(t);
    });
  }

  expectEditSheetOpen() {
    return cy.get(this.getByTestId('admin-sheet-save')).should('be.visible');
  }
}
