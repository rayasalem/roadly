/**
 * Request flow E2E: create request, update status.
 * Uses Page Object Model (RequestPage).
 */
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
import { RequestPage } from '../pages/RequestPage';

const auth = new AuthPage();
const home = new HomePage();
const map = new MapPage();
const request = new RequestPage();

function loginAndGoToRequest() {
  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: {
      user: { id: '1', name: 'Test', email: 'test@example.com', role: 'user' },
      accessToken: 'token',
      refreshToken: 'refresh',
    },
  }).as('login');
  cy.intercept('GET', '**/providers/nearby*', {
    statusCode: 200,
    body: {
      items: [
        {
          id: 'p1',
          name: 'FastFix',
          role: 'mechanic',
          isAvailable: true,
          location: { latitude: 25.2, longitude: 55.27, lastUpdated: new Date().toISOString() },
          contact: '+971501234567',
        },
      ],
    },
  }).as('nearby');
  auth.goToLogin();
  auth.loginByRole('User');
  cy.wait(500);
  home.goToMap();
  cy.wait('@nearby');
  cy.wait(600);
  map.clickRequestService();
}

describe('Request flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Create request', () => {
    it('creates a request and shows status', () => {
      cy.intercept('POST', '**/requests', {
        statusCode: 201,
        body: {
          id: 'req-1',
          status: 'pending',
          serviceType: 'mechanic',
          createdAt: new Date().toISOString(),
        },
      }).as('createRequest');

      loginAndGoToRequest();
      request.expectRequestScreen();
      request.clickCreateRequest();

      cy.wait('@createRequest');
      cy.get('@createRequest').its('request.body').should('include.keys', 'serviceType', 'origin');
      cy.get('body').should('satisfy', ($el) => {
        const t = $el.text();
        return /pending|Accepted|On the way|Status|الحالة/i.test(t);
      });
    });
  });

  describe('Update status', () => {
    it('updates request status after creation', () => {
      cy.intercept('POST', '**/requests', {
        statusCode: 201,
        body: {
          id: 'req-1',
          status: 'pending',
          serviceType: 'mechanic',
          createdAt: new Date().toISOString(),
        },
      }).as('createRequest');
      cy.intercept('GET', '**/requests/req-1*', {
        statusCode: 200,
        body: {
          id: 'req-1',
          status: 'pending',
          serviceType: 'mechanic',
        },
      }).as('getRequest');
      cy.intercept('PATCH', '**/requests/req-1/status*', {
        statusCode: 200,
        body: {
          id: 'req-1',
          status: 'accepted',
          serviceType: 'mechanic',
        },
      }).as('updateStatus');

      loginAndGoToRequest();
      request.clickCreateRequest();
      cy.wait('@createRequest');
      cy.wait(500);
      request.getStatusAcceptedButton().should('be.visible', { timeout: 5000 }).click();
      cy.wait('@updateStatus');
      cy.get('body').should('satisfy', ($el) => {
        const t = $el.text();
        return /accepted|Accepted|مقبول/i.test(t);
      });
    });
  });
});
