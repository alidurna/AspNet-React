/**
 * User Engagement Section
 * 
 * Kullanıcı etkileşim metriklerini gösteren dashboard section.
 */

import React from 'react';
import Card from '../../ui/Card';

/**
 * User Engagement Data Interface
 */
interface UserEngagementData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  sessionDuration: number;
  pageViews: number;
}

interface UserEngagementSectionProps {
  data: UserEngagementData;
  isLoading?: boolean;
}

/**
 * User Engagement Section Component
 */
const UserEngagementSection: React.FC<UserEngagementSectionProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const metrics = [
    { label: 'Toplam Kullanıcı', value: data.totalUsers, color: 'text-blue-600' },
    { label: 'Aktif Kullanıcı', value: data.activeUsers, color: 'text-green-600' },
    { label: 'Yeni Kullanıcı', value: data.newUsers, color: 'text-purple-600' },
    { label: 'Geri Dönen', value: 'data.returningUsers', color: 'text-orange-600' },
    { label: 'Oturum Süresi', value: `${Math.round(data.sessionDuration / 60)}dk`, color: 'text-indigo-600' },
    { label: 'Sayfa Görüntüleme', value: data.pageViews, color: 'text-pink-600' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          👥 Kullanıcı Etkileşimi
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Canlı</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className={`text-2xl font-bold ${metric.color} mb-1`}>
              {metric.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Trend */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Günlük Artış
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-green-600 text-sm font-medium">+12.5%</span>
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserEngagementSection; 