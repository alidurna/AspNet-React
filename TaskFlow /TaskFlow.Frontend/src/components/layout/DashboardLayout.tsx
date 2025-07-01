/**
 * Dashboard Layout Component - TaskFlow
 *
 * Bu component, dashboard sayfalarının ana layout yapısını oluşturur.
 * Sidebar, Header ve Main content area'yı bir araya getirir.
 *
 * Özellikler:
 * - Responsive layout (mobile/desktop)
 * - Sidebar state management
 * - Header integration
 * - Main content area
 * - Protected route wrapper
 * - Loading states
 *
 * Props:
 * - children: Page content
 * - title: Page title
 * - breadcrumbs: Breadcrumb navigation items
 *
 * Usage:
 * <DashboardLayout title="Dashboard" breadcrumbs={breadcrumbs}>
 *   <YourPageContent />
 * </DashboardLayout>
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

  // Close sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Loading Spinner */}
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="lg:ml-64">
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
