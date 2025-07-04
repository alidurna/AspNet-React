/**
 * Authentication Commands for Cypress
 */

/// <reference types="cypress" />

// Simple auth commands without complex typing
Cypress.Commands.add("performLogin", (email, password) => {
  cy.visit("/login");
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="submit-button"]').click();
});

Cypress.Commands.add("performLogout", () => {
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="logout-button"]').click();
});
