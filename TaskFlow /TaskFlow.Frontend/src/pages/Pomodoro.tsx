// ****************************************************************************************************
//  POMODORO.TSX
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro ana sayfasıdır.
//  Pomodoro Timer ve istatistikleri bir arada sunar.
//  Kullanıcıların zaman yönetimi ve productivity takibi yapmalarını sağlar.
// ****************************************************************************************************

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PomodoroProvider } from '../components/pomodoro/context/PomodoroContext';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import PomodoroStats from '../components/pomodoro/PomodoroStats';
import Card from '../components/ui/Card';

import { 
  ClockIcon,
  ChartBarIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Pomodoro Ana Sayfası
 */
const Pomodoro: React.FC = () => {
  // ===== HOOKS =====
  const { user } = useAuth();
  
  // ===== STATE =====
  const [activeTab, setActiveTab] = useState<'timer' | 'stats'>('timer');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  // ===== RENDER =====
  
  if (!user) {
    return (
      <Card className="p-8 text-center">
        <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Pomodoro Timer'a Erişim
        </h3>
        <p className="text-gray-500">
          Pomodoro Timer'ı kullanmak için giriş yapmanız gerekiyor.
        </p>
      </Card>
    );
  }
  
  return (
    <PomodoroProvider>
      <div className="h-full">
        {activeTab === 'timer' && <PomodoroTimer />}
        {activeTab === 'stats' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-light text-slate-800 mb-2">İstatistikler</h1>
              <p className="text-slate-600">Performansını takip et, gelişimini gör</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
                <button
                  onClick={() => setActiveTab('timer')}
                  className="px-6 py-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 flex items-center space-x-2"
                >
                  <ClockIcon className="w-5 h-5" />
                  <span>Timer</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className="px-6 py-3 rounded-xl bg-white text-blue-600 shadow-sm flex items-center space-x-2"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span>İstatistikler</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="ml-4 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Help Panel */}
            {showHelp && (
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/20 p-8 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">
                      🍅 Pomodoro Tekniği Nasıl Kullanılır?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-semibold text-sm">1</div>
                          <div>
                            <div className="font-semibold">Çalışma Session'ı</div>
                            <div className="text-sm">25 dakika odaklanmış çalışma</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">2</div>
                          <div>
                            <div className="font-semibold">Kısa Mola</div>
                            <div className="text-sm">5 dakika dinlenme</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">3</div>
                          <div>
                            <div className="font-semibold">Uzun Mola</div>
                            <div className="text-sm">4 session sonra 15 dakika</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">4</div>
                          <div>
                            <div className="font-semibold">Tekrar</div>
                            <div className="text-sm">Döngüyü sürdür</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <PomodoroStats />
          </div>
        </div>
      )}
      </div>
    </PomodoroProvider>
  );
};

export default Pomodoro;