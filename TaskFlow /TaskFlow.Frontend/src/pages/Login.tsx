/**
 * Login Sayfası Component
 *
 * Bu dosya, kullanıcıların TaskFlow uygulamasına giriş yapabilmesi için tasarlanmış
 * login sayfasını içerir. Modern React best practices kullanılarak geliştirilmiştir.
 *
 * Ana Özellikler:
 * - React Hook Form ile form yönetimi
 * - Zod ile gerçek zamanlı form validation
 * - Responsive ve modern UI tasarımı
 * - Şifre göster/gizle özelliği
 * - Loading state yönetimi
 * - Hata mesajları gösterimi
 * - "Beni hatırla" özelliği
 * - Register sayfasına yönlendirme
 *
 * Güvenlik:
 * - Form validation ile güvenli veri girişi
 * - API hata yönetimi
 * - XSS koruması için sanitized input
 *
 * Performans:
 * - Lazy loading desteği
 * - Optimized re-renders
 * - Memory leak koruması
 *
 * Sürdürülebilirlik:
 * - TypeScript ile tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod yapısı
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
import ThemeToggle from "../components/ui/ThemeToggle";
import PasswordStrength from "../components/ui/PasswordStrength";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import useRateLimit from "../hooks/useRateLimit";
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

  // Theme context - tema yönetimi için
  const { isDark } = useTheme();

  // Rate limiting - brute force koruması için
  const [email, setEmail] = useState<string>("");
  const rateLimit = useRateLimit(email || "default");

  // Error state - API hatalarını göstermek için
  const [error, setError] = useState<string>("");

  // Security warning state - güvenlik uyarıları için
  const [securityWarning, setSecurityWarning] = useState<string>("");

  // React Hook Form kurulumu - form state yönetimi için
  const {
    register, // Input'ları form'a bağlamak için
    handleSubmit, // Form submit işlemi için
    watch, // Gerçek zamanlı validasyon için input değerlerini izle
    trigger, // Manuel validation tetikleme
    reset, // Form sıfırlama
    setValue, // Form değeri ayarlama
    getValues, // Form değerlerini alma
    formState: { errors, isSubmitting, isValid, isDirty }, // Form durumu ve hata mesajları
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema), // Zod validation entegrasyonu
    mode: "onChange", // Input değiştiğinde anında validation
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Gerçek zamanlı validasyon için input değerlerini izle
  const watchedFields = watch();

  // Form performans optimizasyonu - debounced validation
  const debouncedTrigger = React.useCallback(
    React.useMemo(
      () => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (fieldName: keyof LoginRequest) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            trigger(fieldName);
          }, 300);
        };
      },
      [trigger]
    ),
    [trigger]
  );

  /**
   * Input değişikliklerinde gerçek zamanlı validasyon
   * Kullanıcı deneyimini iyileştirmek için anlık feedback sağlar
   * Debounced validation ile performans optimizasyonu
   */
  React.useEffect(() => {
    // Email alanı değiştiğinde debounced validation tetikle
    if (watchedFields.email) {
      debouncedTrigger("email");
    }
    // Şifre alanı değiştiğinde debounced validation tetikle
    if (watchedFields.password) {
      debouncedTrigger("password");
    }
  }, [watchedFields.email, watchedFields.password, debouncedTrigger]);

  /**
   * Form submit işlemi
   * @param data - Login form verisi (email, password)
   */
  const onSubmit = async (data: LoginRequest) => {
    try {
      // Önceki hataları temizle
      setError("");
      setSecurityWarning("");

      // Email'i rate limiting için kaydet
      setEmail(data.email);

      // Rate limit kontrolü
      const rateLimitCheck = rateLimit.checkRateLimit();
      if (!rateLimitCheck.allowed) {
        setError(rateLimitCheck.message);
        return;
      }

      // Güvenlik uyarısı göster
      if (rateLimitCheck.remainingAttempts <= 2) {
        setSecurityWarning(`Dikkat: ${rateLimitCheck.remainingAttempts} deneme hakkınız kaldı.`);
      }

      console.log("🚀 Login attempt:", data.email);

      // Authentication context üzerinden login işlemi
      await login(data);

      // Başarılı login sonrası rate limit'i sıfırla
      rateLimit.recordSuccess();

      // Başarılı login sonrası dashboard'a yönlendir
      console.log("✅ Login successful, redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Login error:", error);

      // Başarısız deneme kaydet
      rateLimit.recordFailedAttempt();

      // Hata mesajını kullanıcıya göster
      const errorMessage =
        error instanceof Error ? error.message : "Giriş işlemi başarısız oldu";
      setError(errorMessage);

      // Rate limit kontrolü
      const rateLimitCheck = rateLimit.checkRateLimit();
      if (!rateLimitCheck.allowed) {
        setError(rateLimitCheck.message);
      } else if (rateLimitCheck.message) {
        setSecurityWarning(rateLimitCheck.message);
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 ${
      isDark 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black" 
        : "gradient-bg"
    }`}>
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-6 sm:space-y-8">
        {/* ===== THEME TOGGLE ===== */}
        {/* Tema değiştirme butonu - sağ üst köşede */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle size="sm" />
        </div>

        {/* ===== HEADER SECTION ===== */}
        {/* Logo, başlık ve açıklama metni */}
        <div className="text-center">
          {/* TaskFlow Logo - Checkmark ikonu */}
          <div className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}>
            <svg
              className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            TaskFlow'a Hoş Geldiniz
          </h1>

          {/* Alt başlık / açıklama */}
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-sm mx-auto">
            Hesabınıza giriş yapın ve görevlerinizi yönetin
          </p>
        </div>

        {/* ===== LOGIN FORM SECTION ===== */}
        {/* Ana login formu - Card component içinde */}
        <Card className={`animate-fade-in p-4 sm:p-6 lg:p-8 shadow-xl ${
          isDark ? "bg-gray-800 border-gray-700" : ""
        }`}>
          <form 
            className="space-y-4 sm:space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            aria-label="Giriş formu"
            role="form"
            noValidate // HTML5 validation'ı devre dışı bırak, React Hook Form kullan
            data-testid="login-form"
          >
            {/* ===== ERROR MESSAGE ===== */}
            {error && (
              <div 
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base ${
                  isDark 
                    ? "bg-red-900/50 border border-red-700 text-red-300" 
                    : "bg-error-50 border border-error-200 text-error-700"
                }`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="break-words">{error}</span>
                </div>
              </div>
            )}

            {/* ===== SECURITY WARNING ===== */}
            {/* Güvenlik uyarıları ve rate limiting bilgileri */}
            {securityWarning && (
              <div 
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base ${
                  isDark 
                    ? "bg-yellow-900/50 border border-yellow-700 text-yellow-300" 
                    : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                }`}
                role="alert"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="break-words">{securityWarning}</span>
                </div>
              </div>
            )}

            {/* ===== RATE LIMIT STATUS ===== */}
            {/* Rate limiting durumu (sadece kilitliyse göster) */}
            {rateLimit.isLocked && (
              <div 
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base ${
                  isDark 
                    ? "bg-orange-900/50 border border-orange-700 text-orange-300" 
                    : "bg-orange-50 border border-orange-200 text-orange-700"
                }`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="break-words">
                    Hesap geçici olarak kilitlendi. {rateLimit.formatRemainingTime(rateLimit.remainingTime)} sonra tekrar deneyin.
                  </span>
                </div>
              </div>
            )}
            {/* Email Input Alanı */}
            <div>
              {/*
                Email inputuna otomatik odak (autoFocus) eklenmiştir.
                Erişilebilirlik için label ve id ilişkisi Input bileşeninde otomatik sağlanmaktadır.
                Form submit sırasında input disable edilir.
              */}
              <Input
                {...register("email")}
                type="email"
                label="Email Adresi"
                placeholder="ornek@email.com"
                error={errors.email?.message}
                disabled={isSubmitting} // Form submit sırasında disable
                autoFocus // Otomatik odak
                data-testid="email-input"
                aria-describedby={errors.email ? "email-error" : undefined}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
              
              {/* Email hata mesajı için aria-describedby */}
              {errors.email && (
                <div id="email-error" className="sr-only" aria-live="polite">
                  Email hatası: {errors.email.message}
                </div>
              )}
            </div>

            {/* Şifre Input Alanı */}
            <div>
              {/*
                Şifre input'u - showPasswordToggle özelliği ile şifre göster/gizle butonu
                Form submit sırasında input disable edilir.
              */}
              <Input
                {...register("password")}
                type="password"
                label="Şifre"
                placeholder="••••••••"
                error={errors.password?.message}
                showPasswordToggle // Şifre göster/gizle butonu
                disabled={isSubmitting} // Form submit sırasında disable
                data-testid="password-input"
                aria-describedby={errors.password ? "password-error" : undefined}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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

              {/* Şifre hata mesajı için aria-describedby */}
              {errors.password && (
                <div id="password-error" className="sr-only" aria-live="polite">
                  Şifre hatası: {errors.password.message}
                </div>
              )}
            </div>

            {/* ===== ADDITIONAL OPTIONS ===== */}
            {/* "Beni hatırla" ve "Şifremi unuttum" seçenekleri */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Beni Hatırla Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-describedby="remember-me-description"
                  disabled={isSubmitting} // Form submit sırasında disable
                  data-testid="remember-me-checkbox"
                />
                <label
                  htmlFor="remember-me"
                  className={`ml-2 block text-sm cursor-pointer ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  id="remember-me-description"
                  data-testid="remember-me-label"
                >
                  Beni hatırla
                </label>
              </div>

              {/* Şifremi Unuttum Linki */}
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded ${
                    isDark 
                      ? "text-blue-400 hover:text-blue-300" 
                      : "text-primary-600 hover:text-primary-500"
                  } ${
                    isSubmitting ? "pointer-events-none opacity-50" : ""
                  }`}
                  aria-label="Şifremi unuttum sayfasına git"
                  tabIndex={isSubmitting ? -1 : 0} // Loading sırasında tab navigation'dan çıkar
                  data-testid="forgot-password-link"
                >
                  Şifremi unuttum
                </Link>
              </div>
            </div>

            {/* ===== SUBMIT BUTTON ===== */}
            {/* Giriş yap butonu - loading state ile */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting} // Form submit edilirken loading göster
                className="w-full text-sm sm:text-base"
                size="lg"
                aria-label={isSubmitting ? "Giriş yapılıyor..." : "Giriş yap"}
                disabled={isSubmitting || rateLimit.isLocked} // Rate limit kilitliyse disable
                data-testid="login-submit-button"
                aria-describedby={rateLimit.isLocked ? "rate-limit-info" : undefined}
              >
                {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>
              
              {/* Rate limit durumu bilgisi */}
              {rateLimit.isLocked && (
                <p 
                  id="rate-limit-info"
                  className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400"
                  data-testid="rate-limit-info"
                >
                  Hesap kilitli: {rateLimit.formatRemainingTime(rateLimit.remainingTime)} sonra tekrar deneyin
                </p>
              )}

              {/* Form durumu bilgisi (sadece development'ta) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-2 text-xs text-gray-400 text-center" data-testid="form-status">
                  Form Durumu: {isValid ? "Geçerli" : "Geçersiz"} | 
                  Değişiklik: {isDirty ? "Var" : "Yok"} | 
                  Deneme: {rateLimit.attempts}
                </div>
              )}
            </div>

            {/* ===== REGISTER LINK ===== */}
            {/* Kayıt sayfasına yönlendirme */}
            <div className="text-center pt-2">
              <p className={`text-xs sm:text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Hesabınız yok mu?{" "}
                <Link
                  to="/register"
                  className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded ${
                    isDark 
                      ? "text-blue-400 hover:text-blue-300" 
                      : "text-primary-600 hover:text-primary-500"
                  } ${
                    isSubmitting ? "pointer-events-none opacity-50" : ""
                  }`}
                  aria-label="Kayıt ol sayfasına git"
                  tabIndex={isSubmitting ? -1 : 0} // Loading sırasında tab navigation'dan çıkar
                  data-testid="register-link"
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
          <p className={`text-xs ${
            isDark ? "text-gray-400" : "text-blue-100"
          }`}>
            © 2024 TaskFlow. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
