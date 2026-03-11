/**
 * Profile E2E: Profile service editing (provider flow).
 * Logs in as Mechanic (mock), goes to Profile, opens Add service sheet, toggles services, saves.
 */
describe('Profile service editing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains(/Sign in|Login/i).first().click();
    cy.get('[role="button"]').contains(/Mechanic|ميكانيكي/i).first().click({ force: true });
    cy.wait(600);
  });

  it('navigates to Profile from Mechanic dashboard', () => {
    cy.get('body').then(($b) => {
      const profileBtn = $b.find('[role="button"]').filter((_, el) => /Profile|الحساب|shield|account/i.test(el.getAttribute('aria-label') || el.innerText || ''));
      if (profileBtn.length) {
        cy.wrap(profileBtn.first()).click({ force: true });
      } else {
        cy.get('header, [class*="header"]').find('button, [role="button"]').last().click({ force: true });
      }
    });
    cy.wait(400);
    cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return t.includes('My services') || t.includes('خدماتي') || t.includes('Add service') || t.includes('إضافة خدمة') || t.includes('Log out') || t.includes('تسجيل الخروج');
    });
  });

  it('opens Add service sheet and sees service list', () => {
    cy.get('header, [class*="header"]').find('button, [role="button"]').last().click({ force: true });
    cy.wait(500);
    cy.get('[data-testid="profile-add-service"]').click();
    cy.wait(500);
    cy.get('body').should('satisfy', ($el) => {
      const t = $el.text();
      return t.includes('Save') || t.includes('حفظ') || t.includes('Cancel') || t.includes('إلغاء') || t.includes('Tire') || t.includes('Engine') || t.includes('Oil');
    });
  });

  it('toggles a service and saves', () => {
    cy.get('header').find('button, [role="button"]').last().click({ force: true });
    cy.wait(400);
    cy.get('[data-testid="profile-add-service"]').click();
    cy.wait(400);
    cy.get('body').then(($b) => {
      const row = $b.find('[role="button"], [class*="sheet"]').filter((_, el) => /Tire|Engine|Oil|إصلاح|فحص/i.test(el.innerText || ''));
      if (row.length) cy.wrap(row.first()).click({ force: true });
    });
    cy.wait(200);
    cy.get('[data-testid="profile-sheet-save"]').click();
    cy.wait(400);
    cy.get('[data-testid="profile-sheet-save"]').should('not.exist');
  });

  it('cancels edit service sheet without saving', () => {
    cy.get('header').find('button, [role="button"]').last().click({ force: true });
    cy.wait(400);
    cy.get('[data-testid="profile-add-service"]').click();
    cy.wait(400);
    cy.get('[data-testid="profile-sheet-cancel"]').click();
    cy.wait(300);
    cy.get('[data-testid="profile-sheet-cancel"]').should('not.exist');
  });
});
