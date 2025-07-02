/**
 * Toast Demo Component - TaskFlow
 *
 * Toast sistemini test etmek için basit demo component.
 * Geliştirme ve test amaçlı kullanılır.
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
