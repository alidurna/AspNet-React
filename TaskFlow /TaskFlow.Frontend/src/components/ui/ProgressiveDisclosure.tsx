/**
 * Progressive Disclosure Component
 *
 * Bu dosya, TaskFlow uygulamasında kullanıcıya bilgileri aşamalı olarak
 * gösteren component'i içerir. Kullanıcı deneyimini iyileştirmek için
 * karmaşık bilgileri basit adımlara böler.
 *
 * Ana Özellikler:
 * - Aşamalı bilgi gösterimi
 * - Expandable/collapsible içerik
 * - Smooth animasyonlar
 * - Accessibility desteği
 * - Keyboard navigation
 * - Icon animasyonları
 *
 * Kullanım Alanları:
 * - Form yardım metinleri
 * - Detaylı açıklamalar
 * - Adım adım rehberler
 * - Gelişmiş ayarlar
 * - Yardım bölümleri
 *
 * Animasyonlar:
 * - Smooth height transitions
 * - Icon rotation
 * - Fade in/out effects
 * - Staggered content reveal
 *
 * Accessibility:
 * - ARIA expanded state
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - Semantic HTML
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

import React, { useState, useRef, useEffect } from 'react';

/**
 * Progressive Disclosure Props Interface
 */
interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'card' | 'minimal';
  animationDuration?: number;
  showIcon?: boolean;
}

/**
 * Progressive Disclosure Component
 *
 * Kullanıcıya bilgileri aşamalı olarak gösterir.
 * Expandable/collapsible içerik ile kullanıcı deneyimini iyileştirir.
 *
 * @param title - Başlık metni
 * @param children - İçerik
 * @param defaultExpanded - Varsayılan olarak açık mı?
 * @param className - Ek CSS class'ları
 * @param icon - Özel ikon
 * @param variant - Görünüm varyantı
 * @param animationDuration - Animasyon süresi (ms)
 * @param showIcon - İkon gösterilsin mi?
 */
const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  children,
  defaultExpanded = false,
  className = '',
  icon,
  variant = 'default',
  animationDuration = 300,
  showIcon = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    defaultExpanded ? undefined : 0
  );
  const contentRef = useRef<HTMLDivElement>(null);

  // İçerik yüksekliğini hesapla
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(isExpanded ? height : 0);
    }
  }, [isExpanded, children]);

  // Toggle fonksiyonu
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Keyboard event handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  // Varsayılan ikon
  const defaultIcon = (
    <svg
      className={`w-5 h-5 transition-transform duration-${animationDuration} ease-out ${
        isExpanded ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  // Varyant stilleri
  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return {
          container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
          header: 'px-4 py-3 hover:bg-gray-50 cursor-pointer',
          content: 'px-4 pb-3 border-t border-gray-100'
        };
      case 'minimal':
        return {
          container: 'border-b border-gray-200',
          header: 'py-2 hover:bg-gray-50 cursor-pointer',
          content: 'pb-2'
        };
      default:
        return {
          container: 'bg-gray-50 rounded-lg',
          header: 'px-4 py-3 hover:bg-gray-100 cursor-pointer',
          content: 'px-4 pb-3'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      <div
        className={`${styles.header} flex items-center justify-between transition-colors duration-200`}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`progressive-disclosure-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center space-x-3">
          {icon && showIcon && (
            <div className="text-gray-500">{icon}</div>
          )}
          <h3 className="text-sm font-medium text-gray-900 leading-relaxed">
            {title}
          </h3>
        </div>
        
        {showIcon && (
          <div className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            {defaultIcon}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        id={`progressive-disclosure-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className={`${styles.content} overflow-hidden transition-all duration-${animationDuration} ease-out`}
        style={{
          height: contentHeight !== undefined ? `${contentHeight}px` : 'auto',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div ref={contentRef} className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProgressiveDisclosure; 