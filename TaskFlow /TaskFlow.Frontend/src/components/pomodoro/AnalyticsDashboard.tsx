/**
 * Analytics Dashboard Component - Ultra Elegant & Soft Design
 * 
 * Pomodoro session'ları için detaylı analitikler ve istatistikler
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePomodoro } from './context/PomodoroContext';
import { 
  ClockIcon, 
  FireIcon, 
  TrophyIcon,
  XMarkIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface AnalyticsDashboardProps {
  onClose?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  onClose 
}) => {
  const { isDark } = useTheme();
  const {
    state,
    loadStats
  } = usePomodoro();
  
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('week');

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const getSessionTypeIcon = (type: number): string => {
    switch (type) {
      case 0: return '🍅';
      case 1: return '☕';
      case 2: return '🌴';
      default: return '📋';
    }
  };

  const getTimeFilterLabel = (filter: string): string => {
    switch (filter) {
      case 'today': return 'Bugün';
      case 'week': return 'Bu Hafta';
      case 'month': return 'Bu Ay';
      case 'year': return 'Bu Yıl';
      default: return 'Bu Hafta';
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-3xl w-full max-w-5xl max-h-[85vh] overflow-hidden border border-white/30 dark:border-slate-700/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100/80 to-purple-100/80 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30">
              <ChartBarIcon className="w-5 h-5 text-blue-600/80" />
            </div>
            <div>
              <h2 className="text-xl font-light text-slate-700 dark:text-slate-200">
                Analitik Dashboard
              </h2>
              <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                Pomodoro session'larınızın detaylı analizi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-300 backdrop-blur-xl"
          >
            <XMarkIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Time Filter */}
        <div className="flex items-center justify-center p-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-xl rounded-2xl p-1 border border-white/30 dark:border-slate-600/30">
            {[
              { id: 'today', label: 'Bugün' },
              { id: 'week', label: 'Bu Hafta' },
              { id: 'month', label: 'Bu Ay' },
              { id: 'year', label: 'Bu Yıl' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id as any)}
                className={`px-4 py-2 rounded-xl font-light transition-all duration-300 ${
                  timeFilter === filter.id
                    ? 'bg-gradient-to-r from-blue-400/80 to-purple-400/80 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {state.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : !state.stats ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100/80 to-slate-200/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <ChartBarIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-light text-slate-700 dark:text-slate-200 mb-2">
                Veri Yok
              </h3>
              <p className="text-slate-400 dark:text-slate-400 font-light">
                Henüz analitik veri bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-500/80 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30">
                      <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">🍅</span>
                  </div>
                  <h3 className="text-sm font-light text-blue-600 dark:text-blue-400 mb-1">
                    Toplam Session
                  </h3>
                  <p className="text-2xl font-light text-blue-800 dark:text-blue-200">
                    {state.stats?.totalSessions || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/30 dark:to-emerald-800/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-emerald-500/80 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30">
                      <FireIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">🔥</span>
                  </div>
                  <h3 className="text-sm font-light text-emerald-600 dark:text-emerald-400 mb-1">
                    Toplam Süre
                  </h3>
                  <p className="text-2xl font-light text-emerald-800 dark:text-emerald-200">
                    {formatDuration(state.stats?.totalDurationMinutes || 0)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-500/80 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30">
                      <TrophyIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">🏆</span>
                  </div>
                  <h3 className="text-sm font-light text-purple-600 dark:text-purple-400 mb-1">
                    Tamamlanan
                  </h3>
                  <p className="text-2xl font-light text-purple-800 dark:text-purple-200">
                    {state.stats?.completedSessions || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-rose-50/80 to-rose-100/80 dark:from-rose-900/30 dark:to-rose-800/30 backdrop-blur-xl rounded-2xl p-6 border border-rose-200/50 dark:border-rose-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-rose-500/80 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">👤</span>
                  </div>
                  <h3 className="text-sm font-light text-rose-600 dark:text-rose-400 mb-1">
                    Ortalama Süre
                  </h3>
                  <p className="text-2xl font-light text-rose-800 dark:text-rose-200">
                    {state.stats?.totalSessions > 0 
                      ? formatDuration(Math.round((state.stats?.totalDurationMinutes || 0) / state.stats?.totalSessions))
                      : '0dk'
                    }
                  </p>
                </div>
              </div>

              {/* Session Type Distribution */}
              <div className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-600/30">
                <h3 className="text-lg font-light text-slate-700 dark:text-slate-200 mb-4">
                  Session Türü Dağılımı
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-rose-900/20 dark:to-pink-900/20 backdrop-blur-xl rounded-2xl p-4 border border-rose-200/50 dark:border-rose-700/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">🍅</span>
                      <div>
                        <h4 className="font-light text-slate-700 dark:text-slate-200">Çalışma</h4>
                        <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                          {state.sessions.filter(s => s.sessionType === 0).length} session
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-600/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-rose-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${state.stats?.totalSessions > 0 
                            ? (state.sessions.filter(s => s.sessionType === 0).length / state.stats?.totalSessions) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-xl rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">☕</span>
                      <div>
                        <h4 className="font-light text-slate-700 dark:text-slate-200">Kısa Mola</h4>
                        <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                          {state.sessions.filter(s => s.sessionType === 1).length} session
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-600/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${state.stats?.totalSessions > 0 
                            ? (state.sessions.filter(s => s.sessionType === 1).length / state.stats?.totalSessions) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">🌴</span>
                      <div>
                        <h4 className="font-light text-slate-700 dark:text-slate-200">Uzun Mola</h4>
                        <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                          {state.sessions.filter(s => s.sessionType === 2).length} session
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-600/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-indigo-400 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${state.stats?.totalSessions > 0 
                            ? (state.sessions.filter(s => s.sessionType === 2).length / state.stats?.totalSessions) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-600/30">
                <h3 className="text-lg font-light text-slate-700 dark:text-slate-200 mb-4">
                  Son Aktiviteler
                </h3>
                <div className="space-y-3">
                  {state.sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-600/80 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-500/30"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getSessionTypeIcon(session.sessionType)}</span>
                        <div>
                          <h4 className="font-light text-slate-700 dark:text-slate-200">
                            {session.title}
                          </h4>
                          <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                            {formatDate(session.startTime || '')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-light text-slate-700 dark:text-slate-200">
                          {formatDuration(session.plannedDurationMinutes)}
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                          {session.state === 3 ? 'Tamamlandı' : 'Devam Ediyor'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
