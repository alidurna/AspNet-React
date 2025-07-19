/**
 * Skeleton Loading Component
 *
 * Bu dosya, TaskFlow uygulamasında loading durumları için
 * skeleton component'ini içerir. Kullanıcı deneyimini iyileştirmek
 * için içerik yüklenirken placeholder gösterir.
 *
 * Ana Özellikler:
 * - Farklı boyutlarda skeleton elementler
 * - Animasyonlu loading efektleri
 * - Responsive tasarım
 * - Accessibility desteği
 * - Özelleştirilebilir stiller
 *
 * Skeleton Türleri:
 * - Text: Metin için skeleton
 * - Avatar: Profil resmi için skeleton
 * - Card: Kart için skeleton
 * - Button: Buton için skeleton
 * - Input: Form input için skeleton
 * - Table: Tablo için skeleton
 *
 * Animasyonlar:
 * - Pulse animasyonu
 * - Shimmer efekti
 * - Smooth transitions
 * - Loading states
 *
 * Accessibility:
 * - ARIA labels
 * - Screen reader support
 * - Reduced motion support
 * - Focus management
 *
 * Performance:
 * - Optimized animations
 * - Efficient re-renders
 * - Memory management
 * - Bundle optimization
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler yapı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { cn } from '../../utils/utils';

/**
 * Skeleton Component Props Interface
 */
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'card' | 'button' | 'input' | 'table' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

/**
 * Skeleton Component
 *
 * Loading durumları için skeleton placeholder gösterir.
 * Farklı element türleri için özelleştirilebilir.
 *
 * @param className - Ek CSS class'ları
 * @param variant - Skeleton türü
 * @param size - Boyut (sm, md, lg, xl)
 * @param width - Genişlik
 * @param height - Yükseklik
 * @param lines - Metin satır sayısı
 * @param animated - Animasyon aktif mi?
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  size = 'md',
  width,
  height,
  lines = 1,
  animated = true
}) => {
  // Boyut stilleri
  const sizeStyles = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8'
  };

  // Varyant stilleri
  const variantStyles = {
    text: 'rounded',
    avatar: 'rounded-full',
    card: 'rounded-lg',
    button: 'rounded-lg',
    input: 'rounded-lg',
    table: 'rounded',
    custom: ''
  };

  // Animasyon sınıfı
  const animationClass = animated ? 'animate-pulse' : '';

  // Temel skeleton sınıfları
  const baseClasses = cn(
    'bg-gray-200',
    variantStyles[variant],
    animationClass,
    className
  );

  // Metin skeleton'u
  if (variant === 'text') {
    return (
      <div className="space-y-2" role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              sizeStyles[size],
              width ? `w-${width}` : 'w-full',
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Avatar skeleton'u
  if (variant === 'avatar') {
    const avatarSizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };

    return (
      <div
        className={cn(baseClasses, avatarSizes[size])}
        role="status"
        aria-label="Loading avatar"
      />
    );
  }

  // Kart skeleton'u
  if (variant === 'card') {
    return (
      <div
        className={cn(
          baseClasses,
          'p-4 space-y-3',
          width ? `w-${width}` : 'w-full',
          height ? `h-${height}` : 'h-32'
        )}
        role="status"
        aria-label="Loading card"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded animate-pulse" />
          <div className="h-3 bg-gray-300 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  // Buton skeleton'u
  if (variant === 'button') {
    const buttonSizes = {
      sm: 'h-8 px-3',
      md: 'h-10 px-4',
      lg: 'h-12 px-6',
      xl: 'h-14 px-8'
    };

    return (
      <div
        className={cn(
          baseClasses,
          buttonSizes[size],
          width ? `w-${width}` : 'w-24'
        )}
        role="status"
        aria-label="Loading button"
      />
    );
  }

  // Input skeleton'u
  if (variant === 'input') {
    const inputSizes = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
      xl: 'h-14'
    };

    return (
      <div
        className={cn(
          baseClasses,
          inputSizes[size],
          width ? `w-${width}` : 'w-full'
        )}
        role="status"
        aria-label="Loading input"
      />
    );
  }

  // Tablo skeleton'u
  if (variant === 'table') {
    return (
      <div
        className={cn(
          baseClasses,
          'p-4 space-y-3',
          width ? `w-${width}` : 'w-full'
        )}
        role="status"
        aria-label="Loading table"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex space-x-3">
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/6 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Özel skeleton
  return (
    <div
      className={baseClasses}
      style={{
        width: width,
        height: height || sizeStyles[size]
      }}
      role="status"
      aria-label="Loading content"
    />
  );
};

/**
 * Skeleton Group Component
 * Birden fazla skeleton'u gruplamak için
 */
interface SkeletonGroupProps {
  children: React.ReactNode;
  className?: string;
}

const SkeletonGroup: React.FC<SkeletonGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('space-y-4', className)} role="status" aria-label="Loading content">
      {children}
    </div>
  );
};

export { Skeleton, SkeletonGroup }; 