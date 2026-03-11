import { BasePage } from './BasePage';

/**
 * Page object for Map screen: providers, bottom card, bottom sheet.
 */
export class MapPage extends BasePage {
  /** Request Service button in the bottom info card (nearest provider) */
  getRequestServiceButton() {
    return cy.get(this.getByTestId('map-request-service'));
  }

  /** Request Service button inside the provider bottom sheet */
  getSheetRequestServiceButton() {
    return cy.get(this.getByTestId('map-sheet-request-service'));
  }

  clickRequestService() {
    this.getRequestServiceButton().click();
    return this;
  }

  clickSheetRequestService() {
    this.getSheetRequestServiceButton().click();
    return this;
  }

  /** Body should contain map-related text (Request service, Open map, provider name, etc.) */
  expectMapContent() {
    return cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return /Request service|Open map|Nearest|Get direction|طلب خدمة/i.test(t);
    });
  }

  /** Click a provider name or "Request service" to open bottom sheet */
  openProviderBottomSheet(providerName?: string) {
    if (providerName) {
      cy.contains(providerName).first().click({ force: true });
    } else {
      cy.contains(/Request service|طلب خدمة/i).first().click({ force: true });
    }
    return this;
  }
}
