import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import type { LoginRequest } from "../types/auth.types";

/**
 * Login formu için Zod validation şeması
 * Email ve şifre alanları için gerekli validasyonlar
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email adresi gereklidir")
    .email("Geçerli bir email adresi giriniz"),
  password: z
    .string()
    .min(1, "Şifre gereklidir")
    .min(6, "Şifre en az 6 karakter olmalıdır"),
});

/**
 * Login Sayfası Component
 *
 * Kullanıcıların sisteme giriş yapabilmesi için tasarlanmış sayfa.
 * React Hook Form ile form yönetimi ve Zod ile validation yapılır.
 *
 * Özellikler:
 * - Email/şifre ile giriş
 * - Form validation (gerçek zamanlı)
 * - Şifre göster/gizle özelliği
 * - Responsive tasarım
 * - Loading state'i
 * - "Beni hatırla" checkbox'ı
 * - Register sayfasına yönlendirme
 */
const Login: React.FC = () => {
  // Navigation hook - sayfa yönlendirme için
  const navigate = useNavigate();

  // Authentication context - global auth state
  const { login } = useAuth();

  // Error state - API hatalarını göstermek için
  const [error, setError] = useState<string>("");

  // React Hook Form kurulumu - form state yönetimi için
  const {
    register, // Input'ları form'a bağlamak için
    handleSubmit, // Form submit işlemi için
    formState: { errors, isSubmitting }, // Form durumu ve hata mesajları
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema), // Zod validation entegrasyonu
  });

  /**
   * Form submit işlemi
   * @param data - Login form verisi (email, password)
   */
  const onSubmit = async (data: LoginRequest) => {
    try {
      // Önceki hataları temizle
      setError("");

      console.log("🚀 Login attempt:", data.email);

      // Authentication context üzerinden login işlemi
      await login(data);

      // Başarılı login sonrası dashboard'a yönlendir
      console.log("✅ Login successful, redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Login error:", error);

      // Hata mesajını kullanıcıya göster
      const errorMessage =
        error instanceof Error ? error.message : "Giriş işlemi başarısız oldu";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ===== HEADER SECTION ===== */}
        {/* Logo, başlık ve açıklama metni */}
        <div className="text-center">
          {/* TaskFlow Logo - Checkmark ikonu */}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Ana başlık */}
          <h2 className="mt-6 text-3xl font-bold text-white">
            TaskFlow'a Hoş Geldiniz
          </h2>

          {/* Alt başlık / açıklama */}
          <p className="mt-2 text-sm text-blue-100">
            Hesabınıza giriş yapın ve görevlerinizi yönetin
          </p>
        </div>

        {/* ===== LOGIN FORM SECTION ===== */}
        {/* Ana login formu - Card component içinde */}
        <Card className="animate-fade-in">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* ===== ERROR MESSAGE ===== */}
            {/* API hatalarını göstermek için */}
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
            {/* Email Input Alanı */}
            <div>
              <Input
                {...register("email")} // React Hook Form'a bağlama
                type="email"
                label="Email Adresi"
                placeholder="ornek@email.com"
                error={errors.email?.message} // Validation hata mesajı
                icon={
                  // Email ikonu
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

            {/* Şifre Input Alanı */}
            <div>
              <Input
                {...register("password")} // React Hook Form'a bağlama
                type="password"
                label="Şifre"
                placeholder="••••••••"
                error={errors.password?.message} // Validation hata mesajı
                showPasswordToggle // Şifre göster/gizle butonu
                icon={
                  // Kilit ikonu
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
            </div>

            {/* ===== ADDITIONAL OPTIONS ===== */}
            {/* "Beni hatırla" ve "Şifremi unuttum" seçenekleri */}
            <div className="flex items-center justify-between">
              {/* Beni Hatırla Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Beni hatırla
                </label>
              </div>

              {/* Şifremi Unuttum Linki */}
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>
            </div>

            {/* ===== SUBMIT BUTTON ===== */}
            {/* Giriş yap butonu - loading state ile */}
            <div>
              <Button
                type="submit"
                isLoading={isSubmitting} // Form submit edilirken loading göster
                className="w-full"
                size="lg"
              >
                Giriş Yap
              </Button>
            </div>

            {/* ===== REGISTER LINK ===== */}
            {/* Kayıt sayfasına yönlendirme */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Kayıt olun
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* ===== FOOTER ===== */}
        {/* Copyright bilgisi */}
        <div className="text-center">
          <p className="text-xs text-blue-100">
            © 2024 TaskFlow. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
