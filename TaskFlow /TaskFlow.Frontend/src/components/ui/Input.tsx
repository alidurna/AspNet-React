/**
 * Input Component
 *
 * Bu dosya, TaskFlow uygulaması için özelleştirilmiş yeniden kullanılabilir
 * input component'ini içerir. React Hook Form ile tam uyumlu çalışır ve
 * modern form handling prensiplerini destekler.
 *
 * Ana Özellikler:
 * - Label desteği (opsiyonel)
 * - Validation hata mesajları
 * - Sol taraf ikon desteği
 * - Şifre göster/gizle toggle butonu
 * - Focus/blur animasyonları
 * - Tailwind CSS styling
 * - Accessibility (ARIA) desteği
 * - React Hook Form uyumluluğu
 *
 * Input Tipleri:
 * - text, email, password, number, tel, url
 * - Tüm HTML5 input tipleri desteklenir
 * - Password type için özel toggle butonu
 *
 * Validation:
 * - Real-time error display
 * - Visual feedback (kırmızı border)
 * - Animated error messages
 * - Form integration ready
 *
 * Accessibility:
 * - Proper label-input association
 * - Unique ID generation
 * - Screen reader support
 * - Keyboard navigation
 * - Focus indicators
 *
 * Styling:
 * - Consistent design system
 * - Responsive design
 * - Dark mode ready
 * - Customizable via className
 *
 * Performans:
 * - Optimized re-renders
 * - Efficient state management
 * - Minimal bundle impact
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - ForwardRef pattern
 * - Comprehensive prop interface
 * - Açık ve anlaşılır kod
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { forwardRef, useState } from "react";

/**
 * Input Component Props Interface
 * HTML input elementinin tüm özelliklerini extend eder
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Input üstündeki label metni
  error?: string; // Validation hata mesajı
  icon?: React.ReactNode; // Sol taraftaki ikon
  showPasswordToggle?: boolean; // Şifre göster/gizle butonu (sadece password type için)
}

/**
 * Reusable Input Component
 *
 * TaskFlow uygulaması için özelleştirilmiş input component'i.
 * React Hook Form ile uyumlu çalışır ve forwardRef kullanır.
 *
 * Özellikler:
 * - Label desteği
 * - Hata mesajı gösterimi
 * - Sol taraf ikon desteği
 * - Şifre göster/gizle özelliği
 * - Focus/blur animasyonları
 * - Tailwind CSS ile styling
 * - Accessibility desteği
 *
 * @param props - Input component özellikleri
 * @param ref - React ref (React Hook Form için gerekli)
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      showPasswordToggle,
      type,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    // Şifre görünürlük state'i (sadece password type için)
    const [showPassword, setShowPassword] = useState(false);

    // Input focus durumu (border animasyonu için)
    const [isFocused, setIsFocused] = useState(false);

    // Unique ID for accessibility (kullanıcı ID vermezse otomatik generate et)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Şifre göster/gizle özelliği aktifse input type'ını değiştir
    const inputType =
      showPasswordToggle && type === "password"
        ? showPassword
          ? "text"
          : "password"
        : type;

    return (
      <div className="space-y-1">
        {/* ===== INPUT LABEL ===== */}
        {/* Opsiyonel label - varsa göster */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* ===== INPUT CONTAINER ===== */}
        {/* İkon ve input'u içeren relative container */}
        <div className="relative">
          {/* Sol Taraf İkon */}
          {/* Opsiyonel - varsa input'un sol tarafında göster */}
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          {/* ===== MAIN INPUT ELEMENT ===== */}
          <input
            ref={ref} // React Hook Form için ref
            id={inputId} // Accessibility için unique ID
            type={inputType} // Dynamic type (password toggle için)
            className={`
              input-field
              ${icon ? "pl-10" : ""} // Sol ikon varsa padding ekle
              ${
                showPasswordToggle ? "pr-10" : ""
              } // Şifre toggle varsa sağ padding
              ${
                error ? "border-red-300 focus:ring-red-500" : ""
              } // Hata durumunda kırmızı border
              ${
                isFocused ? "ring-2 ring-primary-500 border-transparent" : ""
              } // Focus durumunda mavi ring
              ${className} // Dışarıdan gelen ek class'lar
            `}
            onFocus={() => setIsFocused(true)} // Focus olunca state güncelle
            onBlur={() => setIsFocused(false)} // Blur olunca state güncelle
            {...props} // Diğer tüm HTML input props'ları
          />

          {/* ===== PASSWORD TOGGLE BUTTON ===== */}
          {/* Şifre göster/gizle butonu - sadece password type için */}
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)} // Şifre görünürlüğünü toggle et
            >
              {showPassword ? (
                // Şifre görünürken - gizle ikonu (kapalı göz)
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                // Şifre gizliyken - göster ikonu (açık göz)
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* ===== ERROR MESSAGE ===== */}
        {/* Validation hata mesajı - varsa göster */}
        {error && (
          <p className="text-sm text-red-600 animate-slide-up">{error}</p>
        )}
      </div>
    );
  }
);

// Component ismini set et (React DevTools için)
Input.displayName = "Input";

export default Input;
