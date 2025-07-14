/**
 * Password Strength Component
 *
 * Bu dosya, şifre gücünü gerçek zamanlı olarak gösteren bileşeni içerir.
 * Modern güvenlik standartlarına uygun şifre gücü değerlendirmesi yapar.
 *
 * Ana Özellikler:
 * - Gerçek zamanlı şifre gücü analizi
 * - Görsel güç göstergesi (progress bar)
 * - Renk kodlu güç seviyeleri
 * - Detaylı güvenlik önerileri
 * - Erişilebilirlik desteği
 *
 * Güç Seviyeleri:
 * - Çok Zayıf (0-20): Kırmızı
 * - Zayıf (21-40): Turuncu
 * - Orta (41-60): Sarı
 * - Güçlü (61-80): Açık yeşil
 * - Çok Güçlü (81-100): Koyu yeşil
 *
 * Güvenlik Kriterleri:
 * - Uzunluk (min 8 karakter)
 * - Büyük/küçük harf karışımı
 * - Rakam içerme
 * - Özel karakter içerme
 * - Tekrar karakter kontrolü
 * - Yaygın şifre kontrolü
 *
 * Erişilebilirlik:
 * - ARIA labels ve descriptions
 * - Screen reader desteği
 * - Keyboard navigation
 * - Color contrast compliance
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useMemo } from "react";

/**
 * Şifre gücü seviyeleri için tip tanımı
 */
type StrengthLevel = "very-weak" | "weak" | "medium" | "strong" | "very-strong";

/**
 * Şifre gücü analizi sonucu
 */
interface PasswordAnalysis {
  score: number;
  level: StrengthLevel;
  feedback: string[];
  color: string;
  bgColor: string;
}

/**
 * Password Strength Component Props Interface
 */
interface PasswordStrengthProps {
  password: string;
  showFeedback?: boolean;
  className?: string;
}

/**
 * Password Strength Component
 *
 * Şifre gücünü gerçek zamanlı olarak analiz eden ve görselleştiren bileşen.
 * Modern güvenlik standartlarına uygun değerlendirme yapar.
 *
 * @param password - Analiz edilecek şifre
 * @param showFeedback - Detaylı geri bildirim gösterilsin mi?
 * @param className - Ek CSS sınıfları
 */
const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showFeedback = true,
  className = "",
}) => {
  /**
   * Şifre gücünü analiz eden fonksiyon
   * @param password - Analiz edilecek şifre
   * @returns PasswordAnalysis - Analiz sonucu
   */
  const analyzePassword = (password: string): PasswordAnalysis => {
    if (!password) {
      return {
        score: 0,
        level: "very-weak",
        feedback: ["Şifre giriniz"],
        color: "text-red-500",
        bgColor: "bg-red-500",
      };
    }

    let score = 0;
    const feedback: string[] = [];

    // Uzunluk kontrolü (0-25 puan)
    if (password.length >= 8) {
      score += Math.min(25, password.length * 2);
    } else {
      feedback.push("En az 8 karakter olmalı");
    }

    // Büyük harf kontrolü (0-15 puan)
    if (/[A-Z]/.test(password)) {
      score += 15;
    } else {
      feedback.push("En az bir büyük harf içermeli");
    }

    // Küçük harf kontrolü (0-15 puan)
    if (/[a-z]/.test(password)) {
      score += 15;
    } else {
      feedback.push("En az bir küçük harf içermeli");
    }

    // Rakam kontrolü (0-15 puan)
    if (/\d/.test(password)) {
      score += 15;
    } else {
      feedback.push("En az bir rakam içermeli");
    }

    // Özel karakter kontrolü (0-15 puan)
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 15;
    } else {
      feedback.push("En az bir özel karakter içermeli");
    }

    // Tekrar karakter kontrolü (0-15 puan)
    const hasRepeatingChars = /(.)\1{2,}/.test(password);
    if (!hasRepeatingChars) {
      score += 15;
    } else {
      feedback.push("Üç veya daha fazla tekrar karakter kullanmayın");
    }

    // Yaygın şifre kontrolü
    const commonPasswords = [
      "password", "123456", "123456789", "qwerty", "abc123",
      "password123", "admin", "letmein", "welcome", "monkey"
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      score = Math.max(0, score - 30);
      feedback.push("Yaygın şifre kullanmayın");
    }

    // Güç seviyesi belirleme
    let level: StrengthLevel;
    let color: string;
    let bgColor: string;

    if (score >= 81) {
      level = "very-strong";
      color = "text-green-600";
      bgColor = "bg-green-500";
      feedback.length = 0;
      feedback.push("Mükemmel! Güçlü bir şifre seçtiniz");
    } else if (score >= 61) {
      level = "strong";
      color = "text-green-500";
      bgColor = "bg-green-400";
      feedback.length = 0;
      feedback.push("Güçlü şifre");
    } else if (score >= 41) {
      level = "medium";
      color = "text-yellow-600";
      bgColor = "bg-yellow-500";
    } else if (score >= 21) {
      level = "weak";
      color = "text-orange-500";
      bgColor = "bg-orange-500";
    } else {
      level = "very-weak";
      color = "text-red-500";
      bgColor = "bg-red-500";
    }

    return { score, level, feedback, color, bgColor };
  };

  // Şifre analizi sonucu
  const analysis = useMemo(() => analyzePassword(password), [password]);

  // Güç seviyesi metinleri
  const strengthTexts = {
    "very-weak": "Çok Zayıf",
    "weak": "Zayıf",
    "medium": "Orta",
    "strong": "Güçlü",
    "very-strong": "Çok Güçlü",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Güç göstergesi progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Şifre Gücü
          </span>
          <span className={`text-sm font-semibold ${analysis.color}`}>
            {strengthTexts[analysis.level]}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ease-out ${analysis.bgColor}`}
            style={{ width: `${analysis.score}%` }}
            role="progressbar"
            aria-valuenow={analysis.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Şifre gücü: ${analysis.score}%`}
          />
        </div>
      </div>

      {/* Detaylı geri bildirim */}
      {showFeedback && analysis.feedback.length > 0 && (
        <div className="space-y-1">
          {analysis.feedback.map((feedback, index) => (
            <div
              key={index}
              className={`flex items-center text-xs ${
                analysis.level === "very-strong" || analysis.level === "strong"
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <svg
                className={`w-3 h-3 mr-1 ${
                  analysis.level === "very-strong" || analysis.level === "strong"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                {analysis.level === "very-strong" || analysis.level === "strong" ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              {feedback}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength; 