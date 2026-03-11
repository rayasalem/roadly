/// <reference types="cypress" />
/// <reference types="cypress" />
/**
 * Authentication E2E: login success, login failure, register success.
 * Uses Page Object Model (AuthPage).
 */
import { AuthPage } from '../pages';

const auth = new AuthPage();

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login success', () => {
    it('navigates to Login and signs in with valid credentials', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
          accessToken: 'eyJ.test',
          refreshToken: 'refresh.test',
        },
      }).as('login');

      auth.goToLogin();
      auth.fillLogin('test@example.com', 'ValidPass123');
      auth.submitLogin();

      cy.wait('@login');
      cy.get('@login').its('request.body').should('deep.include', { email: 'test@example.com' });
      auth.getEmailInput().should('not.exist');
    });
  });

  describe('Login failure', () => {
    it('shows error when login API fails', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' },
      }).as('loginFail');

      auth.goToLogin();
      auth.fillLogin('wrong@example.com', 'wrong');
      auth.submitLogin();

      cy.wait('@loginFail');
      auth.getLoginError().should('be.visible').and('not.be.empty');
    });

    it('shows error when email or password are empty', () => {
      auth.goToLogin();
      auth.getLoginSubmit().click();
      auth.getLoginError().should('be.visible');
    });
  });

  describe('Register success', () => {
    it('navigates to Register and submits form successfully', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 201,
        body: {
          user: { id: '2', name: 'New User', email: 'new@example.com', role: 'user' },
          accessToken: 'eyJ.new',
          refreshToken: 'refresh.new',
        },
      }).as('register');

      auth.goToRegister();
      auth.fillRegister('New User', 'new@example.com', 'NewPass123');
      auth.submitRegister();

      cy.wait('@register');
      cy.get('@register').its('request.body').should('include.keys', 'name', 'email', 'password');
      auth.getNameInput().should('not.exist');
    });
  });
});
