declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login
     * @example cy.login()
     */
    login(): Chainable<void>;
  }
}
