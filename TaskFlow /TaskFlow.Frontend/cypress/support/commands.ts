/**
 * Cypress Commands - TaskFlow Application
 *
 * Custom commands for E2E testing
 */

/// <reference types="cypress" />

// ===== AUTHENTICATION COMMANDS =====

Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="submit-button"]').click();

  // Wait for successful login
  cy.url().should("not.include", "/login");
});

Cypress.Commands.add("loginAsTestUser", () => {
  cy.login("test@taskflow.com", "Test123!");
});

Cypress.Commands.add("logout", () => {
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="logout-button"]').click();

  // Wait for logout
  cy.url().should("include", "/login");
});

// ===== TASK MANAGEMENT COMMANDS =====

Cypress.Commands.add("createTask", (title, description) => {
  cy.get('[data-cy="create-task-button"]').click();
  cy.get('[data-cy="task-title"]').type(title);

  if (description) {
    cy.get('[data-cy="task-description"]').type(description);
  }

  cy.get('[data-cy="submit-button"]').click();

  // Wait for task to be created
  cy.contains(title).should("be.visible");
});

Cypress.Commands.add("deleteTask", (taskTitle) => {
  cy.contains(taskTitle).parent().find('[data-cy="delete-button"]').click();
  cy.get('[data-cy="confirm-delete"]').click();

  // Wait for task to be deleted
  cy.contains(taskTitle).should("not.exist");
});

// ===== UTILITY COMMANDS =====

Cypress.Commands.add("waitForLoading", () => {
  cy.get('[data-cy="loading-spinner"]').should("not.exist");
  cy.get('[data-cy="loading"]').should("not.exist");
});

Cypress.Commands.add("clearAppData", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// ===== FORM COMMANDS =====

Cypress.Commands.add("fillForm", (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-cy="${field}"]`).type(value);
  });
});

// ===== NAVIGATION COMMANDS =====

Cypress.Commands.add("navigateToPage", (page) => {
  const pages = {
    dashboard: "/dashboard",
    tasks: "/tasks",
    categories: "/categories",
    profile: "/profile",
  };

  const path = pages[page.toLowerCase()];
  if (path) {
    cy.visit(path);
  } else {
    cy.visit(`/${page}`);
  }
});
