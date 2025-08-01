/**
 * Error Tracking Section
 * 
 * Hata izleme metriklerini gösteren dashboard section.
 */

import React from 'react';
import Card from '../../ui/Card';

/**
 * Error Data Interface
 */
interface ErrorData {
  totalErrors: number;
  criticalErrors: number;
  resolvedErrors: number;
  errorTrend: number;
  topErrors: Array<{
    message: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

interface ErrorTrackingSectionProps {
  data: ErrorData;
  isLoading?: boolean;
}

/**
 * Error Tracking Section Component
 */
const ErrorTrackingSection: React.FC<ErrorTrackingSectionProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🐛 Hata İzleme
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${data.criticalErrors > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-sm text-gray-500">
            {data.criticalErrors > 0 ? 'Kritik Hata Var' : 'Sistem Sağlıklı'}
          </span>
        </div>
      </div>

      {/* Error Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.totalErrors}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Toplam Hata
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {data.criticalErrors}
          </div>
          <div className="text-sm text-red-600">
            Kritik Hata
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.resolvedErrors}
          </div>
          <div className="text-sm text-green-600">
            Çözümlenen
          </div>
        </div>
      </div>

      {/* Top Errors */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          En Sık Karşılaşılan Hatalar
        </h4>
        
        {data.topErrors.length > 0 ? (
          data.topErrors.slice(0, 5).map((error, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-shrink-0">
                <span className="text-lg">
                  {getSeverityIcon(error.severity)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {error.message}
                </div>
                <div className="text-xs text-gray-500">
                  {error.count} kez tekrarlandı
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                {error.severity.toUpperCase()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-sm">Henüz hata kaydı yok!</div>
          </div>
        )}
      </div>

      {/* Error Trend */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Haftalık Trend
          </span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${data.errorTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.errorTrend > 0 ? '+' : ''}{data.errorTrend.toFixed(1)}%
            </span>
            {data.errorTrend <= 0 ? (
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ErrorTrackingSection; 