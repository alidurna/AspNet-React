/**
 * PWA Install Banner Component
 * Shows a beautiful banner to prompt users to install the app
 */

import React, { useState, useEffect } from "react";
import usePWA from "../../hooks/usePWA";

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
        fixed bottom-4 left-4 right-4 z-50 
        bg-gradient-to-r from-blue-600 to-purple-600 
        text-white rounded-lg shadow-2xl
        transform transition-all duration-500 ease-out
        ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }
        md:left-auto md:right-4 md:max-w-sm
        ${className}
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">TaskFlow Uygulaması</h3>
              <p className="text-blue-100 text-sm">
                Daha hızlı erişim için yükle
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors p-1"
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Benefits */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-blue-100">
            <svg
              className="w-4 h-4 text-green-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Offline çalışma</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-blue-100">
            <svg
              className="w-4 h-4 text-green-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Anlık bildirimler</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-blue-100">
            <svg
              className="w-4 h-4 text-green-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Daha hızlı yükleme</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleInstall}
            className="
              flex-1 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg
              hover:bg-blue-50 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-white/20
            "
          >
            Yükle
          </button>
          <button
            onClick={handleDismiss}
            className="
              px-4 py-2 text-white/80 hover:text-white font-medium
              hover:bg-white/10 rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-white/20
            "
          >
            Şimdi değil
          </button>
        </div>
      </div>

      {/* Progress bar animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
        <div className="h-full bg-white/40 rounded-b-lg animate-pulse" />
      </div>
    </div>
  );
};

export default PWAInstallBanner;
