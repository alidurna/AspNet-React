/**
 * AnalyticsDashboard Component - Refactored
 *
 * Basitleştirilmiş analytics dashboard. Sub-component'leri kullanarak
 * modüler yapı sağlar.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import useRealTimeDashboard from '../../hooks/useRealTimeDashboard';

// Sub-components
import UserEngagementSection from './sections/UserEngagementSection';
import PerformanceSection from './sections/PerformanceSection';
import FeatureUsageSection from './sections/FeatureUsageSection';
import ErrorTrackingSection from './sections/ErrorTrackingSection';

/**
 * Analytics Data Interface
 */
interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    sessionDuration: number;
    pageViews: number;
  };
  performance: {
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    averageFCP: number;
    performanceScore: number;
    errorRate: number;
  };
  featureUsage: {
    taskCreation: number;
    taskCompletion: number;
    searchUsage: number;
    filterUsage: number;
    categoryUsage: number;
    attachmentUsage: number;
  };
  errorTracking: {
    totalErrors: number;
    criticalErrors: number;
    resolvedErrors: number;
    errorTrend: number;
    topErrors: Array<{
      message: string;
      count: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
}

/**
 * Analytics Dashboard Component - Refactored
 */
const AnalyticsDashboard: React.FC = () => {
  // ===== STATE =====
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ===== HOOKS =====
  const { isConnected, connectionQuality } = useRealTimeDashboard();

  // ===== DATA FETCHING =====
  /**
   * Fetch analytics data (mock implementation)
   */
  const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    // Mock data for demonstration
    return {
      userEngagement: {
        totalUsers: 1245,
        activeUsers: 342,
        newUsers: 67,
        returningUsers: 275,
        sessionDuration: 1800, // 30 minutes in seconds
        pageViews: 4567,
      },
      performance: {
        averageLCP: 1.8,
        averageFID: 45,
        averageCLS: 0.05,
        averageFCP: 1.2,
        performanceScore: 92,
        errorRate: 0.3,
      },
      featureUsage: {
        taskCreation: 456,
        taskCompletion: 389,
        searchUsage: 234,
        filterUsage: 156,
        categoryUsage: 298,
        attachmentUsage: 89,
      },
      errorTracking: {
        totalErrors: 23,
        criticalErrors: 2,
        resolvedErrors: 18,
        errorTrend: -15.2,
        topErrors: [
          { message: 'Network timeout error', count: 8, severity: 'medium' },
          { message: 'Authentication failed', count: 5, severity: 'high' },
          { message: 'Database connection lost', count: 3, severity: 'critical' },
          { message: 'Invalid input validation', count: 4, severity: 'low' },
          { message: 'File upload failed', count: 3, severity: 'medium' },
        ],
      },
    };
  };

  /**
   * Load analytics data
   */
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analyticsData = await fetchAnalyticsData();
      setData(analyticsData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manual refresh
   */
  const handleRefresh = () => {
    loadData();
  };

  // ===== EFFECTS =====
  /**
   * Initial data load
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Auto refresh interval
   */
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // ===== RENDER =====
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Analytics yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-lg font-medium">Analytics Yüklenemedi</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Analytics verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerçek zamanlı performans ve kullanım metrikleri
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                         <span className="text-sm text-gray-500">
               {connectionQuality === 'excellent' ? 'Mükemmel' :
                connectionQuality === 'good' ? 'İyi' :
                connectionQuality === 'poor' ? 'Zayıf' : 'Bağlantı Yok'}
             </span>
          </div>
          
          {/* Last Refresh */}
          {lastRefresh && (
            <span className="text-xs text-gray-400">
              Son güncelleme: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          
          {/* Refresh Button */}
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Yenileniyor...
              </>
            ) : (
              <>
                🔄 Yenile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement */}
        <UserEngagementSection 
          data={data.userEngagement} 
          isLoading={isLoading} 
        />
        
        {/* Performance Metrics */}
        <PerformanceSection 
          data={data.performance} 
          isLoading={isLoading} 
        />
        
        {/* Feature Usage */}
        <FeatureUsageSection 
          data={data.featureUsage} 
          isLoading={isLoading} 
        />
        
        {/* Error Tracking */}
        <ErrorTrackingSection 
          data={data.errorTracking} 
          isLoading={isLoading} 
        />
      </div>

      {/* Refresh Settings */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Otomatik yenileme aralığı
          </span>
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600"
          >
            <option value={0}>Kapalı</option>
            <option value={10000}>10 saniye</option>
            <option value={30000}>30 saniye</option>
            <option value={60000}>1 dakika</option>
            <option value={300000}>5 dakika</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 