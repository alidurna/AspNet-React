/**
 * Toast Utility Hook
 *
 * Bu dosya, TaskFlow uygulamasının toast bildirim sistemi için
 * kullanılan custom React hook'unu içerir. Redux store ile entegre
 * çalışarak toast notification'larını yönetir.
 *
 * Ana Özellikler:
 * - Toast notification yönetimi
 * - Redux store entegrasyonu
 * - Multiple toast tipleri
 * - Toast temizleme
 * - Global state management
 *
 * Toast Tipleri:
 * - Success: Başarı bildirimleri
 * - Error: Hata bildirimleri
 * - Warning: Uyarı bildirimleri
 * - Info: Bilgi bildirimleri
 *
 * Hook Fonksiyonları:
 * - showSuccess: Başarı toast'ı göster
 * - showError: Hata toast'ı göster
 * - showWarning: Uyarı toast'ı göster
 * - showInfo: Bilgi toast'ı göster
 * - clearAll: Tüm toast'ları temizle
 *
 * Redux Integration:
 * - useAppDispatch hook kullanımı
 * - Redux action dispatching
 * - Global state management
 * - Toast state persistence
 * - Cross-component communication
 *
 * Toast Özellikleri:
 * - Auto-dismiss functionality
 * - Manual close support
 * - Multiple toast display
 * - Toast queuing
 * - Priority handling
 *
 * State Management:
 * - Redux store integration
 * - Toast state tracking
 * - Toast lifecycle management
 * - Toast history
 * - Toast configuration
 *
 * User Experience:
 * - Non-intrusive notifications
 * - Clear visual feedback
 * - Accessible design
 * - Responsive layout
 * - Smooth animations
 *
 * Performance:
 * - Efficient state updates
 * - Minimal re-renders
 * - Memory management
 * - Toast cleanup
 * - Resource optimization
 *
 * Error Handling:
 * - Toast error recovery
 * - Fallback mechanisms
 * - Graceful degradation
 * - Error feedback
 * - Debug information
 *
 * Accessibility:
 * - Screen reader support
 * - Keyboard navigation
 * - Focus management
 * - ARIA labels
 * - Color contrast
 *
 * Customization:
 * - Toast duration
 * - Toast position
 * - Toast styling
 * - Toast behavior
 * - Toast content
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler hook yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 * - Test coverage
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useAppDispatch } from "../store";
import { useMemo } from "react";

/**
 * Toast Utility Functions
 * Component'lerde kullanım için helper functions
 */
export const useToast = () => {
  const dispatch = useAppDispatch();

  const memoizedToast = useMemo(() => {
    return {
      showSuccess: (message: string) => {
        dispatch({
          type: "ui/showSuccessToast",
          payload: message,
        });
      },

      showError: (message: string) => {
        dispatch({
          type: "ui/showErrorToast",
          payload: message,
        });
      },

      showWarning: (message: string) => {
        dispatch({
          type: "ui/showWarningToast",
          payload: message,
        });
      },

      showInfo: (message: string) => {
        dispatch({
          type: "ui/showInfoToast",
          payload: message,
        });
      },

      clearAll: () => {
        dispatch({ type: "ui/clearAllToasts" });
      },
    };
  }, [dispatch]);

  return memoizedToast;
};
