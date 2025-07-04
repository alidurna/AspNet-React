/**
 * Authentication E2E Tests
 *
 * Tests for login, registration, and logout functionality
 */

describe("Authentication", () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe("Login Page", () => {
    it("should display login form", () => {
      cy.visit("/login");
      cy.get('[data-cy="login-form"]').should("be.visible");
      cy.get('[data-cy="email-input"]').should("be.visible");
      cy.get('[data-cy="password-input"]').should("be.visible");
      cy.get('[data-cy="submit-button"]').should("be.visible");
    });

    it("should show validation errors for empty fields", () => {
      cy.visit("/login");
      cy.get('[data-cy="submit-button"]').click();

      // Check for validation messages
      cy.get('[data-cy="email-error"]').should("be.visible");
      cy.get('[data-cy="password-error"]').should("be.visible");
    });

    it("should login with valid credentials", () => {
      cy.visit("/login");

      // Fill in login form
      cy.get('[data-cy="email-input"]').type("test@taskflow.com");
      cy.get('[data-cy="password-input"]').type("Test123!");
      cy.get('[data-cy="submit-button"]').click();

      // Should redirect to dashboard
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="user-menu"]').should("be.visible");
    });

    it("should show error for invalid credentials", () => {
      cy.visit("/login");

      // Fill in login form with invalid credentials
      cy.get('[data-cy="email-input"]').type("invalid@email.com");
      cy.get('[data-cy="password-input"]').type("wrongpassword");
      cy.get('[data-cy="submit-button"]').click();

      // Should show error message
      cy.get('[data-cy="error-message"]').should("be.visible");
      cy.get('[data-cy="error-message"]').should(
        "contain",
        "Invalid credentials"
      );
    });
  });

  describe("Registration Page", () => {
    it("should display registration form", () => {
      cy.visit("/register");
      cy.get('[data-cy="register-form"]').should("be.visible");
      cy.get('[data-cy="name-input"]').should("be.visible");
      cy.get('[data-cy="email-input"]').should("be.visible");
      cy.get('[data-cy="password-input"]').should("be.visible");
      cy.get('[data-cy="submit-button"]').should("be.visible");
    });

    it("should register new user successfully", () => {
      const timestamp = Date.now();
      const email = `test-${timestamp}@taskflow.com`;

      cy.visit("/register");

      // Fill in registration form
      cy.get('[data-cy="name-input"]').type("Test User");
      cy.get('[data-cy="email-input"]').type(email);
      cy.get('[data-cy="password-input"]').type("Test123!");
      cy.get('[data-cy="submit-button"]').click();

      // Should redirect to dashboard after successful registration
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="user-menu"]').should("be.visible");
    });

    it("should show validation errors for invalid data", () => {
      cy.visit("/register");

      // Submit empty form
      cy.get('[data-cy="submit-button"]').click();

      // Check for validation messages
      cy.get('[data-cy="name-error"]').should("be.visible");
      cy.get('[data-cy="email-error"]').should("be.visible");
      cy.get('[data-cy="password-error"]').should("be.visible");
    });
  });

  describe("Logout", () => {
    it("should logout user successfully", () => {
      // First login
      cy.visit("/login");
      cy.get('[data-cy="email-input"]').type("test@taskflow.com");
      cy.get('[data-cy="password-input"]').type("Test123!");
      cy.get('[data-cy="submit-button"]').click();

      // Verify login successful
      cy.url().should("include", "/dashboard");

      // Logout
      cy.get('[data-cy="user-menu"]').click();
      cy.get('[data-cy="logout-button"]').click();

      // Should redirect to login page
      cy.url().should("include", "/login");
      cy.get('[data-cy="login-form"]').should("be.visible");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect to login when accessing protected route without auth", () => {
      cy.visit("/dashboard");

      // Should be redirected to login
      cy.url().should("include", "/login");
    });

    it("should allow access to protected routes when authenticated", () => {
      // Login first
      cy.visit("/login");
      cy.get('[data-cy="email-input"]').type("test@taskflow.com");
      cy.get('[data-cy="password-input"]').type("Test123!");
      cy.get('[data-cy="submit-button"]').click();

      // Should access dashboard
      cy.url().should("include", "/dashboard");

      // Should access other protected routes
      cy.visit("/tasks");
      cy.url().should("include", "/tasks");

      cy.visit("/categories");
      cy.url().should("include", "/categories");
    });
  });

  describe("Session Management", () => {
    it("should persist session across page reloads", () => {
      // Login
      cy.visit("/login");
      cy.get('[data-cy="email-input"]').type("test@taskflow.com");
      cy.get('[data-cy="password-input"]').type("Test123!");
      cy.get('[data-cy="submit-button"]').click();

      // Verify login
      cy.url().should("include", "/dashboard");

      // Reload page
      cy.reload();

      // Should still be authenticated
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="user-menu"]').should("be.visible");
    });

    it("should handle expired session", () => {
      // Login
      cy.visit("/login");
      cy.get('[data-cy="email-input"]').type("test@taskflow.com");
      cy.get('[data-cy="password-input"]').type("Test123!");
      cy.get('[data-cy="submit-button"]').click();

      // Clear auth token to simulate expired session
      cy.clearLocalStorage("authToken");

      // Try to access protected route
      cy.visit("/dashboard");

      // Should be redirected to login
      cy.url().should("include", "/login");
    });
  });
});
