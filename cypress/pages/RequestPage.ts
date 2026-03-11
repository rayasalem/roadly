import { BasePage } from './BasePage';

/**
 * Page object for Request screen: create request, update status.
 */
export class RequestPage extends BasePage {
  getCreateButton() {
    return cy.get(this.getByTestId('request-create'));
  }

  getStatusAcceptedButton() {
    return cy.get(this.getByTestId('request-status-accepted'));
  }

  getStatusOnTheWayButton() {
    return cy.get(this.getByTestId('request-status-on-the-way'));
  }

  getStatusCompletedButton() {
    return cy.get(this.getByTestId('request-status-completed'));
  }

  getStatusCancelledButton() {
    return cy.get(this.getByTestId('request-status-cancelled'));
  }

  clickCreateRequest() {
    this.getCreateButton().click();
    return this;
  }

  clickStatusAccepted() {
    this.getStatusAcceptedButton().click();
    return this;
  }

  clickStatusOnTheWay() {
    this.getStatusOnTheWayButton().click();
    return this;
  }

  clickStatusCompleted() {
    this.getStatusCompletedButton().click();
    return this;
  }

  expectRequestScreen() {
    return cy.get('body').should('contain.text', 'Service type').or('contain.text', 'نوع الخدمة');
  }
}
