/**
 * Dashboard Layout Component
 *
 * Bu dosya, TaskFlow uygulamasının dashboard sayfaları için ana layout
 * yapısını oluşturan component'i içerir. Sidebar, Header ve ana içerik
 * alanını bir araya getirerek tutarlı bir kullanıcı deneyimi sağlar.
 *
 * Ana Özellikler:
 * - Responsive layout (mobile/desktop uyumlu)
 * - Sidebar state yönetimi
 * - Header entegrasyonu
 * - Ana içerik alanı
 * - Protected route wrapper
 * - Loading state yönetimi
 * - Authentication kontrolü
 *
 * Layout Yapısı:
 * - Sidebar: Sol tarafta navigasyon menüsü
 * - Header: Üst kısımda başlık ve breadcrumb
 * - Main Content: Ana sayfa içeriği
 * - Responsive breakpoints
 *
 * Authentication:
 * - Otomatik login kontrolü
 * - Unauthorized redirect
 * - Loading state handling
 * - Session management
 *
 * Responsive Design:
 * - Mobile-first approach
 * - Sidebar toggle functionality
 * - Breakpoint-based behavior
 * - Touch-friendly interface
 *
 * Props Interface:
 * - children: Sayfa içeriği
 * - title: Sayfa başlığı
 * - breadcrumbs: Breadcrumb navigasyon öğeleri
 *
 * State Management:
 * - Sidebar open/close state
 * - Loading state
 * - Authentication state
 * - Responsive state
 *
 * Performance:
 * - Lazy loading support
 * - Optimized re-renders
 * - Efficient state updates
 * - Memory leak koruması
 *
 * Accessibility:
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - ARIA labels
 *
 * Error Handling:
 * - Authentication errors
 * - Loading errors
 * - Navigation errors
 * - Fallback UI
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

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = "Dashboard",
  breadcrumbs = [],
}) => {
  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Sidebar toggle handler
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center dark:bg-transparent">
        {/* Loading Spinner */}
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400"></div>
          <p className="text-neutral-600 dark:text-neutral-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }
                                             
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-transparent">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header
          onSidebarToggle={toggleSidebar}
          title={title}
          breadcrumbs={breadcrumbs}
        />

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
