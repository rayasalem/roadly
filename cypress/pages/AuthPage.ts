/// <reference types="cypress" />
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  goToLogin() {
    return cy.contains(/Sign in|Login/i).first().click();
  }

  goToRegister() {
    return cy.contains(/Create account|Register/i).first().click();
  }

  getEmailInput() {
    return cy.get(this.getByTestId('login-email'));
  }

  getPasswordInput() {
    return cy.get(this.getByTestId('login-password'));
  }

  getLoginSubmit() {
    return cy.get(this.getByTestId('login-submit'));
  }

  getLoginError() {
    return cy.get(this.getByTestId('login-error'));
  }

  fillLogin(email: string, password: string) {
    this.getEmailInput().clear().type(email);
    this.getPasswordInput().clear().type(password);
    return this;
  }

  submitLogin() {
    this.getLoginSubmit().click();
    return this;
  }

  login(email: string, password: string) {
    this.fillLogin(email, password);
    this.submitLogin();
    return this;
  }

  getNameInput() {
    return cy.get(this.getByTestId('register-name'));
  }

  getRegisterEmailInput() {
    return cy.get(this.getByTestId('register-email'));
  }

  getRegisterPasswordInput() {
    return cy.get(this.getByTestId('register-password'));
  }

  getRegisterSubmit() {
    return cy.get(this.getByTestId('register-submit'));
  }

  getRegisterError() {
    return cy.get(this.getByTestId('register-error'));
  }

  fillRegister(name: string, email: string, password: string) {
    this.getNameInput().clear().type(name);
    this.getRegisterEmailInput().clear().type(email);
    this.getRegisterPasswordInput().clear().type(password);
    return this;
  }

  submitRegister() {
    this.getRegisterSubmit().click();
    return this;
  }

  register(name: string, email: string, password: string) {
    this.fillRegister(name, email, password);
    this.submitRegister();
    return this;
  }

  loginByRole(roleLabel: string) {
    return cy.get('[role="button"]').contains(new RegExp(roleLabel, 'i')).first().click({ force: true });
  }
}
