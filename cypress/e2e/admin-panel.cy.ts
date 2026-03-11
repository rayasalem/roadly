// Basic admin panel navigation smoke test on web.

describe('Admin flow — open admin dashboard tabs', () => {
  it('visits app and attempts to open admin dashboard', () => {
    cy.visit('/');

    // Look for any element that looks like an admin entry point
    cy.get('button, [role="button"]')
      .contains(/Admin|أدمن|لوحة التحكم/i)
      .first()
      .click({ force: true });

    // Assert that some admin strings appear if available
    cy.contains(/admin.dashboard.title|لوحة تحكم الأدمن/i);
  });
});

