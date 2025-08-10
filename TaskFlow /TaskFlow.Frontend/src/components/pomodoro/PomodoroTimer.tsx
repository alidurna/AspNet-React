/**
 * PomodoroTimer Component - Ultra Elegant & Soft Design
 * 
 * Zarif, yumuşak ve modern Pomodoro timer bileşeni
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePomodoro } from './context/PomodoroContext';
import { useToast } from '../../hooks/useToast';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import SessionManagement from './SessionManagement';
import AnalyticsDashboard from './AnalyticsDashboard';

/**
 * Pomodoro Timer Ana Bileşeni - Ultra Zarif Tasarım
 */
export const PomodoroTimer: React.FC = () => {
  // ===== HOOKS =====
  const { isDark } = useTheme();
  const { showSuccess, showError } = useToast();
  const {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setShowSessionManagement,
    setShowAnalytics,
    setShowSettings,
    loadStats
  } = usePomodoro();
  
  // ===== STATE =====
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [sessionTitle, setSessionTitle] = useState<string>('Yeni Session');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  // ===== TIMER LOGIC =====
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isRunning && state.activeSession) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopTimer();
            showSuccess('Session tamamlandı!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning, state.activeSession, stopTimer, showSuccess]);
  
  // Session değiştiğinde timer'ı güncelle
  useEffect(() => {
    if (state.activeSession) {
      const duration = state.activeSession.plannedDurationMinutes * 60;
      setTotalTime(duration);
      setTimeLeft(duration);
      setSessionTitle(state.activeSession.title);
    } else {
      setTimeLeft(0);
      setTotalTime(0);
      setSessionTitle('Yeni Session');
    }
  }, [state.activeSession]);
  
  // ===== QUICK START FUNCTIONS =====
  
  const quickStart25 = async () => {
    try {
      setSessionTitle('25 Dakika Çalışma');
      await startTimer(0);
    } catch (error) {
      console.error('Quick start 25 hatası:', error);
    }
  };
  
  const quickStart5 = async () => {
    try {
      setSessionTitle('5 Dakika Mola');
      await startTimer(1);
    } catch (error) {
      console.error('Quick start 5 hatası:', error);
    }
  };
  
  const quickStart15 = async () => {
    try {
      setSessionTitle('15 Dakika Mola');
      await startTimer(2);
    } catch (error) {
      console.error('Quick start 15 hatası:', error);
    }
  };
  
  // ===== UTILITY FUNCTIONS =====
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgressPercentage = (): number => {
    if (totalTime === 0) return 0;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };
  
  const getTimerStateLabel = (): string => {
    if (!state.activeSession) return 'Hazır';
    if (state.isRunning) return 'Çalışıyor';
    return 'Duraklatıldı';
  };
  
  const getTimerStateColor = (): string => {
    if (!state.activeSession) return 'text-slate-400';
    if (state.isRunning) return 'text-emerald-400';
    return 'text-amber-400';
  };

  const getSessionTypeColor = (): string => {
    if (!state.activeSession) return 'from-slate-200 to-slate-300';
    switch (state.activeSession.sessionType) {
      case 0: return 'from-rose-200 to-pink-300';
      case 1: return 'from-emerald-200 to-teal-300';
      case 2: return 'from-blue-200 to-indigo-300';
      default: return 'from-slate-200 to-slate-300';
    }
  };

  const getSessionTypeIcon = (): string => {
    if (!state.activeSession) return '🍅';
    switch (state.activeSession.sessionType) {
      case 0: return '🍅';
      case 1: return '☕';
      case 2: return '🌴';
      default: return '🍅';
    }
  };

  // ===== RENDER =====
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900/80">
      {/* Soft Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-100/40 to-rose-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100/80 to-purple-100/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-4">
              <ClockIcon className="w-8 h-8 text-blue-600/80" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Pomodoro
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-light">
              Odaklan, çalış, mola ver
            </p>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Sol: Timer - Ana Panel */}
            <div className="xl:col-span-2">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 lg:p-8 border border-white/30 dark:border-slate-700/30">
                {/* Timer Display */}
                <div className="flex flex-col items-center justify-center mb-8">
                  {/* Circular Timer */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 mb-6 group">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(226, 232, 240, 0.4)"
                        strokeWidth="6"
                        className="dark:stroke-slate-600/20"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={`url(#gradient-${getSessionTypeColor().replace(/\s+/g, '-')})`}
                        strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out drop-shadow-lg"
                      />
                      <defs>
                        <linearGradient id="gradient-from-rose-200-to-pink-300" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fecdd3" />
                          <stop offset="100%" stopColor="#f9a8d4" />
                        </linearGradient>
                        <linearGradient id="gradient-from-emerald-200-to-teal-300" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#a7f3d0" />
                          <stop offset="100%" stopColor="#5eead4" />
                        </linearGradient>
                        <linearGradient id="gradient-from-blue-200-to-indigo-300" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#bfdbfe" />
                          <stop offset="100%" stopColor="#a5b4fc" />
                        </linearGradient>
                        <linearGradient id="gradient-from-slate-200-to-slate-300" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#e2e8f0" />
                          <stop offset="100%" stopColor="#cbd5e1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl sm:text-5xl lg:text-6xl font-extralight bg-gradient-to-r from-slate-700 to-slate-500 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-4">
                        {formatTime(timeLeft)}
                      </div>
                      <div className={`flex items-center space-x-2 text-base font-light ${getTimerStateColor()}`}>
                        <span className="text-2xl">{getSessionTypeIcon()}</span>
                        <span>{getTimerStateLabel()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Session Title */}
                  {state.activeSession && (
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-light text-slate-700 dark:text-slate-200 mb-1">
                        {sessionTitle}
                      </h3>
                      <p className="text-sm text-slate-400 dark:text-slate-400">
                        {state.activeSession.sessionType === 0 ? 'Çalışma Session' : 
                         state.activeSession.sessionType === 1 ? 'Kısa Mola' : 'Uzun Mola'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Control Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {/* Main Action Button */}
                  {!state.activeSession ? (
                    <button
                      onClick={() => startTimer(0)}
                      disabled={state.isLoading}
                      className="group bg-gradient-to-r from-blue-400/80 to-purple-400/80 hover:from-blue-500/90 hover:to-purple-500/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-light text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20"
                    >
                      <div className="flex items-center space-x-2">
                        <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Başla</span>
                      </div>
                    </button>
                  ) : state.isRunning ? (
                    <button
                      onClick={pauseTimer}
                      disabled={state.isLoading}
                      className="group bg-gradient-to-r from-amber-400/80 to-orange-400/80 hover:from-amber-500/90 hover:to-orange-500/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-light text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20"
                    >
                      <div className="flex items-center space-x-2">
                        <PauseIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Duraklat</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={resumeTimer}
                      disabled={state.isLoading}
                      className="group bg-gradient-to-r from-emerald-400/80 to-teal-400/80 hover:from-emerald-500/90 hover:to-teal-500/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-light text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20"
                    >
                      <div className="flex items-center space-x-2">
                        <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Devam Et</span>
                      </div>
                    </button>
                  )}
                  
                  {state.activeSession && (
                    <button
                      onClick={stopTimer}
                      disabled={state.isLoading}
                      className="group bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl border-2 border-rose-200/50 dark:border-rose-700/50 hover:border-rose-300/70 dark:hover:border-rose-600/70 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl font-light text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
                    >
                      <div className="flex items-center space-x-2">
                        <StopIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Durdur</span>
                      </div>
                    </button>
                  )}

                  {/* Secondary Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowAnalytics(true)}
                      className="group bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 hover:border-blue-300/70 dark:hover:border-blue-500/70 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
                      title="Detaylı Analitikler"
                    >
                      <ChartBarIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                      onClick={() => setShowSettings(true)}
                      className="group bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 hover:border-blue-300/70 dark:hover:border-blue-500/70 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
                      title="Ayarlar"
                    >
                      <Cog6ToothIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                      onClick={() => setShowSessionManagement(true)}
                      disabled={state.isLoading}
                      className="group bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 hover:border-indigo-300/70 dark:hover:border-indigo-500/70 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
                      title="Session Yönetimi"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">📋</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ: Hızlı Başlat - Dikey Panel */}
            <div className="w-full xl:w-80">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/30 dark:border-slate-700/30">
                <h3 className="text-xl font-light mb-6 text-center text-slate-700 dark:text-slate-200">
                  Hızlı Başlat
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={quickStart25}
                    disabled={state.isLoading}
                    className="group w-full bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-rose-900/20 dark:to-pink-900/20 backdrop-blur-xl border border-rose-200/50 dark:border-rose-700/50 hover:border-rose-300/70 dark:hover:border-rose-600/70 rounded-2xl p-4 text-left transition-all duration-500 hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">🍅</div>
                      <div>
                        <div className="font-light text-slate-700 dark:text-slate-200 text-lg">
                          {state.settings.workDuration}dk Çalışma
                        </div>
                        <div className="text-sm text-slate-400 dark:text-slate-400">Pomodoro</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={quickStart5}
                    disabled={state.isLoading}
                    className="group w-full bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-700/50 hover:border-emerald-300/70 dark:hover:border-emerald-600/70 rounded-2xl p-4 text-left transition-all duration-500 hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">☕</div>
                      <div>
                        <div className="font-light text-slate-700 dark:text-slate-200 text-lg">
                          {state.settings.shortBreakDuration}dk Mola
                        </div>
                        <div className="text-sm text-slate-400 dark:text-slate-400">Kısa Mola</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={quickStart15}
                    disabled={state.isLoading}
                    className="group w-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-300/70 dark:hover:border-blue-600/70 rounded-2xl p-4 text-left transition-all duration-500 hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">🌴</div>
                      <div>
                        <div className="font-light text-slate-700 dark:text-slate-200 text-lg">
                          {state.settings.longBreakDuration}dk Mola
                        </div>
                        <div className="text-sm text-slate-400 dark:text-slate-400">Uzun Mola</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management Modal */}
      {state.showSessionManagement && (
        <SessionManagement 
          onClose={() => setShowSessionManagement(false)}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {state.showAnalytics && (
        <AnalyticsDashboard 
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
};

export default PomodoroTimer;