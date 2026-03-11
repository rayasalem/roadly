import { BasePage } from './BasePage';

/**
 * Page object for Profile screen: logout, etc.
 */
export class ProfilePage extends BasePage {
  getLogoutButton() {
    return cy.get(this.getByTestId('profile-logout'));
  }

  clickLogout() {
    this.getLogoutButton().click();
    return this;
  }

  expectProfileScreen() {
    return cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return /Profile|الملف|Logout|تسجيل الخروج/i.test(t);
    });
  }
}
