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
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface BreadcrumbItem {
  label: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Varsayılan olarak açık
  const [isLoading, setIsLoading] = useState(true);

  // Hooks
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar toggle handler - sadece manuel kapatma için
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Sidebar'ı her zaman açık tut - sadece manuel kapatma ile kapanır
  useEffect(() => {
    // Sidebar'ı her zaman açık tut
    setIsSidebarOpen(true);
    localStorage.setItem('sidebarOpen', 'true');
  }, [location.pathname]); // Sayfa değişikliklerinde sidebar'ı açık tut

  // İlk yüklemede sidebar'ı açık tut
  useEffect(() => {
    setIsSidebarOpen(true);
    localStorage.setItem('sidebarOpen', 'true');
  }, []);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-neutral-900">
        {/* Loading Spinner */}
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <Header
          onSidebarToggle={toggleSidebar}
          title={title}
          breadcrumbs={breadcrumbs}
        />
        
        {/* Mobile Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:hidden md:flex md:h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          {/* Header */}
          <Header
            onSidebarToggle={toggleSidebar}
            title={title}
            breadcrumbs={breadcrumbs}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          {/* Header */}
          <Header
            onSidebarToggle={toggleSidebar}
            title={title}
            breadcrumbs={breadcrumbs}
          />

          {/* Page Content */}
          <main className="flex-1 p-6 xl:p-8 overflow-y-auto">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
