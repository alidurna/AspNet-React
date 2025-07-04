/**
 * UI Commands for Cypress
 */

/// <reference types="cypress" />

// Basic UI interaction commands
Cypress.Commands.add("checkElementVisible", (selector) => {
  cy.get(selector).should("be.visible");
});

Cypress.Commands.add("clickAndWait", (selector) => {
  cy.get(selector).click();
  cy.wait(500); // Small delay for UI updates
});
