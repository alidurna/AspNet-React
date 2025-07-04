/**
 * Cypress API Commands
 *
 * API testing and mocking commands
 */

/// <reference types="cypress" />

// ===== API INTERCEPTORS =====

Cypress.Commands.add("interceptAuthAPI", () => {
  // Login API
  cy.intercept("POST", "**/auth/login", {
    fixture: "auth/login-success.json",
  }).as("loginAPI");

  // Register API
  cy.intercept("POST", "**/auth/register", {
    fixture: "auth/register-success.json",
  }).as("registerAPI");

  // Logout API
  cy.intercept("POST", "**/auth/logout", { statusCode: 200 }).as("logoutAPI");
});

Cypress.Commands.add("interceptTasksAPI", () => {
  // Get tasks
  cy.intercept("GET", "**/tasks", { fixture: "tasks/tasks-list.json" }).as(
    "getTasksAPI"
  );

  // Create task
  cy.intercept("POST", "**/tasks", { fixture: "tasks/task-created.json" }).as(
    "createTaskAPI"
  );

  // Update task
  cy.intercept("PUT", "**/tasks/*", { fixture: "tasks/task-updated.json" }).as(
    "updateTaskAPI"
  );

  // Delete task
  cy.intercept("DELETE", "**/tasks/*", { statusCode: 204 }).as("deleteTaskAPI");
});

Cypress.Commands.add("interceptCategoriesAPI", () => {
  // Get categories
  cy.intercept("GET", "**/categories", {
    fixture: "categories/categories-list.json",
  }).as("getCategoriesAPI");

  // Create category
  cy.intercept("POST", "**/categories", {
    fixture: "categories/category-created.json",
  }).as("createCategoryAPI");

  // Delete category
  cy.intercept("DELETE", "**/categories/*", { statusCode: 204 }).as(
    "deleteCategoryAPI"
  );
});

// ===== API TESTING COMMANDS =====

Cypress.Commands.add("testAPIResponse", (alias, expectedStatus = 200) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response?.statusCode).to.equal(expectedStatus);
  });
});

Cypress.Commands.add("testAPIError", (alias, expectedStatus = 400) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response?.statusCode).to.equal(expectedStatus);
  });
});

// ===== MOCK DATA COMMANDS =====

Cypress.Commands.add("mockSuccessfulLogin", () => {
  cy.interceptAuthAPI();
  cy.visit("/login");
  cy.get('[data-cy="email-input"]').type("test@taskflow.com");
  cy.get('[data-cy="password-input"]').type("Test123!");
  cy.get('[data-cy="submit-button"]').click();
  cy.testAPIResponse("@loginAPI");
});

Cypress.Commands.add("mockTasksData", () => {
  cy.interceptTasksAPI();
  cy.interceptCategoriesAPI();
  cy.visit("/dashboard");
  cy.testAPIResponse("@getTasksAPI");
  cy.testAPIResponse("@getCategoriesAPI");
});
