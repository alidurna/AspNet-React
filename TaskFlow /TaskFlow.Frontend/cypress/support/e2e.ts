/**
 * Cypress E2E Support File
 *
 * This file is processed and loaded automatically before your test files.
 * This is a great place to put global configuration and behavior that
 * modifies Cypress.
 */

// Import commands.js using ES2015 syntax:
import "./commands";

// Import additional support files
import "./api-commands";
import "./auth-commands";
import "./ui-commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// ===== GLOBAL CONFIGURATION =====

// Uncaught exception handling
Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore specific errors that shouldn't fail tests
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  if (err.message.includes("Script error")) {
    return false;
  }
  if (err.message.includes("Non-Error promise rejection captured")) {
    return false;
  }

  // Return true to fail the test on other uncaught exceptions
  return true;
});

// Add global before hook
before(() => {
  // Global setup that runs once before all tests
  cy.log("Starting E2E test suite...");

  // Clear all data before starting
  cy.task("clearDatabase");
});

// Add global beforeEach hook
beforeEach(() => {
  // Setup that runs before each test
  cy.log("Setting up test environment...");

  // Visit the base URL
  cy.visit("/");

  // Wait for the app to load
  cy.get('[data-cy="app-container"]', { timeout: 10000 }).should("be.visible");
});

// Add global afterEach hook
afterEach(() => {
  // Cleanup that runs after each test
  cy.log("Cleaning up test environment...");

  // Clear local storage
  cy.clearLocalStorage();

  // Clear cookies
  cy.clearCookies();

  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Add global after hook
after(() => {
  // Global cleanup that runs once after all tests
  cy.log("Completing E2E test suite...");

  // Clear all test data
  cy.task("clearDatabase");
});

// ===== CUSTOM MATCHERS =====

// Add custom chai assertions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to check if element is loading
       * @example cy.get('[data-cy="button"]').shouldNotBeLoading()
       */
      shouldNotBeLoading(): Chainable<Element>;

      /**
       * Custom command to check if element has specific class
       * @example cy.get('[data-cy="button"]').shouldHaveClass('active')
       */
      shouldHaveClass(className: string): Chainable<Element>;

      /**
       * Custom command to check if form is valid
       * @example cy.get('[data-cy="form"]').shouldBeValid()
       */
      shouldBeValid(): Chainable<Element>;

      /**
       * Custom command to check API response
       * @example cy.request('/api/users').shouldHaveStatus(200)
       */
      shouldHaveStatus(status: number): Chainable<Element>;
    }
  }
}

// Implement custom matchers
Cypress.Commands.add("shouldNotBeLoading", { prevSubject: true }, (subject) => {
  cy.wrap(subject).should("not.have.class", "loading");
  cy.wrap(subject).should("not.have.attr", "aria-busy", "true");
});

Cypress.Commands.add(
  "shouldHaveClass",
  { prevSubject: true },
  (subject, className) => {
    cy.wrap(subject).should("have.class", className);
  }
);

Cypress.Commands.add("shouldBeValid", { prevSubject: true }, (subject) => {
  cy.wrap(subject).should("not.have.class", "invalid");
  cy.wrap(subject).should("not.have.attr", "aria-invalid", "true");
});

Cypress.Commands.add(
  "shouldHaveStatus",
  { prevSubject: true },
  (subject, status) => {
    cy.wrap(subject).should("have.property", "status", status);
  }
);

// ===== GLOBAL CONSTANTS =====

// Test data constants
export const TEST_DATA = {
  users: {
    admin: {
      email: "admin@taskflow.com",
      password: "Admin123!",
      name: "Admin User",
    },
    regular: {
      email: "user@taskflow.com",
      password: "User123!",
      name: "Regular User",
    },
    test: {
      email: "test@taskflow.com",
      password: "Test123!",
      name: "Test User",
    },
  },
  categories: {
    work: "Work",
    personal: "Personal",
    urgent: "Urgent",
  },
  tasks: {
    sample: "Sample Task",
    urgent: "Urgent Task",
    completed: "Completed Task",
  },
};

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  users: {
    profile: "/users/profile",
    update: "/users/update",
  },
  categories: {
    list: "/categories",
    create: "/categories",
    update: "/categories/:id",
    delete: "/categories/:id",
  },
  tasks: {
    list: "/tasks",
    create: "/tasks",
    update: "/tasks/:id",
    delete: "/tasks/:id",
    complete: "/tasks/:id/complete",
  },
};

// Selectors
export const SELECTORS = {
  // App container
  appContainer: '[data-cy="app-container"]',

  // Navigation
  nav: '[data-cy="navigation"]',
  logo: '[data-cy="logo"]',
  userMenu: '[data-cy="user-menu"]',

  // Forms
  form: '[data-cy="form"]',
  submitButton: '[data-cy="submit-button"]',
  cancelButton: '[data-cy="cancel-button"]',

  // Auth
  loginForm: '[data-cy="login-form"]',
  registerForm: '[data-cy="register-form"]',
  emailInput: '[data-cy="email-input"]',
  passwordInput: '[data-cy="password-input"]',

  // Tasks
  tasksList: '[data-cy="tasks-list"]',
  taskItem: '[data-cy="task-item"]',
  taskForm: '[data-cy="task-form"]',
  taskTitle: '[data-cy="task-title"]',
  taskDescription: '[data-cy="task-description"]',

  // Categories
  categoriesList: '[data-cy="categories-list"]',
  categoryItem: '[data-cy="category-item"]',
  categoryForm: '[data-cy="category-form"]',

  // UI Elements
  loadingSpinner: '[data-cy="loading-spinner"]',
  errorMessage: '[data-cy="error-message"]',
  successMessage: '[data-cy="success-message"]',
  modal: '[data-cy="modal"]',
  dropdown: '[data-cy="dropdown"]',

  // Buttons
  button: '[data-cy="button"]',
  primaryButton: '[data-cy="primary-button"]',
  secondaryButton: '[data-cy="secondary-button"]',
  deleteButton: '[data-cy="delete-button"]',
  editButton: '[data-cy="edit-button"]',
};

// ===== UTILITIES =====

// Wait for API calls to complete
export const waitForAPI = (alias: string, timeout = 10000) => {
  cy.wait(alias, { timeout });
};

// Generate random test data
export const generateTestData = {
  email: () => `test-${Date.now()}@taskflow.com`,
  password: () => "Test123!",
  name: () => `Test User ${Date.now()}`,
  category: () => `Test Category ${Date.now()}`,
  task: () => `Test Task ${Date.now()}`,
  description: () => `Test Description ${Date.now()}`,
};

// Screenshot utilities
export const takeScreenshot = (name: string) => {
  cy.screenshot(name, { capture: "viewport" });
};

// Log utilities
export const logTestStep = (message: string) => {
  cy.log(`🎯 ${message}`);
};

export const logTestInfo = (message: string) => {
  cy.log(`ℹ️ ${message}`);
};

export const logTestError = (message: string) => {
  cy.log(`❌ ${message}`);
};

export const logTestSuccess = (message: string) => {
  cy.log(`✅ ${message}`);
};
