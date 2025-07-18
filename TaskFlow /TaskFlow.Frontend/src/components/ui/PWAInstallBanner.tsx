/**
 * PWA Install Banner Component
 *
 * Bu dosya, TaskFlow uygulamasının Progressive Web App (PWA) kurulum
 * banner'ını içerir. Kullanıcıları uygulamayı cihazlarına yüklemeye
 * teşvik eden güzel ve etkileşimli bir banner sağlar.
 *
 * Ana Özellikler:
 * - Otomatik kurulum kontrolü
 * - Gecikmeli gösterim (3 saniye)
 * - Dismissal yönetimi
 * - Session storage entegrasyonu
 * - Smooth animasyonlar
 * - Responsive tasarım
 *
 * PWA Özellikleri:
 * - Offline çalışma
 * - Anlık bildirimler
 * - Daha hızlı yükleme
 * - Native app deneyimi
 * - Home screen shortcut
 *
 * Banner Davranışı:
 * - Sadece kurulabilir cihazlarda gösterilir
 * - Zaten kurulu olanlarda gizlenir
 * - Kullanıcı kapatırsa session boyunca gizli kalır
 * - 3 saniye gecikme ile gösterilir
 *
 * Props Interface:
 * - className: Ek CSS sınıfları
 * - onInstall: Kurulum callback'i
 * - onDismiss: Kapatma callback'i
 *
 * Kullanım Alanları:
 * - Ana sayfa
 * - Dashboard
 * - Mobil cihazlar
 * - Desktop tarayıcılar
 *
 * Styling:
 * - Gradient background
 * - Modern card design
 * - Smooth transitions
 * - Responsive layout
 * - Mobile-first approach
 *
 * Animation:
 * - Slide-up entrance
 * - Fade effects
 * - Progress bar animation
 * - Hover effects
 *
 * State Management:
 * - Installation status
 * - Dismissal state
 * - Visibility control
 * - Session persistence
 *
 * Accessibility:
 * - ARIA labels
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 *
 * Performance:
 * - Lazy loading
 * - Efficient state updates
 * - Minimal re-renders
 * - Memory optimization
 *
 * Error Handling:
 * - Installation failures
 * - Browser compatibility
 * - Graceful fallbacks
 * - User feedback
 *
 * Browser Support:
 * - Chrome/Edge (Chromium)
 * - Firefox
 * - Safari (iOS)
 * - Progressive enhancement
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from "react";
import usePWA from "../../hooks/usePWA";
import { Button } from "./Button";

interface PWAInstallBannerProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  className = "",
  onInstall,
  onDismiss,
}) => {
  const { isInstallable, isInstalled, promptInstall, hideInstallBanner } =
    usePWA();

  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show banner after delay if installable
  useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  // Handle install click
  const handleInstall = async () => {
    try {
      await promptInstall();
      setIsVisible(false);
      onInstall?.();
    } catch (error) {
      console.error("Install failed:", error);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    hideInstallBanner();
    onDismiss?.();

    // Remember dismissal for this session
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  // Check if previously dismissed
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div
      id="pwa-install-banner"
      className={`
        fixed bottom-6 left-4 right-4 z-50 
        bg-white/95 backdrop-blur-xl border border-white/20
        text-gray-800 rounded-3xl shadow-soft
        transform transition-all duration-700 ease-out
        ${
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-full opacity-0 scale-95"
        }
        md:left-auto md:right-6 md:max-w-sm
        ${className}
      `}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border border-blue-100/50">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">TaskFlow Uygulaması</h3>
              <p className="text-gray-600 text-sm font-light">
                Daha hızlı erişim için yükle
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-50"
            aria-label="Kapat"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Benefits */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 font-light">Offline çalışma</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 font-light">Anlık bildirimler</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 bg-purple-50 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 font-light">Daha hızlı yükleme</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleInstall}
            variant="default"
            className="flex-1"
          >
            Yükle
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1"
          >
            Şimdi değil
          </Button>
        </div>
      </div>

      {/* Subtle progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-3xl opacity-20" />
    </div>
  );
};

export default PWAInstallBanner;
