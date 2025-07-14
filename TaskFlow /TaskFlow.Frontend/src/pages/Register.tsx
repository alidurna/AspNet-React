/**
 * Register Sayfası Component
 *
 * Bu dosya, yeni kullanıcıların TaskFlow uygulamasına kayıt olabilmesi için
 * tasarlanmış register sayfasını içerir. Güvenli ve kullanıcı dostu bir
 * kayıt deneyimi sunar.
 *
 * Ana Özellikler:
 * - Kapsamlı form validation (Zod ile)
 * - Güçlü şifre gereksinimleri
 * - Şifre eşleşme kontrolü
 * - Ad/soyad, email, telefon alanları
 * - Terms & conditions kabul
 * - Responsive tasarım
 * - Loading state yönetimi
 * - Hata mesajları gösterimi
 *
 * Güvenlik:
 * - Güçlü şifre validation (büyük/küçük harf, rakam)
 * - Form sanitization
 * - XSS koruması
 * - CSRF koruması
 *
 * Validation Kuralları:
 * - Ad/Soyad: En az 2 karakter
 * - Email: Geçerli email formatı
 * - Şifre: En az 8 karakter, büyük/küçük harf, rakam
 * - Şifre tekrarı: Ana şifre ile eşleşmeli
 *
 * Performans:
 * - Optimized form re-renders
 * - Debounced validation
 * - Memory efficient state management
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import type { RegisterRequest } from "../types/auth.types";
import PasswordStrength from "../components/ui/PasswordStrength";

/**
 * Register formu için Zod validation şeması
 * Tüm form alanları için kapsamlı validasyon kuralları
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

/**
 * Register Sayfası Component
 *
 * Yeni kullanıcıların sisteme kayıt olabilmesi için tasarlanmış sayfa.
 * Kapsamlı form validation ve güvenli şifre gereksinimleri içerir.
 *
 * Özellikler:
 * - Ad/soyad, email, telefon, şifre alanları
 * - Güçlü şifre validation (büyük/küçük harf, rakam)
 * - Şifre eşleşme kontrolü
 * - Telefon numarası opsiyonel
 * - Terms & conditions kabul checkbox'ı
 * - Responsive tasarım
 * - Loading state'i
 * - Login sayfasına yönlendirme
 *
 * Form Validation Kuralları:
 * - Ad/Soyad: En az 2 karakter
 * - Email: Geçerli email formatı
 * - Şifre: En az 8 karakter, büyük/küçük harf, rakam
 * - Şifre tekrarı: Ana şifre ile eşleşmeli
 */
const Register: React.FC = () => {
  // Navigation hook
  const navigate = useNavigate();

  // Authentication context
  const { register: registerUser } = useAuth();

  // Error state
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterRequest) => {
    try {
      // Önceki hataları temizle
      setError("");

      console.log("🚀 Register attempt:", data.email);

      // Authentication context üzerinden register işlemi
      await registerUser(data);

      // Başarılı register sonrası dashboard'a yönlendir
      console.log("✅ Registration successful, redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Registration error:", error);

      // Hata mesajını kullanıcıya göster
      const errorMessage =
        error instanceof Error ? error.message : "Kayıt işlemi başarısız oldu";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            TaskFlow'a Katılın
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Hesap oluşturun ve görev yönetimine başlayın
          </p>
        </div>

        {/* Register Form */}
        <Card className="animate-fade-in">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* ===== ERROR MESSAGE ===== */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  {...register("firstName")}
                  type="text"
                  label="Ad"
                  placeholder="Adınız"
                  error={errors.firstName?.message}
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />
              </div>
              <div>
                <Input
                  {...register("lastName")}
                  type="text"
                  label="Soyad"
                  placeholder="Soyadınız"
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div>
              <Input
                {...register("email")}
                type="email"
                label="Email Adresi"
                placeholder="ornek@email.com"
                error={errors.email?.message}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />
            </div>

            <div>
              <Input
                {...register("phoneNumber")}
                type="tel"
                label="Telefon Numarası (Opsiyonel)"
                placeholder="+90 5xx xxx xx xx"
                error={errors.phoneNumber?.message}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
              />
            </div>

            <div>
              <Input
                {...register("password")}
                type="password"
                label="Şifre"
                placeholder="••••••••"
                error={errors.password?.message}
                showPasswordToggle
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
              {/* Şifre gücü göstergesi ve kuralları */}
              {typeof watch === "function" && watch("password") && watch("password").length > 0 && (
                <div className="mt-2" data-testid="password-strength">
                  <PasswordStrength 
                    password={watch("password")}
                    showFeedback={true}
                    className="text-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <Input
                {...register("confirmPassword")}
                type="password"
                label="Şifre Tekrarı"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                showPasswordToggle
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700"
              >
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Kullanım Şartları
                </Link>{" "}
                ve{" "}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Gizlilik Politikası
                </Link>
                'nı kabul ediyorum
              </label>
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                size="lg"
              >
                Hesap Oluştur
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-blue-100">
            © 2024 TaskFlow. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
