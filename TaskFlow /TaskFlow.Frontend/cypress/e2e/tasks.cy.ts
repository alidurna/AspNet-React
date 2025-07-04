/**
 * Task Management E2E Tests
 *
 * Tests for creating, updating, deleting, and managing tasks
 */

describe("Task Management", () => {
  beforeEach(() => {
    // Clear state and login before each test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("test@taskflow.com");
    cy.get('[data-cy="password-input"]').type("Test123!");
    cy.get('[data-cy="submit-button"]').click();

    // Wait for login to complete
    cy.url().should("include", "/dashboard");
  });

  describe("Task List Display", () => {
    it("should display tasks list page", () => {
      cy.visit("/tasks");
      cy.get('[data-cy="tasks-list"]').should("be.visible");
      cy.get('[data-cy="create-task-button"]').should("be.visible");
    });

    it("should show empty state when no tasks exist", () => {
      cy.visit("/tasks");
      cy.get('[data-cy="empty-tasks"]').should("be.visible");
      cy.get('[data-cy="empty-tasks"]').should("contain", "No tasks found");
    });

    it("should display existing tasks", () => {
      cy.visit("/tasks");
      // Assuming there are existing tasks
      cy.get('[data-cy="task-item"]').should("have.length.at.least", 1);
    });
  });

  describe("Create Task", () => {
    it("should open create task modal", () => {
      cy.visit("/tasks");
      cy.get('[data-cy="create-task-button"]').click();
      cy.get('[data-cy="task-form"]').should("be.visible");
      cy.get('[data-cy="task-title"]').should("be.visible");
      cy.get('[data-cy="task-description"]').should("be.visible");
    });

    it("should create a new task successfully", () => {
      const taskTitle = `Test Task ${Date.now()}`;
      const taskDescription = "This is a test task description";

      cy.visit("/tasks");
      cy.get('[data-cy="create-task-button"]').click();

      // Fill in task form
      cy.get('[data-cy="task-title"]').type(taskTitle);
      cy.get('[data-cy="task-description"]').type(taskDescription);
      cy.get('[data-cy="submit-button"]').click();

      // Verify task was created
      cy.get('[data-cy="success-message"]').should("be.visible");
      cy.contains(taskTitle).should("be.visible");
    });

    it("should show validation errors for empty title", () => {
      cy.visit("/tasks");
      cy.get('[data-cy="create-task-button"]').click();

      // Submit without title
      cy.get('[data-cy="submit-button"]').click();

      // Should show validation error
      cy.get('[data-cy="title-error"]').should("be.visible");
      cy.get('[data-cy="title-error"]').should("contain", "Title is required");
    });

    it("should create task with category", () => {
      const taskTitle = `Categorized Task ${Date.now()}`;

      cy.visit("/tasks");
      cy.get('[data-cy="create-task-button"]').click();

      // Fill in task form with category
      cy.get('[data-cy="task-title"]').type(taskTitle);
      cy.get('[data-cy="category-select"]').select("Work");
      cy.get('[data-cy="submit-button"]').click();

      // Verify task was created with category
      cy.contains(taskTitle).should("be.visible");
      cy.contains(taskTitle).parent().should("contain", "Work");
    });
  });

  describe("Edit Task", () => {
    it("should open edit task modal", () => {
      cy.visit("/tasks");

      // Click edit on first task
      cy.get('[data-cy="task-item"]')
        .first()
        .find('[data-cy="edit-button"]')
        .click();
      cy.get('[data-cy="task-form"]').should("be.visible");
      cy.get('[data-cy="task-title"]').should("have.value");
    });

    it("should update task successfully", () => {
      const updatedTitle = `Updated Task ${Date.now()}`;

      cy.visit("/tasks");

      // Edit first task
      cy.get('[data-cy="task-item"]')
        .first()
        .find('[data-cy="edit-button"]')
        .click();

      // Update task title
      cy.get('[data-cy="task-title"]').clear().type(updatedTitle);
      cy.get('[data-cy="submit-button"]').click();

      // Verify task was updated
      cy.get('[data-cy="success-message"]').should("be.visible");
      cy.contains(updatedTitle).should("be.visible");
    });
  });

  describe("Delete Task", () => {
    it("should show delete confirmation", () => {
      cy.visit("/tasks");

      // Click delete on first task
      cy.get('[data-cy="task-item"]')
        .first()
        .find('[data-cy="delete-button"]')
        .click();
      cy.get('[data-cy="confirm-delete-modal"]').should("be.visible");
      cy.get('[data-cy="confirm-delete"]').should("be.visible");
      cy.get('[data-cy="cancel-delete"]').should("be.visible");
    });

    it("should cancel delete operation", () => {
      cy.visit("/tasks");
      const initialTaskCount = cy.get('[data-cy="task-item"]').its("length");

      // Click delete and then cancel
      cy.get('[data-cy="task-item"]')
        .first()
        .find('[data-cy="delete-button"]')
        .click();
      cy.get('[data-cy="cancel-delete"]').click();

      // Task count should remain the same
      cy.get('[data-cy="task-item"]').should("have.length", initialTaskCount);
    });

    it("should delete task successfully", () => {
      cy.visit("/tasks");

      // Get task title to verify deletion
      cy.get('[data-cy="task-item"]')
        .first()
        .find('[data-cy="task-title"]')
        .invoke("text")
        .then((taskTitle) => {
          // Delete the task
          cy.get('[data-cy="task-item"]')
            .first()
            .find('[data-cy="delete-button"]')
            .click();
          cy.get('[data-cy="confirm-delete"]').click();

          // Verify task was deleted
          cy.get('[data-cy="success-message"]').should("be.visible");
          cy.contains(taskTitle.trim()).should("not.exist");
        });
    });
  });

  describe("Task Status Management", () => {
    it("should mark task as completed", () => {
      cy.visit("/tasks");

      // Mark first task as completed
      cy.get('[data-cy="task-item"]')
        .first()
        .find('[data-cy="complete-button"]')
        .click();

      // Verify task is marked as completed
      cy.get('[data-cy="task-item"]').first().should("have.class", "completed");
      cy.get('[data-cy="success-message"]').should("contain", "Task completed");
    });

    it("should filter tasks by status", () => {
      cy.visit("/tasks");

      // Filter by completed tasks
      cy.get('[data-cy="status-filter"]').select("completed");

      // Should only show completed tasks
      cy.get('[data-cy="task-item"]').each(($task) => {
        cy.wrap($task).should("have.class", "completed");
      });
    });

    it("should filter tasks by pending status", () => {
      cy.visit("/tasks");

      // Filter by pending tasks
      cy.get('[data-cy="status-filter"]').select("pending");

      // Should only show pending tasks
      cy.get('[data-cy="task-item"]').each(($task) => {
        cy.wrap($task).should("not.have.class", "completed");
      });
    });
  });

  describe("Task Search and Filter", () => {
    it("should search tasks by title", () => {
      const searchTerm = "test";

      cy.visit("/tasks");
      cy.get('[data-cy="search-input"]').type(searchTerm);

      // Should show only tasks matching search term
      cy.get('[data-cy="task-item"]').each(($task) => {
        cy.wrap($task).should("contain.text", searchTerm);
      });
    });

    it("should filter tasks by category", () => {
      cy.visit("/tasks");

      // Filter by Work category
      cy.get('[data-cy="category-filter"]').select("Work");

      // Should only show tasks in Work category
      cy.get('[data-cy="task-item"]').each(($task) => {
        cy.wrap($task).should("contain", "Work");
      });
    });

    it("should show no results for invalid search", () => {
      cy.visit("/tasks");
      cy.get('[data-cy="search-input"]').type("nonexistenttask123");

      // Should show no results message
      cy.get('[data-cy="no-results"]').should("be.visible");
      cy.get('[data-cy="no-results"]').should("contain", "No tasks found");
    });
  });

  describe("Task Priority Management", () => {
    it("should set task priority during creation", () => {
      const taskTitle = `Priority Task ${Date.now()}`;

      cy.visit("/tasks");
      cy.get('[data-cy="create-task-button"]').click();

      // Fill in task form with high priority
      cy.get('[data-cy="task-title"]').type(taskTitle);
      cy.get('[data-cy="priority-select"]').select("High");
      cy.get('[data-cy="submit-button"]').click();

      // Verify task was created with priority
      cy.contains(taskTitle).parent().should("contain", "High");
    });

    it("should filter tasks by priority", () => {
      cy.visit("/tasks");

      // Filter by high priority
      cy.get('[data-cy="priority-filter"]').select("High");

      // Should only show high priority tasks
      cy.get('[data-cy="task-item"]').each(($task) => {
        cy.wrap($task).should("contain", "High");
      });
    });
  });

  describe("Task Details View", () => {
    it("should show task details when clicked", () => {
      cy.visit("/tasks");

      // Click on first task
      cy.get('[data-cy="task-item"]').first().click();

      // Should show task details modal or page
      cy.get('[data-cy="task-details"]').should("be.visible");
      cy.get('[data-cy="task-title"]').should("be.visible");
      cy.get('[data-cy="task-description"]').should("be.visible");
    });

    it("should close task details", () => {
      cy.visit("/tasks");

      // Open task details
      cy.get('[data-cy="task-item"]').first().click();
      cy.get('[data-cy="task-details"]').should("be.visible");

      // Close details
      cy.get('[data-cy="close-details"]').click();
      cy.get('[data-cy="task-details"]').should("not.exist");
    });
  });
});
