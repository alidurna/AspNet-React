/**
 * SidebarNavigation Component
 * 
 * Sidebar'dan çıkarılan ana navigasyon menüsü component'i.
 * Menü öğelerini ve active state yönetimini sağlar.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiHome, 
  FiCheckSquare, 
  FiFolder, 
  FiBarChart, 
  FiSettings,
  FiUser
} from "react-icons/fi";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface SidebarNavigationProps {
  isOpen?: boolean;
  onItemClick?: () => void;
}

/**
 * SidebarNavigation Component
 * 
 * Ana navigasyon menüsünü render eder. Active link tracking ve
 * responsive davranış sağlar.
 */
export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen = true,
  onItemClick
}) => {
  const location = useLocation();

  // ===== NAVIGATION ITEMS =====
  const navigationItems: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FiHome,
    },
    {
      name: "Görevler", 
      href: "/tasks",
      icon: FiCheckSquare,
    },
    {
      name: "Kategoriler",
      href: "/categories", 
      icon: FiFolder,
    },
    {
      name: "İstatistikler",
      href: "/statistics",
      icon: FiBarChart,
    },
    {
      name: "Profil",
      href: "/profile",
      icon: FiUser,
    },
    {
      name: "Ayarlar",
      href: "/security",
      icon: FiSettings,
    },
  ];

  // ===== HELPER FUNCTIONS =====
  /**
   * Check if current path is active
   */
  const isActiveRoute = (href: string): boolean => {
    if (href === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  /**
   * Handle navigation item click
   */
  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  // ===== RENDER =====
  return (
    <nav className="flex-1 px-2 py-4 space-y-2">
      {navigationItems.map((item) => {
        const isActive = isActiveRoute(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={handleItemClick}
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }
            `}
          >
            <Icon
              className={`
                mr-3 h-5 w-5 transition-colors duration-200
                ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                }
              `}
            />
            
            {/* Menu Text */}
            <span className={`${!isOpen ? "lg:hidden" : ""} transition-opacity duration-200`}>
              {item.name}
            </span>

            {/* Badge (if exists) */}
            {item.badge && item.badge > 0 && (
              <span
                className={`
                  ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full
                  ${!isOpen ? "lg:hidden" : ""}
                `}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNavigation; 