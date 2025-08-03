/**
 * DashboardStats Component
 * 
 * Dashboard sayfasının istatistik kartlarını gösteren component.
 * Toplam görev, tamamlanan, devam eden ve vadesi geçen görev sayılarını görüntüler.
 */

import React from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface DashboardStatsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
  isLoading?: boolean;
}

/**
 * Tek bir istatistik kartı component'i
 */
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  bgColor,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 h-full">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-12 h-6 sm:w-16 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="w-20 h-4 sm:w-24 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 h-full">
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${color}`}>
            {value.toLocaleString('tr-TR')}
          </p>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Ana DashboardStats component'i
 */
const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading = false
}) => {
  /**
   * İstatistik kartları konfigürasyonu
   */
  const statCards = [
    {
      title: 'Toplam Görev',
      value: stats.totalTasks,
      icon: <FaTasks className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Tamamlanan',
      value: stats.completedTasks,
      icon: <FaCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Devam Ediyor',
      value: stats.inProgressTasks,
      icon: <FaClock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      title: 'Vadesi Geçen',
      value: stats.overdueTasks,
      icon: <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Görev İstatistikleri
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Görevlerinizin genel durumu ve ilerleme özeti
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Özet Bilgi */}
      {!isLoading && stats.totalTasks > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Tamamlama Oranı:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              %{Math.round((stats.completedTasks / stats.totalTasks) * 100)}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{
                width: `${(stats.completedTasks / stats.totalTasks) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Hiç görev yoksa */}
      {!isLoading && stats.totalTasks === 0 && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FaTasks className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
            Henüz hiç göreviniz yok
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
            İlk görevinizi oluşturarak başlayın!
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardStats; 