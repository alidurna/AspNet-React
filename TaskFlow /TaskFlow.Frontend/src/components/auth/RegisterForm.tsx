/**
 * RegisterForm Component
 * 
 * Register sayfasından çıkarılan ana form component'i.
 * Form validation, submission ve UI state management'ı yönetir.
 */

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import type { RegisterRequest } from "../../types/auth/auth.types";
import PasswordStrengthIndicator from "../ui/PasswordStrength";
import Captcha from "../security/Captcha";
import type { CaptchaRef } from "../security/Captcha";

import { useHoverAnimation, useClickAnimation } from "../../hooks/useAnimations";

/**
 * Register formu için Zod validation şeması
 */
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Ad gereklidir")
      .min(2, "Ad en az 2 karakter olmalıdır"),
    lastName: z
      .string()
      .min(1, "Soyad gereklidir")
      .min(2, "Soyad en az 2 karakter olmalıdır"),
    email: z
      .string()
      .min(1, "Email adresi gereklidir")
      .email("Geçerli bir email adresi giriniz"),
    phoneNumber: z.string().optional(),
    password: z
      .string()
      .min(1, "Şifre gereklidir")
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir"
      ),
    confirmPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  captchaEnabled?: boolean;
  captchaSiteKey?: string;
}

/**
 * RegisterForm Component
 * 
 * Ana kayıt formu component'i. Tüm form alanları ve validation'ı içerir.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  captchaEnabled = false,
  captchaSiteKey = ""
}) => {
  // ===== HOOKS =====
  const captchaRef = useRef<CaptchaRef>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Form hook
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // ===== WATCHERS =====
  const watchedPassword = watch("password", "");

  // ===== EVENT HANDLERS =====
  /**
   * Form submit handler
   */
  const handleFormSubmit = async (data: RegisterFormData) => {
    if (!acceptTerms) {
      alert("Kullanım koşullarını kabul etmelisiniz.");
      return;
    }

    // Captcha doğrulaması (şimdilik skip - captcha API güncellenecek)
    // if (captchaEnabled && captchaRef.current) {
    //   try {
    //     const captchaToken = await captchaRef.current.getToken();
    //     if (!captchaToken) {
    //       alert("Captcha doğrulaması başarısız. Lütfen tekrar deneyin.");
    //       return;
    //     }
    //   } catch (error) {
    //     alert("Captcha doğrulaması sırasında hata oluştu.");
    //     return;
    //   }
    // }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Name Fields - Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <Input
            {...register("firstName")}
            type="text"
            placeholder="Adınız"
            error={errors.firstName?.message}
            className="w-full"
            autoComplete="given-name"
          />
        </div>

        {/* Last Name */}
        <div>
          <Input
            {...register("lastName")}
            type="text"
            placeholder="Soyadınız"
            error={errors.lastName?.message}
            className="w-full"
            autoComplete="family-name"
          />
        </div>
      </div>

      {/* Email - Full Width */}
      <Input
        {...register("email")}
        type="email"
        placeholder="Email Adresi"
        error={errors.email?.message}
        className="w-full"
        autoComplete="email"
      />

      {/* Phone Number (Optional) - Full Width */}
      <Input
        {...register("phoneNumber")}
        type="tel"
        placeholder="Telefon Numarası (Opsiyonel)"
        error={errors.phoneNumber?.message}
        className="w-full"
        autoComplete="tel"
      />

      {/* Password Fields - Two Columns with More Space for Error Messages */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password - Container with Enough Space */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Şifre"
                error=""
                className="w-full pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Error Message Area - More Space */}
            <div className="min-h-[2.5rem]">
              {errors.password?.message && (
                <p className="text-sm text-red-600 leading-tight">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Confirm Password - Container with Enough Space */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Şifre Tekrarı"
                error=""
                className="w-full pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Error Message Area - More Space */}
            <div className="min-h-[2.5rem]">
              {errors.confirmPassword?.message && (
                <p className="text-sm text-red-600 leading-tight">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Password Strength Indicator - Separated Area */}
        {watchedPassword && (
          <div className="mt-4">
            <PasswordStrengthIndicator password={watchedPassword} />
          </div>
        )}
      </div>

      {/* Captcha */}
      {captchaEnabled && captchaSiteKey && (
        <Captcha
          ref={captchaRef}
          siteKey={captchaSiteKey}
          onVerify={(token) => {/* Captcha token received */}}
        />
      )}

      {/* Terms & Conditions */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="acceptTerms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 border-blue-300 rounded-md focus:ring-blue-500"
        />
        <label
          htmlFor="acceptTerms"
          className="text-sm text-gray-600"
        >
          Kullanım Şartları ve Gizlilik Politikası'nı kabul ediyorum
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full"
        disabled={isLoading || isSubmitting || !acceptTerms}
      >
        {isLoading || isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Kayıt oluşturuluyor...</span>
          </div>
        ) : (
          "Hesap Oluştur"
        )}
      </Button>
    </form>
  );
};

export default RegisterForm; 