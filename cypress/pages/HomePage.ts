import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  getOpenMapCard() {
    return cy.get(this.getByTestId('home-open-map'));
  }

  goToMap() {
    this.getOpenMapCard().click();
    return this;
  }

  goToProfile() {
    return cy.contains(/Profile|الملف/i).first().click({ force: true });
  }
}
