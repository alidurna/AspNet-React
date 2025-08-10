/**
 * SidebarNavigation Component
 * 
 * Sidebar'dan çıkarılan ana navigasyon menüsü component'i.
 * Menü öğelerini ve active state yönetimini sağlar.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaClipboardList, FaChartLine, FaUser, FaCog, FaFileAlt, FaClock } from 'react-icons/fa';

interface SidebarNavigationProps {
  onItemClick?: () => void; // Opsiyonel prop
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  onItemClick
}) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FaHome,
    },
    {
      name: 'Görevler',
      href: '/tasks',
      icon: FaTasks,
    },
    {
      name: 'Kategoriler',
      href: '/categories',
      icon: FaClipboardList,
    },
    {
      name: 'Şablonlar',
      href: '/templates',
      icon: FaFileAlt,
    },
    {
      name: 'Pomodoro',
      href: '/pomodoro',
      icon: FaClock,
    },
    {
      name: 'İstatistikler',
      href: '/statistics',
      icon: FaChartLine,
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: FaUser,
    },
    {
      name: 'Ayarlar',
      href: '/settings',
      icon: FaCog,
    },
  ];

  // Active state kontrolü için helper function
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <ul className="space-y-2">
      {navigationItems.map((item) => {
        const isActive = isActiveRoute(item.href);
        
        return (
          <li key={item.name}>
            <Link
              to={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-600 dark:hover:text-blue-400 transition-colors duration-200 group cursor-pointer
                ${isActive ? 'bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white font-semibold' : ''}
              `}
              onClick={onItemClick}
              style={{ pointerEvents: 'auto' }}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`} />
              <span className="text-sm flex-1">
                {item.name}
              </span>
              {/* İlerleme veya bildirim badge'i buraya eklenebilir */}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarNavigation; 