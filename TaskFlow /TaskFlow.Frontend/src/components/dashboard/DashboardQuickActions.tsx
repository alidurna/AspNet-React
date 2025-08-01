/**
 * DashboardQuickActions Component
 * 
 * Dashboard sayfasının hızlı işlemler bölümünü gösteren component.
 * Kullanıcının sık kullandığı işlemlere hızlı erişim sağlar.
 */

import React from 'react';
import { FaPlus, FaTasks, FaFolderOpen, FaChartBar, FaCalendarAlt, FaSearch } from 'react-icons/fa';

interface QuickAction {
  id: string;
  title: string;
  description: string;
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
      className={`w-full p-4 ${action.bgColor} rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group text-left`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${action.color} bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          {action.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {action.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {action.description}
          </p>
        </div>
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
      description: 'Hızlıca yeni bir görev oluşturun',
      icon: <FaPlus className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: onCreateTask || (() => {})
    },
    {
      id: 'view-tasks',
      title: 'Görev Listesi',
      description: 'Tüm görevlerinizi görüntüleyin',
      icon: <FaTasks className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      onClick: onViewTasks || (() => {})
    },
    {
      id: 'view-categories',
      title: 'Kategoriler',
      description: 'Kategori yönetimi yapın',
      icon: <FaFolderOpen className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      onClick: onViewCategories || (() => {})
    },
    {
      id: 'view-analytics',
      title: 'İstatistikler',
      description: 'Detaylı analiz ve raporlar',
      icon: <FaChartBar className="w-5 h-5" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: onViewAnalytics || (() => {})
    },
    {
      id: 'view-calendar',
      title: 'Takvim',
      description: 'Görevleri takvim görünümünde inceleyin',
      icon: <FaCalendarAlt className="w-5 h-5" />,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      onClick: onViewCalendar || (() => {})
    },
    {
      id: 'search',
      title: 'Arama',
      description: 'Görev ve kategorilerde arama yapın',
      icon: <FaSearch className="w-5 h-5" />,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      onClick: onSearch || (() => {})
    }
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Hızlı İşlemler
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sık kullandığınız işlemlere hızlı erişim
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>

      {/* Klavye Kısayolları Bilgisi */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          💡 Klavye Kısayolları
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Ctrl+N</kbd>
            <span>Yeni Görev</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Ctrl+T</kbd>
            <span>Görev Listesi</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Ctrl+K</kbd>
            <span>Arama</span>
          </div>
        </div>
      </div>

      {/* İpuçları */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600 dark:text-yellow-400 text-sm">💡</span>
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">İpucu:</p>
            <p>Görevlerinizi kategorilere ayırarak daha organize çalışabilir ve raporlarınızı daha detaylı inceleyebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardQuickActions; 