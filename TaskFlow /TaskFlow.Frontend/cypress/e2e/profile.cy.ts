/// <reference types="cypress" />

describe("Profile Page", () => {
  beforeEach(() => {
    cy.login(); // Önceden tanımlanmış login komutu
    cy.visit("/profile");
  });

  it("should display user profile information", () => {
    cy.get('[data-testid="profile-username"]').should("be.visible");
    cy.get('[data-testid="profile-email"]').should("be.visible");
  });

  it("should update profile information successfully", () => {
    cy.get('[data-testid="edit-profile-button"]').click();
    cy.get('[data-testid="username-input"]').clear().type("newusername");
    cy.get('[data-testid="email-input"]').clear().type("newemail@example.com");
    cy.get('[data-testid="save-profile-button"]').click();
    cy.get('[data-testid="success-toast"]').should("be.visible");
  });

  it("should change password successfully", () => {
    cy.get('[data-testid="change-password-button"]').click();
    cy.get('[data-testid="current-password-input"]').type("currentpass");
    cy.get('[data-testid="new-password-input"]').type("newpass123");
    cy.get('[data-testid="confirm-password-input"]').type("newpass123");
    cy.get('[data-testid="save-password-button"]').click();
    cy.get('[data-testid="success-toast"]').should("be.visible");
  });

  it("should display user statistics", () => {
    cy.get('[data-testid="total-tasks"]').should("be.visible");
    cy.get('[data-testid="completed-tasks"]').should("be.visible");
    cy.get('[data-testid="pending-tasks"]').should("be.visible");
  });
});
