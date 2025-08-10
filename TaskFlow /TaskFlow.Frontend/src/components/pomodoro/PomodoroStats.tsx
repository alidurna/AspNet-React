// ****************************************************************************************************
//  POMODOROSTATS.TSX
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro istatistikleri bileşenidir.
//  Kullanıcıların Pomodoro session'larının detaylı istatistiklerini görüntülemelerini sağlar.
//  Günlük, haftalık ve aylık performans metrikleri sunar.
// ****************************************************************************************************

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { apiClient } from '../../services/api/apiClient';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import type { TimeFilter, PomodoroStatistics } from './types';

/**
 * Pomodoro İstatistikleri Bileşeni
 */
export const PomodoroStats: React.FC = () => {
  // ===== HOOKS =====
  const { user } = useAuth();
  const { showError } = useToast();
  
  // ===== STATE =====
  const [stats, setStats] = useState<PomodoroStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentFilter, setCurrentFilter] = useState<TimeFilter>('week');
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(false);
  
  // ===== FUNCTIONS =====
  
  /**
   * İstatistikleri yükler
   */
  const loadStatistics = async (filter: TimeFilter = currentFilter) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const response = await apiClient.get(`/v1/Pomodoro/statistics?timeFilter=${filter}`);
      const data = response.data;
      
      // Backend'den gelen data formatını frontend formatına dönüştür
      const formattedStats: PomodoroStatistics = {
        totalSessions: data.totalSessions || 0,
        completedSessions: data.completedSessions || 0,
        totalWorkMinutes: data.totalWorkMinutes || 0,
        totalBreakMinutes: data.totalBreakMinutes || 0,
        averageSessionDuration: data.averageSessionMinutes || 0,
        productivityScore: data.successRate || 0,
        streakDays: 0, // TODO: Backend'e eklenecek
        bestStreak: 0, // TODO: Backend'e eklenecek
        sessionsToday: data.todaySessions || 0,
        sessionsThisWeek: data.thisWeekSessions || 0,
        sessionsThisMonth: data.thisMonthSessions || 0,
        weeklyTrend: [0, 0, 0, 0, 0, 0, 0], // TODO: Backend'e eklenecek
        monthlyTrend: [0, 0, 0, 0], // TODO: Backend'e eklenecek
        sessionTypeBreakdown: {
          work: data.completedSessions || 0,
          shortBreak: 0, // TODO: Backend'e eklenecek
          longBreak: 0 // TODO: Backend'e eklenecek
        }
      };
      
      setStats(formattedStats);
      
    } catch (error: any) {
      console.error('İstatistik yükleme hatası:', error);
      showError('İstatistikler yüklenemedi');
      
      // Mock data for development
      setStats({
        totalSessions: 0,
        completedSessions: 0,
        totalWorkMinutes: 0,
        totalBreakMinutes: 0,
        averageSessionDuration: 0,
        productivityScore: 0,
        streakDays: 0,
        bestStreak: 0,
        sessionsToday: 0,
        sessionsThisWeek: 0,
        sessionsThisMonth: 0,
        weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
        monthlyTrend: [0, 0, 0, 0],
        sessionTypeBreakdown: {
          work: 0,
          shortBreak: 0,
          longBreak: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Filtre değiştiğinde istatistikleri yeniler
   */
  const handleFilterChange = (filter: TimeFilter) => {
    setCurrentFilter(filter);
    loadStatistics(filter);
  };
  
  /**
   * Son session'ları yükler
   */
  const loadRecentSessions = async () => {
    if (!user) return;
    
    try {
      setSessionsLoading(true);
      const response = await apiClient.get('/v1/Pomodoro/sessions?pageSize=10&sortBy=StartTime&sortAscending=false');
      if (response.data?.sessions) {
        setRecentSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Recent sessions yükleme hatası:', error);
    } finally {
      setSessionsLoading(false);
    }
  };
  
  /**
   * Süreyi saat:dakika formatında döndürür
   */
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };
  
  /**
   * Yüzde formatında döndürür
   */
  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };
  

  
  // ===== EFFECTS =====
  
  /**
   * Component mount olduğunda istatistikleri ve session'ları yükle
   */
  useEffect(() => {
    loadStatistics();
    loadRecentSessions();
  }, [user]);
  
  // ===== RENDER =====
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }
  
  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">İstatistik Bulunamadı</h3>
          <p className="text-gray-500">Henüz hiç Pomodoro session'ı başlatılmamış.</p>
          <Button onClick={() => loadStatistics()}>
            Yenile
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filtre Butonları */}
      <Card className="p-4">
        <div className="flex space-x-2">
          {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
            <Button
              key={filter}
              variant={currentFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(filter)}
            >
              {filter === 'today' && 'Bugün'}
              {filter === 'week' && 'Bu Hafta'}
              {filter === 'month' && 'Bu Ay'}
              {filter === 'all' && 'Tümü'}
            </Button>
          ))}
        </div>
      </Card>
      
      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Session'lar */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalSessions}
              </div>
              <div className="text-sm text-gray-500">Toplam Session</div>
            </div>
          </div>
        </Card>
        
        {/* Tamamlanan Session'lar */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.completedSessions}
              </div>
              <div className="text-sm text-gray-500">Tamamlanan</div>
            </div>
          </div>
        </Card>
        
        {/* Toplam Çalışma Süresi */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatDuration(stats.totalWorkMinutes)}
              </div>
              <div className="text-sm text-gray-500">Çalışma Süresi</div>
            </div>
          </div>
        </Card>
        
        {/* Productivity Score */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(stats.productivityScore)}
              </div>
              <div className="text-sm text-gray-500">Productivity</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Detaylı İstatistikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Türü Dağılımı */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Session Türü Dağılımı
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Çalışma Session'ları</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(stats.sessionTypeBreakdown.work / Math.max(stats.totalSessions, 1)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {stats.sessionTypeBreakdown.work}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kısa Molalar</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(stats.sessionTypeBreakdown.shortBreak / Math.max(stats.totalSessions, 1)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {stats.sessionTypeBreakdown.shortBreak}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uzun Molalar</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${(stats.sessionTypeBreakdown.longBreak / Math.max(stats.totalSessions, 1)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {stats.sessionTypeBreakdown.longBreak}
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Streak Bilgileri */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Streak Bilgileri
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mevcut Streak</span>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-orange-600">
                  {stats.streakDays}
                </span>
                <span className="text-sm text-gray-500">gün</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En İyi Streak</span>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-green-600">
                  {stats.bestStreak}
                </span>
                <span className="text-sm text-gray-500">gün</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.sessionsToday}
                  </div>
                  <div className="text-xs text-gray-500">Bugün</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.sessionsThisWeek}
                  </div>
                  <div className="text-xs text-gray-500">Bu Hafta</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.sessionsThisMonth}
                  </div>
                  <div className="text-xs text-gray-500">Bu Ay</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Haftalık Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2" />
          Haftalık Trend
        </h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {stats.weeklyTrend.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-600 rounded-t w-full transition-all duration-300"
                style={{
                  height: `${Math.max((value / Math.max(...stats.weeklyTrend, 1)) * 100, 4)}%`
                }}
              />
              <div className="text-xs text-gray-500 mt-2">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][index]}
              </div>
              <div className="text-xs font-medium text-gray-700">
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Yenile Butonu */}
      <Card className="p-4 text-center">
        <Button
          onClick={() => loadStatistics()}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <LoadingSpinner className="w-4 h-4 mr-2" />
          ) : (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
          )}
          İstatistikleri Yenile
        </Button>
      </Card>
      
      {/* Son Session'lar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Son Session'lar</h3>
          {sessionsLoading && <LoadingSpinner className="w-4 h-4" />}
        </div>
        
        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div key={session.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    session.sessionType === 'work' ? 'bg-red-500' : 
                    session.sessionType === 'short_break' ? 'bg-green-500' : 
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{session.title}</p>
                    <p className="text-sm text-gray-500">
                      {session.sessionType === 'work' ? 'Çalışma' : 
                       session.sessionType === 'short_break' ? 'Kısa Mola' : 'Uzun Mola'}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {session.actualDurationMinutes || session.plannedDurationMinutes}dk
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.isCompleted ? 
                      <span className="text-green-600">✓ Tamamlandı</span> : 
                      session.isCancelled ? 
                        <span className="text-red-600">✗ İptal</span> : 
                        <span className="text-yellow-600">⏸ Duraklatıldı</span>
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Henüz hiç session başlatmadınız</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PomodoroStats;