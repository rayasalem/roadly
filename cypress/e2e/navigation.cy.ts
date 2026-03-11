/**
 * Navigation E2E: Home → Map, Map → Request, Profile → Logout.
 * Uses Page Object Model.
 */
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
import { RequestPage } from '../pages/RequestPage';
import { ProfilePage } from '../pages/ProfilePage';

const auth = new AuthPage();
const home = new HomePage();
const map = new MapPage();
const request = new RequestPage();
const profile = new ProfilePage();

function loginAsUser() {
  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: {
      user: { id: '1', name: 'Test', email: 'test@example.com', role: 'user' },
      accessToken: 'token',
      refreshToken: 'refresh',
    },
  }).as('login');
  auth.goToLogin();
  auth.loginByRole('User');
  cy.wait(500);
}

describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Home → Map', () => {
    it('navigates from Home to Map when opening map card', () => {
      loginAsUser();
      home.goToMap();
      map.expectMapContent();
    });
  });

  describe('Map → Request', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/providers/nearby*', {
        statusCode: 200,
        body: {
          items: [
            {
              id: 'p1',
              name: 'FastFix Garage',
              role: 'mechanic',
              isAvailable: true,
              location: { latitude: 25.2, longitude: 55.27, lastUpdated: new Date().toISOString() },
              contact: '+971501234567',
            },
          ],
        },
      }).as('nearbyProviders');
      loginAsUser();
      home.goToMap();
      cy.wait('@nearbyProviders');
      cy.wait(600);
    });

    it('navigates from Map to Request when tapping Request Service', () => {
      map.getRequestServiceButton().should('be.visible');
      map.clickRequestService();
      request.expectRequestScreen();
    });
  });

  describe('Profile → Logout', () => {
    it('logs out from Profile and returns to auth', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          user: { id: '1', name: 'Test', email: 'test@example.com', role: 'user' },
          accessToken: 'token',
          refreshToken: 'refresh',
        },
      }).as('login');
      cy.intercept('POST', '**/auth/logout', { statusCode: 200 }).as('logout');

      auth.goToLogin();
      auth.loginByRole('User');
      cy.wait(500);

      profile.goToProfile();
      profile.getLogoutButton().should('be.visible', { timeout: 8000 }).click();

      cy.wait('@logout');
      cy.contains(/Sign in|Login/i, { timeout: 5000 }).should('be.visible');
    });
  });
});
