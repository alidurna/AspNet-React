/**
 * DashboardQuickActions Component
 * 
 * Soft ve minimal tasarım için yeniden düzenlenmiş hızlı işlemler.
 */

import React from 'react';
import { FaPlus, FaTasks, FaFolderOpen, FaChartBar, FaCalendarAlt, FaSearch } from 'react-icons/fa';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface DashboardQuickActionsProps {
  onCreateTask?: () => void;
  onViewTasks?: () => void;
  onViewCategories?: () => void;
  onViewAnalytics?: () => void;
  onViewCalendar?: () => void;
  onSearch?: () => void;
}

/**
 * Tek bir hızlı işlem kartı component'i
 */
interface QuickActionCardProps {
  action: QuickAction;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ action }) => {
  return (
    <button
      onClick={action.onClick}
      className={`w-full h-8 sm:h-10 md:h-12 lg:h-14 p-2 sm:p-3 md:p-4 lg:p-5 ${action.bgColor} rounded-md sm:rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm hover:scale-101 transition-all duration-200 group text-left flex items-center justify-center`}
    >
      <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 ${action.color} bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
        {action.icon}
      </div>
    </button>
  );
};

/**
 * Ana DashboardQuickActions component'i
 */
const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onCreateTask,
  onViewTasks,
  onViewCategories,
  onViewAnalytics,
  onViewCalendar,
  onSearch
}) => {
  /**
   * Hızlı işlemler konfigürasyonu
   */
  const quickActions: QuickAction[] = [
    {
      id: 'create-task',
      title: 'Yeni Görev',
      icon: <FaPlus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: onCreateTask || (() => {})
    },
    {
      id: 'view-tasks',
      title: 'Görev Listesi',
      icon: <FaTasks className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      onClick: onViewTasks || (() => {})
    },
    {
      id: 'view-categories',
      title: 'Kategoriler',
      icon: <FaFolderOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      onClick: onViewCategories || (() => {})
    },
    {
      id: 'view-analytics',
      title: 'İstatistikler',
      icon: <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: onViewAnalytics || (() => {})
    },
    {
      id: 'view-calendar',
      title: 'Takvim',
      icon: <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      onClick: onViewCalendar || (() => {})
    },
    {
      id: 'search',
      title: 'Arama',
      icon: <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      onClick: onSearch || (() => {})
    }
  ];

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5">
        {quickActions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>

      {/* Klavye Kısayolları Bilgisi */}
      <div className="mt-3 sm:mt-4 md:mt-5 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-md sm:rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded-md flex items-center justify-center">
            <span className="text-yellow-600 dark:text-yellow-400 text-xs">💡</span>
          </div>
          <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white">
            Klavye Kısayolları
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow duration-200">
            <kbd className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">Ctrl+N</kbd>
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">Yeni Görev</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow duration-200">
            <kbd className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">Ctrl+T</kbd>
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">Görev Listesi</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow duration-200">
            <kbd className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">Ctrl+K</kbd>
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">Arama</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardQuickActions; 