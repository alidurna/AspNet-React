/**
 * Authentication Validation Schemas - TaskFlow
 *
 * Zod kullanarak authentication formları için validation schemas.
 * Type-safe form validation ve error handling sağlar.
 */

import { z } from "zod";

/**
 * Login Form Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz")
    .max(256, "E-posta adresi çok uzun"),

  password: z
    .string()
    .min(1, "Şifre gereklidir")
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .max(100, "Şifre çok uzun"),

  rememberMe: z.boolean().optional(),
});

/**
 * Register Form Validation Schema
 */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Ad gereklidir")
      .min(2, "Ad en az 2 karakter olmalıdır")
      .max(100, "Ad çok uzun")
      .regex(/^[a-zA-ZğüşöçıĞÜŞÖÇİ\s]+$/, "Ad sadece harf içerebilir"),

    lastName: z
      .string()
      .min(1, "Soyad gereklidir")
      .min(2, "Soyad en az 2 karakter olmalıdır")
      .max(100, "Soyad çok uzun")
      .regex(/^[a-zA-ZğüşöçıĞÜŞÖÇİ\s]+$/, "Soyad sadece harf içerebilir"),

    email: z
      .string()
      .min(1, "E-posta adresi gereklidir")
      .email("Geçerli bir e-posta adresi giriniz")
      .max(256, "E-posta adresi çok uzun"),

    password: z
      .string()
      .min(1, "Şifre gereklidir")
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(100, "Şifre çok uzun")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Şifre en az 1 küçük harf, 1 büyük harf, 1 rakam ve 1 özel karakter içermelidir"
      ),

    confirmPassword: z.string().min(1, "Şifre tekrarı gereklidir"),

    phoneNumber: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // optional field
        return /^(\+90|0)?[1-9][0-9]{9}$/.test(val.replace(/\s/g, ""));
      }, "Geçerli bir telefon numarası giriniz"),

    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "Kullanım koşullarını kabul etmelisiniz"),

    acceptPrivacy: z
      .boolean()
      .refine((val) => val === true, "Gizlilik politikasını kabul etmelisiniz"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

/**
 * Forgot Password Form Validation Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz")
    .max(256, "E-posta adresi çok uzun"),
});

/**
 * Reset Password Form Validation Schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Sıfırlama kodu gereklidir"),

    password: z
      .string()
      .min(1, "Şifre gereklidir")
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(100, "Şifre çok uzun")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Şifre en az 1 küçük harf, 1 büyük harf, 1 rakam ve 1 özel karakter içermelidir"
      ),

    confirmPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

/**
 * Change Password Form Validation Schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),

    newPassword: z
      .string()
      .min(1, "Yeni şifre gereklidir")
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(100, "Şifre çok uzun")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Şifre en az 1 küçük harf, 1 büyük harf, 1 rakam ve 1 özel karakter içermelidir"
      ),

    confirmNewPassword: z.string().min(1, "Yeni şifre tekrarı gereklidir"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Yeni şifreler eşleşmiyor",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni şifre mevcut şifreden farklı olmalıdır",
    path: ["newPassword"],
  });

/**
 * Profile Update Form Validation Schema
 */
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "Ad gereklidir")
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(100, "Ad çok uzun")
    .regex(/^[a-zA-ZğüşöçıĞÜŞÖÇİ\s]+$/, "Ad sadece harf içerebilir"),

  lastName: z
    .string()
    .min(1, "Soyad gereklidir")
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(100, "Soyad çok uzun")
    .regex(/^[a-zA-ZğüşöçıĞÜŞÖÇİ\s]+$/, "Soyad sadece harf içerebilir"),

  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz")
    .max(256, "E-posta adresi çok uzun"),

  phoneNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // optional field
      return /^(\+90|0)?[1-9][0-9]{9}$/.test(val.replace(/\s/g, ""));
    }, "Geçerli bir telefon numarası giriniz"),

  bio: z.string().max(1000, "Açıklama çok uzun").optional(),

  profileImageUrl: z
    .string()
    .url("Geçerli bir URL giriniz")
    .max(500, "URL çok uzun")
    .optional()
    .or(z.literal("")),
});

// Export types for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
