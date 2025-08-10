/**
 * Session Management Component - Ultra Elegant & Soft Design
 * 
 * Pomodoro session'larını yönetmek için kullanılan zarif bileşen
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePomodoro } from './context/PomodoroContext';
import { useToast } from '../../hooks/useToast';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  TrashIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface SessionManagementProps {
  onClose?: () => void;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({ 
  onClose 
}) => {
  const { isDark } = useTheme();
  const { showSuccess, showError } = useToast();
  const {
    state,
    loadSessions,
    startSession,
    pauseSession,
    stopSession,
    deleteSession
  } = usePomodoro();
  
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'debug'>('active');

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleStartSession = async (session: any) => {
    try {
      await startSession(session.id);
    } catch (error) {
      console.error('Session başlatma hatası:', error);
      showError('Session başlatılamadı');
    }
  };

  const handlePauseSession = async (session: any) => {
    try {
      await pauseSession(session.id);
    } catch (error) {
      console.error('Session duraklatma hatası:', error);
      showError('Session duraklatılamadı');
    }
  };

  const handleStopSession = async (session: any) => {
    try {
      await stopSession(session.id);
    } catch (error) {
      console.error('Session durdurma hatası:', error);
      showError('Session durdurulamadı');
    }
  };

  const handleDeleteSession = async (session: any) => {
    try {
      await deleteSession(session.id);
    } catch (error) {
      console.error('Session silme hatası:', error);
      showError('Session silinemedi');
    }
  };

  const getSessionTypeLabel = (type: number) => {
    switch (type) {
      case 0: return 'Çalışma';
      case 1: return 'Kısa Mola';
      case 2: return 'Uzun Mola';
      default: return 'Session';
    }
  };

  const getSessionStateLabel = (state: number) => {
    switch (state) {
      case 0: return 'Oluşturuldu';
      case 1: return 'Aktif';
      case 2: return 'Duraklatıldı';
      case 3: return 'Tamamlandı';
      case 4: return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getSessionStateColor = (state: number) => {
    switch (state) {
      case 0: return 'bg-slate-100/80 text-slate-700 dark:bg-slate-700/80 dark:text-slate-200';
      case 1: return 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400';
      case 2: return 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400';
      case 3: return 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400';
      case 4: return 'bg-rose-100/80 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400';
      default: return 'bg-slate-100/80 text-slate-700 dark:bg-slate-700/80 dark:text-slate-200';
    }
  };

  const getSessionTypeIcon = (type: number) => {
    switch (type) {
      case 0: return '🍅';
      case 1: return '☕';
      case 2: return '🌴';
      default: return '📋';
    }
  };

  const formatDuration = (minutes: number) => {
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-white/30 dark:border-slate-700/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100/80 to-purple-100/80 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30">
              <ClockIcon className="w-5 h-5 text-blue-600/80" />
            </div>
            <div>
              <h2 className="text-xl font-light text-slate-700 dark:text-slate-200">
                Session Yönetimi
              </h2>
              <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                Pomodoro session'larınızı yönetin
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200/50 dark:border-slate-700/50">
          {[
            { id: 'active', label: 'Aktif Session\'lar', icon: PlayIcon },
            { id: 'history', label: 'Geçmiş', icon: ClockIcon },
            { id: 'debug', label: 'Debug', icon: Cog6ToothIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-light transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-base">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {activeTab === 'active' && (
            <div className="space-y-4">
              {state.sessions.filter(s => s.state === 1 || s.state === 2).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100/80 to-slate-200/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                    <ClockIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-light text-slate-700 dark:text-slate-200 mb-2">
                    Aktif Session Yok
                  </h3>
                  <p className="text-slate-400 dark:text-slate-400 font-light">
                    Henüz aktif bir session başlatmadınız.
                  </p>
                </div>
              ) : (
                state.sessions
                  .filter(s => s.state === 1 || s.state === 2)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-600/30 hover:shadow-2xl transition-all duration-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getSessionTypeIcon(session.sessionType)}</div>
                          <div>
                            <h3 className="text-lg font-light text-slate-700 dark:text-slate-200">
                              {session.title}
                            </h3>
                            <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                              {getSessionTypeLabel(session.sessionType)} • {formatDuration(session.plannedDurationMinutes)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-sm font-light ${getSessionStateColor(session.state)}`}>
                          {getSessionStateLabel(session.state)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-slate-400 dark:text-slate-400 font-light">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{session.startTime ? formatDate(session.startTime) : 'Başlatılmadı'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {session.state === 1 ? (
                            <button
                              onClick={() => handlePauseSession(session)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-400/80 to-orange-400/80 hover:from-amber-500/90 hover:to-orange-500/90 backdrop-blur-xl text-white rounded-xl font-light transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <PauseIcon className="w-3 h-3" />
                              <span>Duraklat</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartSession(session)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-400/80 to-teal-400/80 hover:from-emerald-500/90 hover:to-teal-500/90 backdrop-blur-xl text-white rounded-xl font-light transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <PlayIcon className="w-3 h-3" />
                              <span>Başlat</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleStopSession(session)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-400/80 to-pink-400/80 hover:from-rose-500/90 hover:to-pink-500/90 backdrop-blur-xl text-white rounded-xl font-light transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <StopIcon className="w-3 h-3" />
                            <span>Durdur</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteSession(session)}
                            className="p-2 bg-white/60 dark:bg-slate-600/60 backdrop-blur-xl hover:bg-slate-200/80 dark:hover:bg-slate-500/80 text-slate-600 dark:text-slate-300 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {state.sessions.filter(s => s.state === 3 || s.state === 4).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100/80 to-slate-200/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                    <ClockIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-light text-slate-700 dark:text-slate-200 mb-2">
                    Geçmiş Yok
                  </h3>
                  <p className="text-slate-400 dark:text-slate-400 font-light">
                    Henüz tamamlanmış session bulunmuyor.
                  </p>
                </div>
              ) : (
                state.sessions
                  .filter(s => s.state === 3 || s.state === 4)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-600/30 hover:shadow-2xl transition-all duration-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getSessionTypeIcon(session.sessionType)}</div>
                          <div>
                            <h3 className="text-lg font-light text-slate-700 dark:text-slate-200">
                              {session.title}
                            </h3>
                            <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                              {getSessionTypeLabel(session.sessionType)} • {formatDuration(session.plannedDurationMinutes)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-sm font-light ${getSessionStateColor(session.state)}`}>
                          {getSessionStateLabel(session.state)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-400 dark:text-slate-400 font-light">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{session.startTime ? formatDate(session.startTime) : 'Başlatılmadı'}</span>
                          </div>
                          {session.endTime && (
                            <div className="flex items-center space-x-2">
                              <CheckIcon className="w-4 h-4" />
                              <span>{formatDate(session.endTime)}</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteSession(session)}
                          className="p-2 bg-white/60 dark:bg-slate-600/60 backdrop-blur-xl hover:bg-slate-200/80 dark:hover:bg-slate-500/80 text-slate-600 dark:text-slate-300 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'debug' && (
            <div className="space-y-4">
              <div className="bg-slate-50/80 dark:bg-slate-700/80 backdrop-blur-xl rounded-2xl p-6 border border-white/30 dark:border-slate-600/30">
                <h3 className="text-lg font-light text-slate-700 dark:text-slate-200 mb-4">Debug Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-light text-slate-600 dark:text-slate-300 mb-2">Session Sayısı</h4>
                    <p className="text-2xl font-light text-blue-600 dark:text-blue-400">{state.sessions.length}</p>
                  </div>
                  <div>
                    <h4 className="font-light text-slate-600 dark:text-slate-300 mb-2">Aktif Session</h4>
                    <p className="text-2xl font-light text-emerald-600 dark:text-emerald-400">
                      {state.activeSession ? 'Var' : 'Yok'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-light text-slate-600 dark:text-slate-300 mb-2">Son Güncelleme</h4>
                    <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                      {state.lastUpdate ? state.lastUpdate.toLocaleString('tr-TR') : 'Yok'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-light text-slate-600 dark:text-slate-300 mb-2">Loading Durumu</h4>
                    <p className="text-sm text-slate-400 dark:text-slate-400 font-light">
                      {state.isLoading ? 'Yükleniyor...' : 'Hazır'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
