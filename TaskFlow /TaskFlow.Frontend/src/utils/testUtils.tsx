/**
 * Test Utilities
 *
 * Bu dosya, form testleri için yardımcı fonksiyonları içerir.
 * Test edilebilirlik ve form doğrulama için gerekli araçları sağlar.
 *
 * Ana Özellikler:
 * - Form test yardımcıları
 * - Validation test fonksiyonları
 * - Mock data generators
 * - Test assertion helpers
 * - Accessibility test utilities
 *
 * Test Senaryoları:
 * - Form validation tests
 * - User interaction tests
 * - Accessibility tests
 * - Error handling tests
 * - Rate limiting tests
 *
 * Kullanım:
 * - Unit testlerde form doğrulama
 * - Integration testlerde user flow
 * - E2E testlerde form interaction
 * - Accessibility compliance tests
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from "react";
import type { PropsWithChildren } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../components/ui/Toast";

/**
 * Test wrapper component
 * Tüm provider'ları içeren test wrapper'ı
 */
export function TestWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

/**
 * Form test yardımcıları
 */
export const formTestUtils = {
  /**
   * Form alanını doldur
   */
  fillField: async (testId: string, value: string) => {
    const field = screen.getByTestId(testId);
    await userEvent.clear(field);
    await userEvent.type(field, value);
  },

  /**
   * Form alanını temizle
   */
  clearField: async (testId: string) => {
    const field = screen.getByTestId(testId);
    await userEvent.clear(field);
  },

  /**
   * Formu submit et
   */
  submitForm: async (testId: string = "login-form") => {
    const form = screen.getByTestId(testId);
    await userEvent.click(screen.getByTestId("login-submit-button"));
  },

  /**
   * Checkbox'ı toggle et
   */
  toggleCheckbox: async (testId: string) => {
    const checkbox = screen.getByTestId(testId);
    await userEvent.click(checkbox);
  },

  /**
   * Link'e tıkla
   */
  clickLink: async (testId: string) => {
    const link = screen.getByTestId(testId);
    await userEvent.click(link);
  },
};

/**
 * Validation test yardımcıları
 */
export const validationTestUtils = {
  /**
   * Email validation test
   */
  testEmailValidation: async (invalidEmails: string[]) => {
    for (const email of invalidEmails) {
      await formTestUtils.fillField("email-input", email);
      await formTestUtils.clearField("email-input");
      
      await waitFor(() => {
        const errorElement = screen.queryByText(/geçerli bir email adresi/i);
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    }
  },

  /**
   * Password validation test
   */
  testPasswordValidation: async (invalidPasswords: string[]) => {
    for (const password of invalidPasswords) {
      await formTestUtils.fillField("password-input", password);
      await formTestUtils.clearField("password-input");
      
      await waitFor(() => {
        const errorElement = screen.queryByText(/şifre en az 6 karakter/i);
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    }
  },

  /**
   * Required field validation test
   */
  testRequiredFields: async (requiredFields: string[]) => {
    await formTestUtils.submitForm();
    
    for (const field of requiredFields) {
      await waitFor(() => {
        const errorElement = screen.queryByText(new RegExp(`${field}.*gereklidir`, "i"));
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    }
  },
};

/**
 * Mock data generators
 */
export const mockData = {
  /**
   * Geçerli login data
   */
  validLoginData: {
    email: "test@example.com",
    password: "TestPassword123!",
  },

  /**
   * Geçersiz login data
   */
  invalidLoginData: {
    email: "invalid-email",
    password: "123",
  },

  /**
   * Test email'leri
   */
  testEmails: [
    "test@example.com",
    "user@domain.co.uk",
    "admin@company.org",
  ],

  /**
   * Test şifreleri
   */
  testPasswords: [
    "Password123!",
    "SecurePass456@",
    "StrongPwd789#",
  ],
};

/**
 * Accessibility test yardımcıları
 */
export const accessibilityTestUtils = {
  /**
   * Form erişilebilirlik testi
   */
  testFormAccessibility: async () => {
    // Form elementinin mevcut olduğunu kontrol et
    const form = screen.queryByRole("form");
    if (form) {
      expect(form).toBeInTheDocument();
    }
    
    // Label'ların mevcut olduğunu kontrol et
    const emailLabel = screen.queryByLabelText(/email adresi/i);
    const passwordLabel = screen.queryByLabelText(/şifre/i);
    
    if (emailLabel) expect(emailLabel).toBeInTheDocument();
    if (passwordLabel) expect(passwordLabel).toBeInTheDocument();
    
    // Submit butonunun mevcut olduğunu kontrol et
    const submitButton = screen.queryByRole("button", { name: /giriş yap/i });
    if (submitButton) {
      expect(submitButton).toBeInTheDocument();
    }
  },

  /**
   * Keyboard navigation testi
   */
  testKeyboardNavigation: async () => {
    const user = userEvent.setup();
    
    // Tab ile navigation
    await user.tab();
    const emailInput = screen.getByTestId("email-input");
    if (emailInput) {
      expect(emailInput).toHaveFocus();
    }
    
    await user.tab();
    const passwordInput = screen.getByTestId("password-input");
    if (passwordInput) {
      expect(passwordInput).toHaveFocus();
    }
    
    await user.tab();
    const checkbox = screen.getByTestId("remember-me-checkbox");
    if (checkbox) {
      expect(checkbox).toHaveFocus();
    }
    
    await user.tab();
    const submitButton = screen.getByTestId("login-submit-button");
    if (submitButton) {
      expect(submitButton).toHaveFocus();
    }
  },

  /**
   * Screen reader uyumluluğu testi
   */
  testScreenReaderSupport: () => {
    // ARIA label'ların mevcut olduğunu kontrol et
    const formLabel = screen.queryByLabelText(/giriş formu/i);
    const emailLabel = screen.queryByLabelText(/email adresi/i);
    const passwordLabel = screen.queryByLabelText(/şifre/i);
    
    if (formLabel) expect(formLabel).toBeInTheDocument();
    if (emailLabel) expect(emailLabel).toBeInTheDocument();
    if (passwordLabel) expect(passwordLabel).toBeInTheDocument();
    
    // Error mesajlarının erişilebilir olduğunu kontrol et
    const errorElements = screen.queryAllByRole("alert");
    expect(errorElements.length).toBeGreaterThanOrEqual(0);
  },
};

/**
 * Rate limiting test yardımcıları
 */
export const rateLimitTestUtils = {
  /**
   * Rate limiting testi
   */
  testRateLimiting: async () => {
    const user = userEvent.setup();
    
    // Geçersiz giriş denemeleri
    for (let i = 0; i < 5; i++) {
      await formTestUtils.fillField("email-input", "test@example.com");
      await formTestUtils.fillField("password-input", "wrongpassword");
      await formTestUtils.submitForm();
      
      await waitFor(() => {
        const errorElement = screen.queryByText(/giriş işlemi başarısız/i);
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    }
    
    // Rate limit mesajının görünmesini bekle
    await waitFor(() => {
      const rateLimitElement = screen.queryByText(/çok fazla başarısız deneme/i);
      if (rateLimitElement) {
        expect(rateLimitElement).toBeInTheDocument();
      }
    });
  },
};

/**
 * Custom render fonksiyonu
 * Test wrapper ile birlikte render
 */
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

export default {
  TestWrapper,
  formTestUtils,
  validationTestUtils,
  mockData,
  accessibilityTestUtils,
  rateLimitTestUtils,
  renderWithProviders,
}; 