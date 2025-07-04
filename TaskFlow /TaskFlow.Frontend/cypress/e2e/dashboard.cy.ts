/**
 * Dashboard E2E Tests
 *
 * Tests for dashboard functionality and overview
 */

describe("Dashboard", () => {
  beforeEach(() => {
    // Clear state and login before each test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("test@taskflow.com");
    cy.get('[data-cy="password-input"]').type("Test123!");
    cy.get('[data-cy="submit-button"]').click();

    // Navigate to dashboard
    cy.url().should("include", "/dashboard");
  });

  describe("Dashboard Layout", () => {
    it("should display dashboard components", () => {
      cy.get('[data-cy="dashboard-header"]').should("be.visible");
      cy.get('[data-cy="stats-cards"]').should("be.visible");
      cy.get('[data-cy="recent-tasks"]').should("be.visible");
      cy.get('[data-cy="quick-actions"]').should("be.visible");
    });

    it("should show user greeting", () => {
      cy.get('[data-cy="user-greeting"]').should("be.visible");
      cy.get('[data-cy="user-greeting"]').should("contain", "Welcome");
    });
  });

  describe("Statistics Cards", () => {
    it("should display task statistics", () => {
      cy.get('[data-cy="total-tasks-stat"]').should("be.visible");
      cy.get('[data-cy="pending-tasks-stat"]').should("be.visible");
      cy.get('[data-cy="completed-tasks-stat"]').should("be.visible");
      cy.get('[data-cy="overdue-tasks-stat"]').should("be.visible");
    });

    it("should show correct task counts", () => {
      cy.get('[data-cy="total-tasks-stat"]').should("contain", "4");
      cy.get('[data-cy="pending-tasks-stat"]').should("contain", "2");
      cy.get('[data-cy="completed-tasks-stat"]').should("contain", "1");
    });
  });

  describe("Recent Tasks", () => {
    it("should display recent tasks list", () => {
      cy.get('[data-cy="recent-tasks"]').should("be.visible");
      cy.get('[data-cy="recent-task-item"]').should("have.length.at.least", 1);
    });

    it("should navigate to tasks page when clicking view all", () => {
      cy.get('[data-cy="view-all-tasks"]').click();
      cy.url().should("include", "/tasks");
    });
  });

  describe("Quick Actions", () => {
    it("should provide quick action buttons", () => {
      cy.get('[data-cy="quick-create-task"]').should("be.visible");
      cy.get('[data-cy="quick-view-tasks"]').should("be.visible");
      cy.get('[data-cy="quick-view-categories"]').should("be.visible");
    });

    it("should open create task modal from quick action", () => {
      cy.get('[data-cy="quick-create-task"]').click();
      cy.get('[data-cy="task-form"]').should("be.visible");
    });
  });
});
