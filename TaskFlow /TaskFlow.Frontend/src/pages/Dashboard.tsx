/**
 * Dashboard Page - Refactored Version
 * 
 * Bu dosya, ana dashboard sayfasının refactored edilmiş halidir.
 * Mega dosya sorunu çözülmüş, küçük ve yönetilebilir componentlere bölünmüştür.
 * 
 * Ana Özellikler:
 * - Modüler component yapısı
 * - Clean code principles
 * - Separation of concerns
 * - Better maintainability
 * - Improved performance
 * 
 * @version 3.0.0 - Refactored
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Refactored Components
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardRecentTasks from "../components/dashboard/DashboardRecentTasks";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";

// Shared Components
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../hooks/useToast";

// API Services (modular)
import { taskAPI } from "../services/api";

/**
 * Dashboard Page Component
 */
const Dashboard: React.FC = () => {
  // ===== HOOKS =====
  const navigate = useNavigate();
  const toast = useToast();

  // ===== DATA FETCHING =====
  const { data: tasksResponse, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getTasks(),
  });

  const tasks = tasksResponse?.data?.tasks || [];

  // ===== DATA PREPARATION =====
  /**
   * İstatistik verilerini hazırlar
   */
  const dashboardStats = React.useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task: any) => task.isCompleted).length;
    const inProgressTasks = tasks.filter((task: any) => 
      !task.isCompleted && task.progress > 0
    ).length;
    const overdueTasks = tasks.filter((task: any) => {
      if (task.isCompleted) return false;
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks
    };
  }, [tasks]);

  /**
   * Son aktiviteleri hazırlar
   */
  const recentTasks = React.useMemo(() => {
    return tasks
      .map((task: any) => ({
        id: task.id,
        title: task.title,
        status: (task.isCompleted ? 'completed' : 
                task.progress > 0 ? 'in_progress' : 
                (task.dueDate && new Date(task.dueDate) < new Date()) ? 'overdue' : 'pending') as 'completed' | 'in_progress' | 'overdue' | 'pending',
        priority: (task.priority === 1 ? 'low' : 
                 task.priority === 2 ? 'medium' : 'high') as 'low' | 'medium' | 'high',
        dueDate: task.dueDate,
        updatedAt: task.updatedAt || task.createdAt,
        categoryName: task.categoryName
      }))
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  }, [tasks]);

  // ===== EVENT HANDLERS =====
  const handleCreateTask = () => {
    navigate('/tasks');
    toast.showInfo('Yeni görev oluşturmak için görevler sayfasına yönlendirildiniz');
  };

  const handleViewTasks = () => {
    navigate('/tasks');
  };

  const handleViewCategories = () => {
    navigate('/categories');
  };

  const handleViewAnalytics = () => {
    navigate('/statistics');
  };

  const handleViewCalendar = () => {
    toast.showInfo('Takvim özelliği yakında eklenecek!');
  };

  const handleSearch = () => {
    toast.showInfo('Gelişmiş arama özelliği yakında eklenecek!');
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/tasks?taskId=${taskId}`);
  };

  const handleViewAllTasks = () => {
    navigate('/tasks');
  };

  // ===== LOADING STATE =====
  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
        <p><strong>Debug Info:</strong></p>
        <p>Tasks Loading: {tasksLoading ? 'Yes' : 'No'}</p>
        <p>Tasks Count: {tasks.length}</p>
        <p>Dashboard Stats: {JSON.stringify(dashboardStats)}</p>
        <p>Recent Tasks Count: {recentTasks.length}</p>
        <p>API Response: {JSON.stringify(tasksResponse)}</p>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Hoş Geldiniz! 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              TaskFlow ile görevlerinizi organize edin ve verimliliğinizi artırın
            </p>
          </div>
          
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold">
                {new Date().toLocaleDateString('tr-TR', { day: 'numeric' })}
              </div>
              <div className="text-blue-100 text-sm">
                {new Date().toLocaleDateString('tr-TR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <DashboardStats 
        stats={dashboardStats}
        isLoading={tasksLoading}
      />

      {/* Ana İçerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sol Sütun: Hızlı İşlemler */}
        <div className="lg:col-span-1">
          <DashboardQuickActions
            onCreateTask={handleCreateTask}
            onViewTasks={handleViewTasks}
            onViewCategories={handleViewCategories}
            onViewAnalytics={handleViewAnalytics}
            onViewCalendar={handleViewCalendar}
            onSearch={handleSearch}
          />
        </div>

        {/* Sağ Sütun: Son Aktiviteler */}
        <div className="lg:col-span-2">
          <DashboardRecentTasks
            tasks={recentTasks}
            isLoading={tasksLoading}
            onViewTask={handleViewTask}
            onViewAllTasks={handleViewAllTasks}
          />
        </div>
      </div>

      {/* Alt Bölüm: Ek Özellikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Günlük Hedefler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 h-full">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            📅 Günlük Hedefler
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tamamlanan Görevler</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {dashboardStats.completedTasks} / {Math.max(dashboardStats.totalTasks, 5)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${Math.min((dashboardStats.completedTasks / Math.max(dashboardStats.totalTasks, 5)) * 100, 100)}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bugünkü hedefinize ulaşmak için kalan: {Math.max(0, Math.max(dashboardStats.totalTasks, 5) - dashboardStats.completedTasks)} görev
            </p>
          </div>
        </div>

        {/* Verimlilik Skoru */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 h-full">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            📈 Verimlilik Skoru
          </h3>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {dashboardStats.totalTasks > 0 ? 
                Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
              Bu hafta ortalama
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Çok İyi</span>
            </div>
          </div>
        </div>

        {/* Yaklaşan Son Tarihler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 h-full">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            ⏰ Yaklaşan Son Tarihler
          </h3>
          {dashboardStats.overdueTasks > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium">
                  {dashboardStats.overdueTasks} görev vadesi geçti
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bu görevleri öncelikle tamamlamanız önerilir
              </p>
            </div>
          ) : (
            <div className="text-center py-3 sm:py-4">
              <div className="text-green-600 dark:text-green-400 mb-2">✅</div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Vadesi geçen göreviniz yok!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="text-center pt-2">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          TaskFlow ile verimliliğinizi artırın. Sorularınız için{' '}
          <button className="text-blue-600 dark:text-blue-400 hover:underline">
            destek ekibiyle iletişime geçin
          </button>
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 