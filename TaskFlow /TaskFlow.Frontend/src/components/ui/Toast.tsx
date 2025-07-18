/**
 * Toast Notification Component
 *
 * Bu dosya, TaskFlow uygulaması için özelleştirilmiş toast bildirim
 * sistemini içerir. Modern ve kullanıcı dostu bildirimler sağlar.
 *
 * Ana Özellikler:
 * - 4 farklı toast tipi (success, error, warning, info)
 * - Redux store entegrasyonu
 * - Otomatik kapanma
 * - Modern tasarım
 * - Accessibility desteği
 *
 * @author TaskFlow Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "../../store";
import { selectToasts, removeToast } from "../../store/slices/uiSlice";

/**
 * Toast Icon Components
 */
const ToastIcons = {
  success: (
    <svg
      className="w-5 h-5 text-white"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5 text-white"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5 text-white"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5 text-white"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * Custom Toast Component
 */
interface CustomToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
  message,
  type,
  onClose,
}) => {
  const bgColorClass = {
    success: "bg-gradient-to-r from-green-500 to-green-600",
    error: "bg-gradient-to-r from-red-500 to-red-600",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    info: "bg-gradient-to-r from-blue-500 to-blue-600",
  }[type];

  return (
    <div
      className={`max-w-sm w-full ${bgColorClass} rounded-xl shadow-xl border-0 text-white pointer-events-auto transform transition-all duration-300 ease-out hover:scale-105`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-1">
              {ToastIcons[type]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <button
            className="ml-4 flex-shrink-0 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={onClose}
          >
            <span className="sr-only">Kapat</span>
            <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Toast Manager Component
 * Redux store'dan toast'ları okur ve react-hot-toast ile render eder
 */
export const ToastManager: React.FC = () => {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();
  const processedToasts = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Yeni toast'ları işle
    toasts.forEach((toastItem) => {
      // Eğer toast zaten işlenmişse atla
      if (processedToasts.current.has(toastItem.id)) {
        return;
      }

      // Aynı mesaj ve tip zaten gösteriliyorsa atla
      const existingToastElement = document.querySelector(`[data-toast-id="${toastItem.id}"]`);
      if (existingToastElement) {
        processedToasts.current.add(toastItem.id);
        return;
      }

      // Toast'u işlenmiş olarak işaretle
      processedToasts.current.add(toastItem.id);

      // react-hot-toast ile toast göster
      toast(
        (t) => (
          <CustomToast
            message={toastItem.message}
            type={toastItem.type}
            onClose={() => {
              toast.dismiss(t.id);
              dispatch(removeToast(toastItem.id));
              processedToasts.current.delete(toastItem.id);
            }}
          />
        ),
        {
          id: toastItem.id,
          duration: toastItem.persistent
            ? Infinity
            : toastItem.duration || 4000,
          position: "top-right",
          style: {
            background: 'transparent',
            padding: 0,
            margin: 0,
            boxShadow: 'none',
            border: 'none',
          },
        }
      );

      // Otomatik temizleme (persistent değilse)
      if (!toastItem.persistent && toastItem.duration) {
        setTimeout(() => {
          dispatch(removeToast(toastItem.id));
          processedToasts.current.delete(toastItem.id);
        }, toastItem.duration);
      }
    });

    // Redux store'dan silinen toast'ları temizle
    const currentToastIds = new Set(toasts.map(t => t.id));
    processedToasts.current.forEach(toastId => {
      if (!currentToastIds.has(toastId)) {
        processedToasts.current.delete(toastId);
      }
    });
  }, [toasts, dispatch]);

  return null;
};

/**
 * Toast Provider Component
 * Redux store ile entegre toast sistemi sağlar
 */
export const ToastProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <>
      {children}
      <ToastManager />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerClassName="!z-50"
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            margin: 0,
            border: "none",
          },
          success: {
            duration: 4000,
          },
          error: {
            duration: 6000,
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
