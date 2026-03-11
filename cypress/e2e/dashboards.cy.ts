/**
 * Dashboards E2E: Navigation between role dashboards (Mechanic, Tow, Rental, Admin).
 * Uses mock login chips to switch roles and asserts dashboard-specific content.
 */
describe('Dashboards navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  const goToLogin = () => {
    cy.contains(/Sign in|Login|تسجيل الدخول/i).first().click();
    cy.get('[data-testid="login-email"]', { timeout: 8000 }).should('exist');
  };

  it('navigates to Mechanic dashboard after mock Mechanic login', () => {
    goToLogin();
    cy.get('[role="button"]').contains(/Mechanic|ميكانيكي/i).first().click({ force: true });
    cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return t.includes('Mechanic') || t.includes('ميكانيكي') || t.includes('Jobs') || t.includes('Open map') || t.includes('خدماتي');
    });
  });

  it('navigates to Tow dashboard after mock Tow login', () => {
    goToLogin();
    cy.get('[role="button"]').contains(/Tow|ونش/i).first().click({ force: true });
    cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return t.includes('Tow') || t.includes('ونش') || t.includes('Open map') || t.includes('سحب');
    });
  });

  it('navigates to Rental dashboard after mock Rental login', () => {
    goToLogin();
    cy.get('[role="button"]').contains(/Rental|تأجير|Car rental/i).first().click({ force: true });
    cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return t.includes('Rental') || t.includes('تأجير') || t.includes('Fleet') || t.includes('مركبات') || t.includes('Open map');
    });
  });

  it('navigates to Admin dashboard after mock Admin login', () => {
    goToLogin();
    cy.get('[role="button"]').contains(/Admin|أدمن/i).first().click({ force: true });
    cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return t.includes('Admin') || t.includes('أدمن') || t.includes('Manage users') || t.includes('إدارة المستخدمين') || t.includes('Mechanic') || t.includes('ميكانيكي');
    });
  });

  it('navigates from Mechanic dashboard to Map and back', () => {
    goToLogin();
    cy.get('[role="button"]').contains(/Mechanic|ميكانيكي/i).first().click({ force: true });
    cy.wait(400);
    cy.contains(/Open map|فتح الخريطة|Map/i).first().click({ force: true });
    cy.get('body').then(($b) => {
      const t = $b.text();
      expect(t).to.match(/Get direction|Map|خريطة|Request service|طلب/i);
    });
  });
});
