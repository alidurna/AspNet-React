/**
 * useRealTimeDashboard Hook
 * 
 * Bu özel React Hook'u, real-time dashboard güncellemelerini yönetir.
 * SignalR üzerinden dashboard ve analytics verilerini gerçek zamanlı olarak alır.
 * 
 * Özellikler:
 * - Dashboard bağlantısının yönetimi
 * - Analytics stream bağlantısı
 * - Real-time data updates
 * - Connection status tracking
 * - Automatic reconnection
 * - Data caching ve state management
 * 
 * @returns {Object} Real-time dashboard state ve metodları
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import useSignalR from './useSignalR';
import { useToast } from './useToast';

interface DashboardData {
  [key: string]: any;
}

interface AnalyticsData {
  type: string;
  data: any;
  timestamp: Date;
}

interface RealTimeDashboardState {
  isConnected: boolean;
  isStreaming: boolean;
  dashboardData: DashboardData;
  analyticsData: AnalyticsData[];
  lastUpdate: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

const useRealTimeDashboard = () => {
  const { 
    isConnected: signalRConnected, 
    connection,
    connectToDashboard,
    disconnectFromDashboard,
    connectToAnalyticsStream,
    disconnectFromAnalyticsStream,
    sendDashboardUpdate,
    sendAnalyticsData
  } = useSignalR();

  const { showSuccess, showError, showInfo } = useToast();

  const [state, setState] = useState<RealTimeDashboardState>({
    isConnected: false,
    isStreaming: false,
    dashboardData: {},
    analyticsData: [],
    lastUpdate: null,
    connectionQuality: 'disconnected'
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataCacheRef = useRef<Map<string, any>>(new Map());

  // Dashboard bağlantısını başlat
  const connect = useCallback(async () => {
    if (!signalRConnected || !connection) {
      showError('SignalR bağlantısı kurulamadı');
      return false;
    }

    try {
      // Dashboard bağlantısını kur
      connectToDashboard();
      
      // Connection event'lerini dinle
      connection.on('DashboardConnected', (data: any) => {
        console.log('Dashboard connected:', data);
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionQuality: 'excellent',
          lastUpdate: new Date()
        }));
        showSuccess('Real-time dashboard bağlantısı kuruldu');
      });

      connection.on('DashboardDisconnected', (data: any) => {
        console.log('Dashboard disconnected:', data);
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectionQuality: 'disconnected'
        }));
        showInfo('Real-time dashboard bağlantısı kesildi');
      });

      connection.on('DashboardUpdated', (data: any) => {
        console.log('Dashboard updated:', data);
        setState(prev => ({
          ...prev,
          dashboardData: {
            ...prev.dashboardData,
            [data.updateType]: data.data
          },
          lastUpdate: new Date()
        }));

        // Cache'e kaydet
        dataCacheRef.current.set(data.updateType, data.data);
      });

      return true;
    } catch (error) {
      console.error('Dashboard connection error:', error);
      showError('Dashboard bağlantısı kurulamadı');
      return false;
    }
  }, [signalRConnected, connection, connectToDashboard, showSuccess, showError, showInfo]);

  // Dashboard bağlantısını kes
  const disconnect = useCallback(() => {
    if (connection) {
      disconnectFromDashboard();
      setState(prev => ({
        ...prev,
        isConnected: false,
        isStreaming: false,
        connectionQuality: 'disconnected'
      }));
    }
  }, [connection, disconnectFromDashboard]);

  // Analytics stream başlat
  const startAnalyticsStream = useCallback(async (streamType: string) => {
    if (!state.isConnected) {
      showError('Dashboard bağlantısı kurulmamış');
      return false;
    }

    try {
      connectToAnalyticsStream(streamType);

      // Analytics stream event'lerini dinle
      connection?.on('AnalyticsStreamConnected', (data: any) => {
        console.log('Analytics stream connected:', data);
        setState(prev => ({
          ...prev,
          isStreaming: true
        }));
        showSuccess(`Analytics stream '${streamType}' başlatıldı`);
      });

      connection?.on('AnalyticsStreamDisconnected', (data: any) => {
        console.log('Analytics stream disconnected:', data);
        setState(prev => ({
          ...prev,
          isStreaming: false
        }));
        showInfo('Analytics stream durduruldu');
      });

      connection?.on('AnalyticsDataReceived', (data: any) => {
        console.log('Analytics data received:', data);
        setState(prev => ({
          ...prev,
          analyticsData: [
            ...prev.analyticsData.slice(-99), // Son 100 veriyi tut
            {
              type: data.dataType,
              data: data.data,
              timestamp: new Date(data.timestamp)
            }
          ],
          lastUpdate: new Date()
        }));
      });

      return true;
    } catch (error) {
      console.error('Analytics stream error:', error);
      showError('Analytics stream başlatılamadı');
      return false;
    }
  }, [state.isConnected, connection, connectToAnalyticsStream, showSuccess, showError, showInfo]);

  // Analytics stream durdur
  const stopAnalyticsStream = useCallback(() => {
    disconnectFromAnalyticsStream();
    setState(prev => ({
      ...prev,
      isStreaming: false
    }));
  }, [disconnectFromAnalyticsStream]);

  // Dashboard güncellemesi gönder
  const updateDashboard = useCallback((updateType: string, data: any) => {
    if (!state.isConnected) {
      showError('Dashboard bağlantısı kurulmamış');
      return;
    }

    sendDashboardUpdate(updateType, data);
  }, [state.isConnected, sendDashboardUpdate, showError]);

  // Analytics data gönder
  const sendAnalytics = useCallback((dataType: string, data: any) => {
    if (!state.isConnected) {
      showError('Dashboard bağlantısı kurulmamış');
      return;
    }

    sendAnalyticsData(dataType, data);
  }, [state.isConnected, sendAnalyticsData, showError]);

  // Cached data al
  const getCachedData = useCallback((key: string) => {
    return dataCacheRef.current.get(key);
  }, []);

  // Connection quality kontrol et
  const checkConnectionQuality = useCallback(() => {
    if (!state.isConnected) {
      return 'disconnected';
    }

    if (!state.lastUpdate) {
      return 'poor';
    }

    const timeSinceLastUpdate = Date.now() - state.lastUpdate.getTime();
    
    if (timeSinceLastUpdate < 5000) {
      return 'excellent';
    } else if (timeSinceLastUpdate < 30000) {
      return 'good';
    } else {
      return 'poor';
    }
  }, [state.isConnected, state.lastUpdate]);

  // Connection quality'i güncelle
  useEffect(() => {
    const quality = checkConnectionQuality();
    setState(prev => ({
      ...prev,
      connectionQuality: quality
    }));
  }, [checkConnectionQuality]);

  // SignalR bağlantısı değiştiğinde dashboard'u yeniden bağla
  useEffect(() => {
    if (signalRConnected && !state.isConnected) {
      connect();
    } else if (!signalRConnected && state.isConnected) {
      disconnect();
    }
  }, [signalRConnected, state.isConnected, connect, disconnect]);

  // Component unmount olduğunda cleanup
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    isConnected: state.isConnected,
    isStreaming: state.isStreaming,
    dashboardData: state.dashboardData,
    analyticsData: state.analyticsData,
    lastUpdate: state.lastUpdate,
    connectionQuality: state.connectionQuality,

    // Methods
    connect,
    disconnect,
    startAnalyticsStream,
    stopAnalyticsStream,
    updateDashboard,
    sendAnalytics,
    getCachedData
  };
};

export default useRealTimeDashboard; 