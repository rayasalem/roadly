/// <reference types="cypress" />

/**
 * Custom Cypress commands for the app.
 * Use data-testid (from React Native testID on web) or role/text when possible.
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /** Go to app root and wait for load */
      visitApp(): Chainable<void>;
      /** Fill login form (no submit) */
      fillLogin(email: string, password: string): Chainable<void>;
      /** Fill register form (no submit) */
      fillRegister(name: string, email: string, password: string): Chainable<void>;
      /** Login via API (intercept) then visit app to get into authenticated state */
      loginByApi(email: string, password: string): Chainable<void>;
      /** Login via mock role chip (no API); use after visiting Login screen */
      loginByMockRole(roleLabel: string): Chainable<void>;
      /** Wait for loading to finish (no spinner / no "Loading" text) */
      waitForLoadingToFinish(): Chainable<void>;
      /** Get by data-testid (RN Web exposes testID as data-testid) */
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('visitApp', () => {
  cy.visit('/');
  cy.get('body').should('be.visible');
});

Cypress.Commands.add('fillLogin', (email: string, password: string) => {
  cy.get('input').first().clear().type(email);
  cy.get('input').eq(1).clear().type(password);
});

Cypress.Commands.add('fillRegister', (name: string, email: string, password: string) => {
  cy.get('[data-testid="register-name"]').clear().type(name);
  cy.get('[data-testid="register-email"]').clear().type(email);
  cy.get('[data-testid="register-password"]').clear().type(password);
});

Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.intercept('POST', '**/auth/login', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        user: { id: '1', name: 'Test', email, role: 'user' },
        accessToken: 'token',
        refreshToken: 'refresh',
      },
    });
  }).as('login');
  cy.visit('/');
  cy.get('[data-testid="login-email"]').clear().type(email);
  cy.get('[data-testid="login-password"]').clear().type(password);
  cy.get('[data-testid="login-submit"]').click();
  cy.wait('@login');
});

Cypress.Commands.add('loginByMockRole', (roleLabel: string) => {
  cy.get('[role="button"]').contains(new RegExp(roleLabel, 'i')).first().click({ force: true });
});

Cypress.Commands.add('waitForLoadingToFinish', () => {
  cy.get('body').should('not.contain.text', 'Loading…');
  cy.get('[data-testid="loading-spinner"]', { timeout: 100 }).should('not.exist');
});

Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

export {};
