/**
 * DashboardStats Component
 * 
 * Soft ve minimal tasarım için yeniden düzenlenmiş istatistik kartları.
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 xl:p-6 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <p className="text-sm xl:text-base font-medium text-gray-600 dark:text-gray-400 mb-2 xl:mb-3">
            {title}
          </p>
          <p className={`text-2xl xl:text-3xl 2xl:text-4xl font-light ${color}`}>
            {value.toLocaleString('tr-TR')}
          </p>
        </div>
        <div className={`w-10 h-10 xl:w-12 xl:h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
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
      icon: <FaTasks className="w-6 h-6 text-blue-500" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Tamamlanan',
      value: stats.completedTasks,
      icon: <FaCheckCircle className="w-6 h-6 text-green-500" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Devam Ediyor',
      value: stats.inProgressTasks,
      icon: <FaClock className="w-6 h-6 text-orange-500" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Vadesi Geçen',
      value: stats.overdueTasks,
      icon: <FaExclamationTriangle className="w-6 h-6 text-red-500" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="mb-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Görev İstatistikleri
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Görevlerinizin genel durumu
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 xl:gap-6">
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
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Tamamlama Oranı:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              %{Math.round((stats.completedTasks / stats.totalTasks) * 100)}
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${(stats.completedTasks / stats.totalTasks) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Hiç görev yoksa */}
      {!isLoading && stats.totalTasks === 0 && (
        <div className="mt-6 p-6 text-center bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FaTasks className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Henüz hiç göreviniz yok
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            İlk görevinizi oluşturarak başlayın!
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardStats; 