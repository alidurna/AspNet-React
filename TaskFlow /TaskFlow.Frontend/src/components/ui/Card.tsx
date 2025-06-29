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

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 
        ${paddingClasses[padding]} // Seçilen padding boyutu
        ${shadowClasses[shadow]} // Seçilen gölge boyutu
        ${
          hover ? "hover:shadow-md transition-shadow duration-200" : ""
        } // Hover efekti (varsa)
        ${className} // Dışarıdan gelen ek sınıflar
      `}
    >
      {/* Card içeriği - children prop'u ile gelen tüm içerik */}
      {children}
    </div>
  );
};

export default Card;
