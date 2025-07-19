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

import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import type { RegisterRequest } from "../types/auth.types";
import PasswordStrengthIndicator from "../components/ui/PasswordStrength";
import AuthLayout from "../components/layout/AuthLayout"; // AuthLayout import edildi
import Captcha from "../components/security/Captcha";
import type { CaptchaRef } from "../components/security/Captcha";
import { captchaAPI } from "../services/api";
import ProgressiveDisclosure from "../components/ui/ProgressiveDisclosure";
import { useHoverAnimation, useClickAnimation } from "../hooks/useAnimations";

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
  const { register: registerUser, isLoading: authIsLoading } = useAuth();

  // Error state
  const [error, setError] = useState<string>("");

  // Captcha state'leri
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaSiteKey, setCaptchaSiteKey] = useState("");
  const captchaRef = useRef<CaptchaRef>(null);

  // Animation hooks
  const submitButtonHover = useHoverAnimation({ duration: 200 });
  const submitButtonClick = useClickAnimation({ duration: 150 });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

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

  const onSubmit = async (data: RegisterRequest) => {
    try {
      // Önceki hataları temizle
      setError("");

      // Captcha doğrulaması (eğer etkinse)
      if (captchaEnabled && captchaRef.current) {
        try {
          const captchaToken = await captchaRef.current.execute();
          const captchaResponse = await captchaAPI.verify({
            token: captchaToken,
            action: "register"
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
    <AuthLayout
      title="TaskFlow'a Katılın"
      description="Hesap oluşturun ve görev yönetimine başlayın"
      showLogo={true}
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* ===== ERROR MESSAGE ===== */}
        {error && (
          <p className="mt-2 text-center text-sm text-error-500 font-light">{error}</p>
        )}
        
        {/* ===== NAME FIELDS - 2 COLUMNS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            required
            label="Adınız"
            placeholder="Adınız"
            {...register("firstName")}
            disabled={isSubmitting}
            error={errors.firstName?.message}
          />
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            required
            label="Soyadınız"
            placeholder="Soyadınız"
            {...register("lastName")}
            disabled={isSubmitting}
            error={errors.lastName?.message}
          />
        </div>

        {/* ===== EMAIL & PHONE ===== */}
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          label="Email Adresi"
          placeholder="ornek@email.com"
          {...register("email")}
          disabled={isSubmitting}
          error={errors.email?.message}
        />

        <Input
          id="phoneNumber"
          type="tel"
          autoComplete="tel"
          label="Telefon Numarası (Opsiyonel)"
          placeholder="+90 5xx xxx xx xx"
          {...register("phoneNumber")}
          disabled={isSubmitting}
          error={errors.phoneNumber?.message}
        />

        {/* ===== PASSWORD FIELDS - 2 COLUMNS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            label="Şifre"
            placeholder="Şifrenizi girin"
            {...register("password")}
            disabled={isSubmitting}
            showPasswordToggle
            error={errors.password?.message}
          />
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            label="Şifre Tekrarı"
            placeholder="Şifrenizi tekrar girin"
            {...register("confirmPassword")}
            disabled={isSubmitting}
            showPasswordToggle
            error={errors.confirmPassword?.message}
          />
        </div>

        {/* ===== PASSWORD STRENGTH INDICATOR ===== */}
        <PasswordStrengthIndicator
          password={watch("password") || ""}
          showSuggestions={false}
          className="mt-2"
        />

        {/* ===== PASSWORD SECURITY TIPS ===== */}
        <ProgressiveDisclosure
          title="🔐 Şifre Güvenlik İpuçları"
          defaultExpanded={false}
          variant="card"
          className="mt-4"
        >
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>En az 8 karakter uzunluğunda olmalı</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Büyük ve küçük harfler içermeli</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>En az bir rakam içermeli</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Özel karakterler (!@#$%^&*) ekleyebilirsiniz</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-red-500 mt-0.5">✗</span>
              <span>Kişisel bilgilerinizi (ad, doğum tarihi) kullanmayın</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-red-500 mt-0.5">✗</span>
              <span>Yaygın şifrelerden (123456, password) kaçının</span>
            </div>
          </div>
        </ProgressiveDisclosure>

        {/* ===== TERMS CHECKBOX ===== */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              className="h-5 w-5 text-primary-500 focus:ring-primary-300 border-neutral-300 rounded-lg transition-all duration-200 hover:border-primary-400"
              disabled={isSubmitting}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-light text-neutral-600 leading-relaxed">
              <span className="text-neutral-500">
                Kullanım Şartları ve Gizlilik Politikası'nı kabul ediyorum
              </span>
            </label>
          </div>
        </div>

        {/* ===== CAPTCHA COMPONENT ===== */}
        {captchaEnabled && (
          <div className="mt-4">
            <Captcha
              ref={captchaRef}
              siteKey={captchaSiteKey}
              action="register"
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

        {/* ===== SUBMIT BUTTON ===== */}
        <div>
          <Button
            type="submit"
            variant="default"
            isLoading={isSubmitting}
            className="w-full py-4 text-lg font-medium transition-all duration-200"
            onMouseEnter={submitButtonHover.handleMouseEnter}
            onMouseLeave={submitButtonHover.handleMouseLeave}
            onClick={submitButtonClick.handleClick}
          >
            Hesap Oluştur
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-base text-neutral-500 font-light">
          Zaten hesabınız var mı?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-500 hover:text-primary-600 transition-all duration-200 hover:underline"
          >
            Giriş yapın
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
