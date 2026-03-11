/// <reference types="cypress" />

/**
 * Base page object. All pages extend this for consistent getByTestId and visit.
 */
export abstract class BasePage {
  /** Selector for data-testid (React Native Web exposes testID as data-testid) */
  protected getByTestId(id: string): string {
    return `[data-testid="${id}"]`;
  }

  /** Get element by test id */
  protected selector(testId: string): string {
    return this.getByTestId(testId);
  }
}
