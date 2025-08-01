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
import type { RegisterRequest } from "../../types/auth.types";
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

  // Animation hooks
  const { handleClick } = useClickAnimation();

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
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          👤 Kişisel Bilgiler
        </h3>
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

        {/* Email */}
        <Input
          {...register("email")}
          type="email"
          placeholder="Email adresiniz"
          error={errors.email?.message}
          className="w-full"
          autoComplete="email"
        />

        {/* Phone Number (Optional) */}
        <Input
          {...register("phoneNumber")}
          type="tel"
          placeholder="Telefon numaranız (opsiyonel)"
          error={errors.phoneNumber?.message}
          className="w-full"
          autoComplete="tel"
        />
      </div>

      {/* Password Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          🔒 Şifre Bilgileri
        </h3>
        {/* Password */}
        <div className="relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Şifreniz"
            error={errors.password?.message}
            className="w-full pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {watchedPassword && (
          <PasswordStrengthIndicator password={watchedPassword} />
        )}

        {/* Confirm Password */}
        <div className="relative">
          <Input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Şifrenizi tekrar giriniz"
            error={errors.confirmPassword?.message}
            className="w-full pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>
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
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label
          htmlFor="acceptTerms"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          <span className="font-medium">Kullanım Koşulları</span> ve{" "}
          <span className="font-medium">Gizlilik Politikası</span>'nı okudum ve
          kabul ediyorum.
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full"
        disabled={isLoading || isSubmitting || !acceptTerms}
        onClick={handleClick}
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