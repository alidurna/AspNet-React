/**
 * Toast Utility Hook - TaskFlow
 *
 * Toast notification'ları için custom hook.
 * Redux store ile entegre çalışır.
 */

import { useAppDispatch } from "../store";

/**
 * Toast Utility Functions
 * Component'lerde kullanım için helper functions
 */
export const useToast = () => {
  const dispatch = useAppDispatch();

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
};
