/**
 * Loading Spinner Component
 * Reusable loading indicator for lazy loading and async operations
 */

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "gray" | "white";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  text,
  fullScreen = false,
  className = "",
}) => {
  // Size mappings
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  // Color mappings
  const colorClasses = {
    blue: "text-blue-600",
    gray: "text-gray-600",
    white: "text-white",
  };

  const spinnerClasses = `
    animate-spin inline-block
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `;

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        {/* Spinner */}
        <svg
          className={spinnerClasses}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="loading-spinner"
          role="status"
          aria-label="Yükleniyor"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        {/* Loading Text */}
        {text && (
          <p className={`text-sm font-medium ${colorClasses[color]}`}>{text}</p>
        )}
      </div>
    </div>
  );
};

// Predefined spinner variants
export const PageLoadingSpinner: React.FC<{ text?: string }> = ({
  text = "Sayfa yükleniyor...",
}) => <LoadingSpinner size="lg" color="blue" text={text} fullScreen />;

export const ComponentLoadingSpinner: React.FC<{ text?: string }> = ({
  text = "Yükleniyor...",
}) => <LoadingSpinner size="md" color="blue" text={text} />;

export const InlineLoadingSpinner: React.FC = () => (
  <LoadingSpinner size="sm" color="blue" />
);

export const ButtonLoadingSpinner: React.FC = () => (
  <LoadingSpinner size="sm" color="white" className="mr-2" />
);

export default LoadingSpinner;
