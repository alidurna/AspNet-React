/**
 * Feature Usage Section
 * 
 * Özellik kullanım metriklerini gösteren dashboard section.
 */

import React from 'react';
import Card from '../../ui/Card';

/**
 * Feature Usage Data Interface
 */
interface FeatureUsageData {
  taskCreation: number;
  taskCompletion: number;
  searchUsage: number;
  filterUsage: number;
  categoryUsage: number;
  attachmentUsage: number;
}

interface FeatureUsageSectionProps {
  data: FeatureUsageData;
  isLoading?: boolean;
}

/**
 * Feature Usage Section Component
 */
const FeatureUsageSection: React.FC<FeatureUsageSectionProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const features = [
    { 
      name: 'Görev Oluşturma', 
      usage: data.taskCreation, 
      icon: '➕',
      color: 'bg-blue-500',
      percentage: 100 
    },
    { 
      name: 'Görev Tamamlama', 
      usage: data.taskCompletion, 
      icon: '✅',
      color: 'bg-green-500',
      percentage: Math.round((data.taskCompletion / data.taskCreation) * 100) || 0
    },
    { 
      name: 'Arama Kullanımı', 
      usage: data.searchUsage, 
      icon: '🔍',
      color: 'bg-purple-500',
      percentage: Math.round((data.searchUsage / data.taskCreation) * 50) || 0
    },
    { 
      name: 'Filtre Kullanımı', 
      usage: data.filterUsage, 
      icon: '🔽',
      color: 'bg-yellow-500',
      percentage: Math.round((data.filterUsage / data.taskCreation) * 60) || 0
    },
    { 
      name: 'Kategori Kullanımı', 
      usage: data.categoryUsage, 
      icon: '📁',
      color: 'bg-indigo-500',
      percentage: Math.round((data.categoryUsage / data.taskCreation) * 80) || 0
    },
    { 
      name: 'Ek Dosya', 
      usage: data.attachmentUsage, 
      icon: '📎',
      color: 'bg-pink-500',
      percentage: Math.round((data.attachmentUsage / data.taskCreation) * 30) || 0
    },
  ];

  const maxUsage = Math.max(...features.map(f => f.usage));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🎯 Özellik Kullanımı
        </h3>
        <div className="text-sm text-gray-500">
          Son 30 gün
        </div>
      </div>

      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`w-8 h-8 ${feature.color} rounded-lg flex items-center justify-center text-white text-sm`}>
              {feature.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {feature.name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.usage.toLocaleString()}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${feature.color} transition-all duration-500`}
                  style={{ width: `${(feature.usage / maxUsage) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {feature.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Feature */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            En Popüler Özellik
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {features.reduce((prev, current) => (prev.usage > current.usage) ? prev : current).name}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FeatureUsageSection; 