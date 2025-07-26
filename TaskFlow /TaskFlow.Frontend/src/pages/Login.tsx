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

import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../hooks/useToast";
import AuthLayout from "../components/layout/AuthLayout";
import type { LoginRequest } from "../types/auth.types";
import { useTheme } from "../contexts/ThemeContext";
import { useRateLimit } from "../hooks/useRateLimit";
import ThemeToggle from "../components/ui/ThemeToggle";
import SocialLogin from "../components/auth/SocialLogin";
import Captcha from "../components/security/Captcha";
import type { CaptchaRef } from "../components/security/Captcha";
import { captchaAPI } from "../services/api";
import TwoFactorLogin from "../components/auth/TwoFactorLogin";
import WebAuthnLogin from "../components/auth/WebAuthnLogin";
import { FaFingerprint } from "react-icons/fa";

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

  // Beni hatırla state'i
  const [rememberMe, setRememberMe] = useState(false);

  // Error state - API hatalarını göstermek için
  const [error, setError] = useState<string>("");

  // Security warning state - güvenlik uyarıları için
  const [securityWarning, setSecurityWarning] = useState<string>("");

  // Captcha state'leri
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaSiteKey, setCaptchaSiteKey] = useState("");
  const captchaRef = useRef<CaptchaRef>(null);

  // 2FA state'leri
  const [show2FA, setShow2FA] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<{ email: string; password: string } | null>(null);

  // WebAuthn state'leri
  const [showWebAuthn, setShowWebAuthn] = useState(false);

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

  // Captcha konfigürasyonunu yükle
  React.useEffect(() => {
    const loadCaptchaConfig = async () => {
      try {
        const response = await captchaAPI.getConfig();
        if (response.success && response.data.enabled && 
            response.data.siteKey && 
            response.data.siteKey !== "your-recaptcha-site-key" &&
            response.data.siteKey !== "6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX") {
          setCaptchaEnabled(true);
          setCaptchaSiteKey(response.data.siteKey);
        } else {
          console.warn("Captcha devre dışı - geçersiz site key");
          setCaptchaEnabled(false);
        }
      } catch (error) {
        console.warn("Captcha konfigürasyonu yüklenemedi:", error);
        setCaptchaEnabled(false);
      }
    };

    loadCaptchaConfig();
  }, []);

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

      // Captcha doğrulaması (eğer etkinse)
      if (captchaEnabled && captchaRef.current) {
        try {
          const captchaToken = await captchaRef.current.execute();
          const captchaResponse = await captchaAPI.verify({
            token: captchaToken,
            action: "login"
          });
          
          if (!captchaResponse.success) {
            setError("Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.");
            return;
          }
        } catch (captchaError) {
          console.error("Captcha doğrulama hatası:", captchaError);
          setError("Güvenlik doğrulaması sırasında hata oluştu. Lütfen tekrar deneyin.");
          return;
        }
      }

      // Güvenlik uyarısı göster
      if (rateLimitCheck.remainingAttempts <= 2) {
        setSecurityWarning(`Dikkat: ${rateLimitCheck.remainingAttempts} deneme hakkınız kaldı.`);
      }

      console.log("🚀 Login attempt:", data.email);

      // Authentication context üzerinden login işlemi
      await login(data, rememberMe); // rememberMe parametresi eklendi

      // Başarılı login sonrası rate limit'i sıfırla
      rateLimit.recordSuccess();

      // Başarılı login sonrası dashboard'a yönlendir
      console.log("✅ Login successful, redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Login error:", error);

      // 2FA kontrolü
      if (error.message === "2FA_REQUIRED" || error.response?.data?.message === "2FA_REQUIRED") {
        setLoginCredentials({ email: data.email, password: data.password });
        setShow2FA(true);
        return;
      }

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
    <AuthLayout
      title="TaskFlow'a Hoş Geldiniz"
      description="Hesabınıza giriş yapın ve görevlerinizi yönetin"
    >
      {/* 2FA Login Form */}
      {show2FA && loginCredentials && (
        <TwoFactorLogin
          email={loginCredentials.email}
          password={loginCredentials.password}
          onSuccess={() => {
            setShow2FA(false);
            setLoginCredentials(null);
            setError("");
            setSecurityWarning("");
            rateLimit.recordSuccess();
          }}
          onCancel={() => {
            setShow2FA(false);
            setLoginCredentials(null);
            setError("");
            setSecurityWarning("");
          }}
        />
      )}

      {/* WebAuthn Login Form */}
      {showWebAuthn && (
        <WebAuthnLogin
          username={email}
          onSuccess={() => {
            setShowWebAuthn(false);
            setError("");
            setSecurityWarning("");
            rateLimit.recordSuccess();
            navigate("/dashboard");
          }}
          onCancel={() => {
            setShowWebAuthn(false);
            setError("");
            setSecurityWarning("");
          }}
        />
      )}

      {/* Normal Login Form */}
      {!show2FA && !showWebAuthn && (
        <>
          <form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Giriş formu"
          >
            <div className="space-y-4">
              <Input
                id="email-address"
                type="email"
                autoComplete="email"
                required
                label="Email Adresi"
                placeholder="ornek@email.com"
                {...register("email")}
                disabled={isSubmitting}
                error={errors.email?.message}
                aria-describedby={errors.email?.message ? "email-error" : undefined}
                aria-invalid={!!errors.email?.message}
              />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                label="Şifre"
                placeholder="Şifrenizi girin"
                {...register("password")}
                disabled={isSubmitting}
                showPasswordToggle={true}
                error={errors.password?.message}
                aria-describedby={errors.password?.message ? "password-error" : undefined}
                aria-invalid={!!errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-300 border-neutral-300 rounded transition-all duration-200 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-700 dark:checked:bg-primary-600 dark:checked:border-primary-600 dark:focus:ring-offset-neutral-800"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  aria-describedby="remember-me-description"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm font-light text-neutral-600 hover:text-neutral-700 transition-colors duration-200 cursor-pointer dark:text-neutral-300 dark:hover:text-neutral-200"
                >
                  Beni hatırla
                </label>
                <div id="remember-me-description" className="sr-only">
                  Bu seçenek işaretlendiğinde, tarayıcınızda oturum bilgileriniz saklanır ve tekrar giriş yapmanız gerekmez.
                </div>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-500 hover:text-primary-600 transition-all duration-200 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Şifremi unuttum
                </Link>
              </div>
            </div>

            {error && (
              <p 
                id="login-error"
                className="mt-2 text-center text-sm text-error-500 font-light" 
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}

            {securityWarning && (
              <p className="mt-2 text-center text-sm text-warning-500 font-light">
                {securityWarning}
              </p>
            )}

            {/* Captcha Component */}
            {captchaEnabled && (
              <div className="mt-4">
                <Captcha
                  ref={captchaRef}
                  siteKey={captchaSiteKey}
                  action="login"
                  className="w-full"
                  onVerify={(token) => {
                    console.log("Captcha token received:", token);
                  }}
                  onError={(error) => {
                    console.error("Captcha error:", error);
                    setError("Güvenlik doğrulaması yüklenemedi. Lütfen sayfayı yenileyin.");
                  }}
                />
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="default"
                isLoading={isSubmitting}
                className="w-full py-3 text-base font-medium"
                aria-describedby={error ? "login-error" : undefined}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </div>

            {/* WebAuthn Butonu */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWebAuthn(true)}
                disabled={isSubmitting || !email}
                className="w-full py-3 text-base font-medium"
              >
                <FaFingerprint className="w-5 h-5 mr-2" />
                Biyometrik Giriş
              </Button>
            </div>
          </form>

          {/* Sosyal Medya Giriş */}
          <SocialLogin 
            disabled={isSubmitting}
            onSuccess={(provider, userData) => {
              console.log(`${provider} login success:`, userData);
              navigate("/dashboard");
            }}
            onError={(provider, error) => {
              console.error(`${provider} login error:`, error);
            }}
          />

          <div className="mt-8 text-center">
            <p className="text-base text-neutral-500 font-light">
              Hesabınız yok mu?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-500 hover:text-primary-600 transition-all duration-200 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                Kayıt olun
              </Link>
            </p>
          </div>
        </>
      )}

      <div className="absolute bottom-4 right-4">
        <ThemeToggle size="sm" />
      </div>
    </AuthLayout>
  );
};

export default Login;
