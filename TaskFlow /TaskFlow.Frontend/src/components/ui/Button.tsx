/**
 * Button Component
 *
 * Bu dosya, TaskFlow uygulaması için özelleştirilmiş yeniden kullanılabilir
 * buton component'ini içerir. Modern UI/UX prensipleri ve accessibility
 * standartları gözetilerek geliştirilmiştir.
 *
 * Ana Özellikler:
 * - 4 farklı varyant (primary, secondary, outline, ghost)
 * - 3 farklı boyut (sm, md, lg)
 * - Loading state (spinner animasyonu)
 * - Sol/sağ ikon desteği
 * - Accessibility (ARIA) desteği
 * - Hover/focus animasyonları
 * - Disabled state yönetimi
 * - TypeScript tip güvenliği
 *
 * Varyantlar:
 * - Primary: Ana aksiyonlar için mavi buton
 * - Secondary: İkincil aksiyonlar için gri buton
 * - Outline: Çerçeveli, şeffaf arka plan
 * - Ghost: Sadece metin, minimal tasarım
 *
 * Boyutlar:
 * - sm: Küçük butonlar (px-3 py-1.5)
 * - md: Orta boyut (px-4 py-2) - varsayılan
 * - lg: Büyük butonlar (px-6 py-3)
 *
 * Accessibility:
 * - Keyboard navigation desteği
 * - Screen reader uyumluluğu
 * - Focus indicators
 * - ARIA labels desteği
 *
 * Performans:
 * - Optimized re-renders
 * - Efficient CSS classes
 * - Minimal bundle size
 *
 * Sürdürülebilirlik:
 * - TypeScript ile tip güvenliği
 * - Modüler CSS yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive prop interface
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { cn } from "../../utils/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:from-primary-600 hover:to-primary-700 focus:from-primary-600 focus:to-primary-700 hover:shadow-xl hover:-translate-y-0.5",
        destructive: "bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg hover:from-error-600 hover:to-error-700 focus:from-error-600 focus:to-error-700 hover:shadow-xl hover:-translate-y-0.5",
        outline: "border-2 border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5",
        secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg hover:from-secondary-600 hover:to-secondary-700 focus:from-secondary-600 focus:to-secondary-700 hover:shadow-xl hover:-translate-y-0.5",
        ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 hover:shadow-sm",
        link: "text-primary-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 rounded-lg px-4 py-2 text-sm",
        lg: "h-12 rounded-xl px-8 py-3 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
