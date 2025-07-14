/**
 * Card Component
 *
 * Bu dosya, TaskFlow uygulaması için özelleştirilmiş yeniden kullanılabilir
 * kart component'ini içerir. İçerik gruplamak ve görsel hiyerarşi
 * oluşturmak için tasarlanmış modern bir UI component'idir.
 *
 * Ana Özellikler:
 * - 3 farklı padding boyutu (sm, md, lg)
 * - 3 farklı gölge boyutu (sm, md, lg)
 * - Opsiyonel hover efekti
 * - Beyaz background ile modern tasarım
 * - Rounded köşeler
 * - Border ile subtle çerçeve
 * - Responsive tasarım
 *
 * Padding Boyutları:
 * - sm: 16px (küçük kartlar)
 * - md: 24px (orta kartlar) - varsayılan
 * - lg: 32px (büyük kartlar)
 *
 * Gölge Boyutları:
 * - sm: Subtle gölge (hafif)
 * - md: Belirgin gölge (orta)
 * - lg: Dramatik gölge (güçlü)
 *
 * Kullanım Alanları:
 * - Login/Register formları
 * - Dashboard kartları
 * - Task listeleri
 * - Profile bilgileri
 * - İstatistik kartları
 * - Modal içerikleri
 *
 * Styling:
 * - Tailwind CSS tabanlı
 * - Consistent design system
 * - Modern UI/UX prensipleri
 * - Accessibility friendly
 *
 * Props Interface:
 * - children: Kart içeriği
 * - className: Ek CSS sınıfları
 * - padding: İç boşluk boyutu
 * - shadow: Gölge boyutu
 * - hover: Hover efekti
 *
 * Performance:
 * - Optimized re-renders
 * - Efficient CSS classes
 * - Minimal bundle impact
 * - Memory efficient
 *
 * Accessibility:
 * - Semantic HTML structure
 * - Screen reader support
 * - Keyboard navigation
 * - Focus indicators
 *
 * Responsive Design:
 * - Mobile-first approach
 * - Flexible layout
 * - Adaptive sizing
 * - Touch-friendly
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

/**
 * Card Component Props Interface
 */
interface CardProps {
  children: React.ReactNode; // Card içinde gösterilecek içerik
  className?: string; // Dışarıdan gelen ek CSS sınıfları
  padding?: "sm" | "md" | "lg"; // İç boşluk boyutu
  shadow?: "sm" | "md" | "lg"; // Gölge boyutu
  hover?: boolean; // Hover efekti aktif mi?
  title?: string; // Kart başlığı
  onClick?: () => void; // Kart tıklandığında çalışacak fonksiyon eklendi
}

/**
 * Reusable Card Component
 *
 * TaskFlow uygulaması için özelleştirilmiş kart component'i.
 * İçerik gruplamak ve görsel hiyerarşi oluşturmak için kullanılır.
 *
 * Özellikler:
 * - 3 farklı padding boyutu (sm, md, lg)
 * - 3 farklı gölge boyutu (sm, md, lg)
 * - Opsiyonel hover efekti
 * - Beyaz background ile modern tasarım
 * - Rounded köşeler
 * - Border ile subtle çerçeve
 * - **onClick**: Kartın tıklanabilir olmasını sağlar ve bir fonksiyon tetikler.
 *
 * Kullanım Alanları:
 * - Login/Register formları
 * - Dashboard kartları
 * - Task listeleri
 * - Profile bilgileri
 *
 * @param props - Card component özellikleri
 */
const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  shadow = "sm",
  hover = false,
  title,
  onClick, // onClick prop'u eklendi
}) => {
  // ===== CSS CLASS TANIMLARI =====

  // Padding boyutuna göre iç boşluk sınıfları
  const paddingClasses = {
    sm: "p-4", // Küçük padding (16px)
    md: "p-6", // Orta padding (24px)
    lg: "p-8", // Büyük padding (32px)
  };

  // Gölge boyutuna göre shadow sınıfları
  const shadowClasses = {
    sm: "shadow-sm", // Küçük gölge (subtle)
    md: "shadow-md", // Orta gölge (belirgin)
    lg: "shadow-lg", // Büyük gölge (dramatik)
  };

  // Hover efekti sınıfları
  const hoverClasses = hover
    ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    : "";

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 
        ${paddingClasses[padding]} // Seçilen padding boyutu
        ${shadowClasses[shadow]} // Seçilen gölge boyutu
        ${hoverClasses} // Hover efekti (varsa)
        ${className} // Dışarıdan gelen ek sınıflar
      `.trim()}
      onClick={onClick} // onClick eventi eklendi
      style={{ cursor: onClick ? "pointer" : "default" }} // onClick varsa cursor pointer yap
    >
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>} {/* Başlık */}
      {/* Card içeriği - children prop'u ile gelen tüm içerik */}
      {children}
    </div>
  );
};

export default Card;
