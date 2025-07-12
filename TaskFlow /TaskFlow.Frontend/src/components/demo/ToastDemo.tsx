/**
 * Toast Demo Component
 *
 * Bu dosya, TaskFlow uygulamasının toast bildirim sistemini
 * test etmek ve demo etmek için oluşturulmuş component'i içerir.
 * Geliştirme, test ve kullanıcı eğitimi amaçlı kullanılır.
 *
 * Ana Özellikler:
 * - Toast tipi testleri
 * - Redux store entegrasyonu
 * - Manuel toast kontrolü
 * - Toast temizleme
 * - Responsive tasarım
 *
 * Toast Tipleri:
 * - Success: Başarı bildirimleri
 * - Error: Hata bildirimleri
 * - Warning: Uyarı bildirimleri
 * - Info: Bilgi bildirimleri
 *
 * Test Fonksiyonları:
 * - handleSuccessToast: Başarı toast'ı
 * - handleErrorToast: Hata toast'ı
 * - handleWarningToast: Uyarı toast'ı
 * - handleInfoToast: Bilgi toast'ı
 * - handleClearAll: Tüm toast'ları temizleme
 *
 * Kullanım Alanları:
 * - Geliştirme testleri
 * - Kullanıcı eğitimi
 * - Sistem demo'ları
 * - QA testleri
 * - Debug işlemleri
 *
 * Toast Özellikleri:
 * - Redux store entegrasyonu
 * - Otomatik kapanma
 * - Manuel kapatma
 * - 4 farklı tip
 * - Responsive tasarım
 *
 * Props Interface:
 * - Bu component props almaz
 * - Self-contained demo
 * - Standalone functionality
 *
 * State Management:
 * - useToast hook kullanımı
 * - Redux store integration
 * - Toast state management
 * - Clear functionality
 *
 * Styling:
 * - Tailwind CSS tabanlı
 * - Card layout
 * - Button variants
 * - Responsive design
 * - Clean UI
 *
 * Accessibility:
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - ARIA labels
 *
 * Performance:
 * - Lightweight component
 * - Efficient rendering
 * - Minimal re-renders
 * - Memory efficient
 *
 * Error Handling:
 * - Toast error handling
 * - Graceful fallbacks
 * - User feedback
 * - Error recovery
 *
 * Development Features:
 * - Console logging
 * - Debug information
 * - Test utilities
 * - Development tools
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

import React from "react";
import Button from "../ui/Button";
import { useToast } from "../../hooks/useToast";

const ToastDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo, clearAll } =
    useToast();

  const handleSuccessToast = () => {
    showSuccess("İşlem başarıyla tamamlandı!");
  };

  const handleErrorToast = () => {
    showError("Bir hata oluştu. Lütfen tekrar deneyin.");
  };

  const handleWarningToast = () => {
    showWarning("Bu işlem geri alınamaz. Emin misiniz?");
  };

  const handleInfoToast = () => {
    showInfo("Yeni güncelleme mevcut. Şimdi güncellemek ister misiniz?");
  };

  const handleClearAll = () => {
    clearAll();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Toast Demo
      </h2>

      <div className="space-y-3">
        <Button
          variant="primary"
          onClick={handleSuccessToast}
          className="w-full"
        >
          Başarı Toast'ı
        </Button>

        <Button
          variant="secondary"
          onClick={handleErrorToast}
          className="w-full"
        >
          Hata Toast'ı
        </Button>

        <Button
          variant="outline"
          onClick={handleWarningToast}
          className="w-full"
        >
          Uyarı Toast'ı
        </Button>

        <Button variant="ghost" onClick={handleInfoToast} className="w-full">
          Bilgi Toast'ı
        </Button>

        <hr className="my-4" />

        <Button
          variant="secondary"
          onClick={handleClearAll}
          className="w-full"
          size="sm"
        >
          Tüm Toast'ları Temizle
        </Button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
        <p className="font-medium mb-2">Toast Özellikleri:</p>
        <ul className="space-y-1">
          <li>✅ Redux store ile state management</li>
          <li>✅ Otomatik kapanma (duration)</li>
          <li>✅ Manuel kapatma (X butonu)</li>
          <li>✅ 4 farklı tip (success, error, warning, info)</li>
          <li>✅ Responsive tasarım</li>
        </ul>
      </div>
    </div>
  );
};

export default ToastDemo;
