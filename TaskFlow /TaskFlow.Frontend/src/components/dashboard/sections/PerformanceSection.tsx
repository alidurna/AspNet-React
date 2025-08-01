/**
 * Performance Section
 * 
 * Performans metriklerini gösteren dashboard section.
 */

import React from 'react';
import Card from '../../ui/Card';

/**
 * Performance Data Interface
 */
interface PerformanceData {
  averageLCP: number;
  averageFID: number;
  averageCLS: number;
  averageFCP: number;
  performanceScore: number;
  errorRate: number;
}

interface PerformanceSectionProps {
  data: PerformanceData;
  isLoading?: boolean;
}

/**
 * Performance Section Component
 */
const PerformanceSection: React.FC<PerformanceSectionProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const metrics = [
    { 
      label: 'Largest Contentful Paint',
      value: `${data.averageLCP.toFixed(1)}s`,
      threshold: 2.5,
      current: data.averageLCP,
      unit: 's'
    },
    { 
      label: 'First Input Delay',
      value: `${data.averageFID.toFixed(0)}ms`,
      threshold: 100,
      current: data.averageFID,
      unit: 'ms'
    },
    { 
      label: 'Cumulative Layout Shift',
      value: data.averageCLS.toFixed(3),
      threshold: 0.1,
      current: data.averageCLS,
      unit: ''
    },
    { 
      label: 'First Contentful Paint',
      value: `${data.averageFCP.toFixed(1)}s`,
      threshold: 1.8,
      current: data.averageFCP,
      unit: 's'
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ⚡ Performans Metrikleri
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(data.performanceScore)} ${getScoreColor(data.performanceScore)}`}>
          Skor: {data.performanceScore}/100
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {metric.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Hedef: {metric.threshold}{metric.unit}
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${metric.current <= metric.threshold ? 'text-green-600' : 'text-red-600'}`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">
                {metric.current <= metric.threshold ? '✓ İyi' : '⚠ Kötü'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Rate */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Hata Oranı
          </span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${data.errorRate < 1 ? 'text-green-600' : 'text-red-600'}`}>
              {data.errorRate.toFixed(2)}%
            </span>
            {data.errorRate < 1 ? (
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceSection; 