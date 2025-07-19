import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { tokenManager } from '../services/api';
import { useToast } from './useToast'; // useToast hookunu import et

/**
 * useSignalR Hook
 * 
 * Bu özel React Hook'u, SignalR hub'ına bağlantıyı yönetir ve gerçek zamanlı bildirimleri dinler.
 * Kullanıcının kimlik doğrulama durumuna göre bağlantıyı kurar veya keser.
 * 
 * Özellikler:
 * - SignalR bağlantısının başlatılması ve yönetimi.
 * - JWT token ile kimlik doğrulama.
 * - Sunucudan gelen "ReceiveNotification" ve "TaskUpdate" olaylarını dinleme.
 * - Bağlantı durumu (bağlandı/bağlanmadı) takibi.
 * - Otomatik yeniden bağlanma mekanizması (belirtilen bir gecikmeyle).
 * - useToast hook'u ile bildirim gösterimi.
 * 
 * @returns {Object} SignalR bağlantı durumu.
 * @returns {boolean} .isConnected - SignalR bağlantısının aktif olup olmadığını gösterir.
 */
const useSignalR = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const { showSuccess, showError, showInfo } = useToast(); // useToast hook'unu kullan

  useEffect(() => {
    const connect = async () => {
      const token = tokenManager.getToken();
      if (!token) {
        console.warn("SignalR: JWT token bulunamadı, bağlantı kurulamadı.");
        setIsConnected(false);
        return;
      }

      // SignalR bağlantısı için backend URL'si (Proxy kullanılıyorsa /api ile başlamalı)
      const hubUrl = '/api/hubs/taskflow'; 

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token, // JWT token'ı ile kimlik doğrulama
        })
        .withAutomaticReconnect({ // Otomatik yeniden bağlanma ayarları
          nextRetryDelayInMilliseconds: retryContext => {
            // Exponential backoff with a maximum delay
            if (retryContext.elapsedMilliseconds < 60000) { // Max 1 minute total retry time
              return Math.random() * 2000 + 1000; // Random delay between 1-3 seconds
            }
            return null; // Stop retrying after 1 minute
          }
        })
        .build();

      newConnection.on("ReceiveNotification", (message: string, type: string) => {
        console.log("SignalR Notification:", { message, type });
        if (type === "Error") {
          showError(message);
        } else if (type === "Success") {
          showSuccess(message);
        } else {
          showInfo(message); // Diğer bildirim türleri için info göster
        }
      });

      newConnection.on("TaskUpdate", (data: any) => {
        console.log("SignalR Task Update:", data);
        let message = `Görev güncellendi: ${data.taskTitle}`;
        if (data.type === "TaskCreated") {
          message = `Yeni görev oluşturuldu: ${data.taskTitle}`;
          showSuccess(message);
        } else if (data.type === "TaskUpdated") {
          if (data.isCompleted) {
            message = `${data.taskTitle} görevi tamamlandı!`
            showSuccess(message);
          } else {
            showInfo(message);
          }
        } else if (data.type === "TaskDeleted") {
          message = `${data.taskTitle} görevi silindi.`
          showError(message);
        } else {
          showInfo(message);
        }
      });

      newConnection.onreconnecting(error => {
        console.warn("SignalR: Yeniden bağlanılıyor...", error);
        setIsConnected(false);
        showInfo("SignalR bağlantısı yeniden kuruluyor...");
      });

      newConnection.onreconnected(connectionId => {
        console.log("SignalR: Yeniden bağlandı! Connection ID:", connectionId);
        setIsConnected(true);
        showSuccess("SignalR bağlantısı yeniden kuruldu.");
      });

      newConnection.onclose(error => {
        console.warn("SignalR: Bağlantı kesildi.", error);
        setIsConnected(false);
        showError("SignalR bağlantısı kesildi!");
      });

      try {
        await newConnection.start();
        setIsConnected(true);
        setConnection(newConnection);
        console.log("SignalR: Bağlantı başarılı!");
        showSuccess("SignalR bağlantısı kuruldu.");
      } catch (error) {
        console.error("SignalR: Bağlantı hatası:", error);
        setIsConnected(false);
        showError(`SignalR bağlantısı kurulamadı: ${(error as Error).message}`);
        // Hata durumunda otomatik yeniden bağlanma zaten handle ediliyor
      }
    };

    // Yalnızca bir kez bağlantı kurmayı denemek için
    if (!connection) {
        connect();
    }

    return () => {
      if (connection) {
        connection.stop();
        console.log("SignalR: Bağlantı durduruldu.");
      }
    };
  }, [connection, showSuccess, showError, showInfo]); // useToast bağımlılıklarını ekle

  // Real-time task updates
  const sendTaskUpdate = useCallback((taskId: number, taskTitle: string, isCompleted: boolean) => {
    if (connection) {
      connection.invoke("TaskUpdated", taskId, taskTitle, isCompleted);
    }
  }, [connection]);

  const sendTaskCreated = useCallback((taskId: number, taskTitle: string, categoryId: number) => {
    if (connection) {
      connection.invoke("TaskCreated", taskId, taskTitle, categoryId);
    }
  }, [connection]);

  const sendTaskDeleted = useCallback((taskId: number, taskTitle: string) => {
    if (connection) {
      connection.invoke("TaskDeleted", taskId, taskTitle);
    }
  }, [connection]);

  // Real-time dashboard updates
  const connectToDashboard = useCallback(() => {
    if (connection) {
      connection.invoke("ConnectToDashboard");
    }
  }, [connection]);

  const disconnectFromDashboard = useCallback(() => {
    if (connection) {
      connection.invoke("DisconnectFromDashboard");
    }
  }, [connection]);

  const connectToAnalyticsStream = useCallback((streamType: string) => {
    if (connection) {
      connection.invoke("ConnectToAnalyticsStream", streamType);
    }
  }, [connection]);

  const disconnectFromAnalyticsStream = useCallback(() => {
    if (connection) {
      connection.invoke("DisconnectFromAnalyticsStream");
    }
  }, [connection]);

  const sendDashboardUpdate = useCallback((updateType: string, data: any) => {
    if (connection) {
      connection.invoke("SendDashboardUpdate", updateType, data);
    }
  }, [connection]);

  const sendAnalyticsData = useCallback((dataType: string, data: any) => {
    if (connection) {
      connection.invoke("SendAnalyticsData", dataType, data);
    }
  }, [connection]);

  return { 
    isConnected, 
    connection,
    // Task updates
    sendTaskUpdate,
    sendTaskCreated,
    sendTaskDeleted,
    // Dashboard updates
    connectToDashboard,
    disconnectFromDashboard,
    connectToAnalyticsStream,
    disconnectFromAnalyticsStream,
    sendDashboardUpdate,
    sendAnalyticsData
  };
};

export default useSignalR; 