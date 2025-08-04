/**
 * Dashboard Page - Soft & Minimal Design
 * 
 * Yeniden tasarlanmış, soft ve minimal dashboard.
 * Karmaşık gradient'lar ve gereksiz elementler kaldırıldı.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Components
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardRecentTasks from "../components/dashboard/DashboardRecentTasks";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";

// Shared Components
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../hooks/useToast";

// API Services
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
      .slice(0, 5);
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
    <div className="space-y-6 xl:space-y-8">
      {/* Welcome Section - Centered */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 xl:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-light text-gray-900 dark:text-white mb-3">
              Hoş Geldiniz
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base xl:text-lg">
              Bugün neler yapmak istiyorsunuz?
            </p>
          </div>
          
          <div className="text-center lg:text-right">
            <div className="text-3xl sm:text-4xl xl:text-5xl font-light text-gray-400 dark:text-gray-500">
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric' })}
            </div>
            <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('tr-TR', {
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats 
        stats={dashboardStats}
        isLoading={tasksLoading}
      />

      {/* Main Content Grid - Centered */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 xl:gap-8 max-w-7xl mx-auto">
        {/* Quick Actions - Fixed Width */}
        <div className="md:col-span-1 lg:col-span-1 xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 xl:p-8 h-fit">
            <h2 className="text-lg md:text-xl xl:text-xl font-medium text-gray-900 dark:text-white mb-4 md:mb-6">
              Hızlı İşlemler
            </h2>
            <DashboardQuickActions
              onCreateTask={handleCreateTask}
              onViewTasks={handleViewTasks}
              onViewCategories={handleViewCategories}
              onViewAnalytics={handleViewAnalytics}
              onViewCalendar={handleViewCalendar}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Recent Tasks - Flexible Width */}
        <div className="md:col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 xl:p-8">
            <h2 className="text-lg md:text-xl xl:text-xl font-medium text-gray-900 dark:text-white mb-4 md:mb-6">
              Son Aktiviteler
            </h2>
            <DashboardRecentTasks
              tasks={recentTasks}
              isLoading={tasksLoading}
              onViewTask={handleViewTask}
              onViewAllTasks={handleViewAllTasks}
            />
          </div>
        </div>
      </div>

      {/* Progress Section - Centered */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 xl:p-8 max-w-7xl mx-auto">
        <h2 className="text-lg xl:text-xl font-medium text-gray-900 dark:text-white mb-6">
          Bugünkü İlerleme
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 xl:gap-6">
          <div className="text-center p-4 xl:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl xl:text-3xl font-light text-gray-900 dark:text-white mb-2">
              {dashboardStats.completedTasks}
            </div>
            <div className="text-sm xl:text-base text-gray-600 dark:text-gray-400">
              Tamamlanan
            </div>
          </div>
          
          <div className="text-center p-4 xl:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl xl:text-3xl font-light text-gray-900 dark:text-white mb-2">
              {dashboardStats.totalTasks - dashboardStats.completedTasks}
            </div>
            <div className="text-sm xl:text-base text-gray-600 dark:text-gray-400">
              Kalan
            </div>
          </div>
          
          <div className="text-center p-4 xl:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl xl:text-3xl font-light text-gray-900 dark:text-white mb-2">
              {dashboardStats.totalTasks > 0 ? 
                Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100) : 0}%
            </div>
            <div className="text-sm xl:text-base text-gray-600 dark:text-gray-400">
              Tamamlama
            </div>
          </div>

          <div className="text-center p-4 xl:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl xl:text-3xl font-light text-gray-900 dark:text-white mb-2">
              {dashboardStats.inProgressTasks}
            </div>
            <div className="text-sm xl:text-base text-gray-600 dark:text-gray-400">
              Devam Ediyor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 