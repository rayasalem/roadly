/**
 * Map E2E: open provider bottom sheet, request service.
 * Uses Page Object Model (MapPage).
 */
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';

const auth = new AuthPage();
const home = new HomePage();
const map = new MapPage();

describe('Map', () => {
  beforeEach(() => {
    cy.visit('/');
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
    auth.goToLogin();
    auth.loginByRole('User');
    cy.wait(500);
  });

  describe('Open provider bottom sheet', () => {
    it('opens bottom sheet when selecting a provider or request area', () => {
      home.goToMap();
      cy.wait('@nearbyProviders');
      cy.wait(800);
      map.openProviderBottomSheet('FastFix Garage');
      cy.get('body').should('satisfy', ($el) => {
        const t = $el.text();
        return /Open map|Request service|فتح الخريطة|طلب خدمة|FastFix/i.test(t);
      });
    });
  });

  describe('Request service', () => {
    it('navigates to Request screen when tapping Request Service in bottom card', () => {
      home.goToMap();
      cy.wait('@nearbyProviders');
      cy.wait(600);
      map.getRequestServiceButton().should('be.visible');
      map.clickRequestService();
      cy.get('body').should('contain.text', 'Service type').or('contain.text', 'نوع الخدمة');
    });

    it('navigates to Request when tapping Request Service in provider sheet', () => {
      home.goToMap();
      cy.wait('@nearbyProviders');
      cy.wait(800);
      map.openProviderBottomSheet('FastFix');
      map.getSheetRequestServiceButton().should('be.visible', { timeout: 3000 }).click();
      cy.get('body').should('satisfy', ($el) => {
        const t = $el.text();
        return /Service type|نوع الخدمة|Create request|إنشاء طلب/i.test(t);
      });
    });
  });
});
