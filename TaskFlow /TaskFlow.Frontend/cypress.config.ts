import { defineConfig } from "cypress";

export default defineConfig({
  // ===== E2E Testing Configuration =====
  e2e: {
    // Base URL for the application
    baseUrl: "http://localhost:3000",

    // Test files pattern
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",

    // Support files
    supportFile: "cypress/support/e2e.ts",

    // Fixtures folder
    fixturesFolder: "cypress/fixtures",

    // Screenshots and videos
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",

    // Default browser settings
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,

    // Test isolation
    testIsolation: true,

    // Video recording
    video: true,

    // Screenshots
    screenshotOnRunFailure: true,

    // Experimental features
    experimentalStudio: true,

    // Setup Node events
    setupNodeEvents(on, config) {
      // Code coverage setup (will be configured later)
      // require('@cypress/code-coverage/task')(on, config);

      // Custom tasks
      on("task", {
        // Custom task for logging
        log(message: string) {
          console.log(message);
          return null;
        },

        // Custom task for database seeding
        seedDatabase() {
          console.log("Seeding database for tests...");
          return null;
        },

        // Custom task for clearing data
        clearDatabase() {
          console.log("Clearing database after tests...");
          return null;
        },
      });

      // Environment variables
      config.env = {
        ...config.env,
        apiUrl: "http://localhost:5000/api",
        coverage: true,
      };

      return config;
    },
  },

  // ===== Component Testing Configuration =====
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },

    // Component test files pattern
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",

    // Support files
    supportFile: "cypress/support/component.ts",

    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,

    // Setup Node events
    setupNodeEvents(on, config) {
      // Code coverage setup will be configured later
      return config;
    },
  },

  // ===== Global Configuration =====
  // Retry configuration
  retries: {
    runMode: 2,
    openMode: 0,
  },

  // Environment variables
  env: {
    // API configuration
    apiUrl: "http://localhost:5000/api",

    // Test users
    testUser: {
      email: "test@taskflow.com",
      password: "Test123!",
      name: "Test User",
    },

    // Test data
    testData: {
      category: "Test Category",
      task: "Test Task",
    },

    // Feature flags
    features: {
      realTimeUpdates: true,
      notifications: true,
    },
  },

  // Note: excludeSpecPattern can be set within individual test configurations

  // Reporter configuration
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "cypress/reporter-config.json",
  },
});
