/**
 * Dashboard Sayfası Component
 *
 * Bu dosya, kullanıcıların TaskFlow uygulamasına giriş yaptıktan sonra
 * karşılaştığı ana dashboard sayfasını içerir. Kullanıcı deneyimini
 * optimize etmek için modern UI/UX prensipleri kullanılmıştır.
 *
 * Ana Özellikler:
 * - İstatistik kartları (toplam görev, tamamlanan, devam eden, vadesi geçen)
 * - Hızlı işlem butonları (yeni görev, görev listesi, kategoriler)
 * - Son aktiviteler listesi
 * - Hoş geldin mesajı
 * - Responsive tasarım
 * - Modern gradient arka plan
 *
 * İstatistik Kartları:
 * - Toplam Görev: Kullanıcının toplam görev sayısı
 * - Tamamlanan: Başarıyla tamamlanan görevler
 * - Devam Ediyor: Aktif olarak çalışılan görevler
 * - Vadesi Geçen: Süresi dolmuş görevler
 *
 * Hızlı İşlemler:
 * - Yeni Görev: Hızlıca görev oluşturma
 * - Görev Listesi: Tüm görevleri görüntüleme
 * - Kategoriler: Kategori yönetimi
 *
 * Performans:
 * - Lazy loading desteği
 * - Optimized re-renders
 * - Efficient state management
 *
 * Gelecek Geliştirmeler:
 * - Gerçek API verilerinden istatistikler
 * - Chart.js entegrasyonu
 * - Real-time updates
 * - Notification center
 * - Advanced filtering
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatsCard from "../components/ui/StatsCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner"; // LoadingSpinner'ı import et
import TaskCompletionChart from "../components/dashboard/TaskCompletionChart"; // TaskCompletionChart'ı import et
import { useQuery } from "@tanstack/react-query"; // useQuery'yi import et
import {
  profileAPI,
  type UserStatsDto,
  type ApiResponse,
} from "../services/api"; // profileAPI ve UserStatsDto'yu import et

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Kullanıcı istatistiklerini API'den çek
  const {
    data: statsResponse,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useQuery<ApiResponse<UserStatsDto>, Error>({
    queryKey: ["userStats"],
    queryFn: profileAPI.getUserStatistics,
  });

  // Mock data yerine gerçek istatistik verilerini kullan
  const statsData = statsResponse?.data
    ? [
        {
          title: "Toplam Görev",
          value: statsResponse.data.totalTasks.toString(),
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          ),
          trend: "", // Backend'den trend bilgisi gelmiyor, şimdilik boş bırakıldı
          trendUp: true,
          color: "blue" as const,
        },
        {
          title: "Tamamlanan",
          value: (statsResponse.data.completedTasks ?? 0).toString(),
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          trend: `+${(statsResponse.data.taskCompletionRate ?? 0).toFixed(2)}%`,
          trendUp: true,
          progress: statsResponse.data.taskCompletionRate ?? 0,
          color: "green" as const,
        },
        {
          title: "Devam Eden Görevler", // Başlık güncellendi
          value: (statsResponse.data.inProgressTasks ?? 0).toString(), // inProgressTasks kullanıldı
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          trend: "",
          trendUp: false,
          color: "yellow" as const,
        },
        {
          title: "Bekleyen Görevler", // Yeni kart
          value: (statsResponse.data.pendingTasks ?? 0).toString(),
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          color: "orange" as const,
        },
        {
          title: "Bu Ay Tamamlanan", // Yeni kart
          value: (statsResponse.data.tasksCompletedThisMonth ?? 0).toString(),
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
          color: "cyan" as const,
        },
        {
          title: "Bu Hafta Tamamlanan", // Yeni kart
          value: (statsResponse.data.tasksCompletedThisWeek ?? 0).toString(),
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
          color: "teal" as const,
        },
      ]
    : [];

  // Quick actions data (mevcut haliyle kalacak)
  const quickActions = [
    {
      title: "Yeni Görev",
      description: "Hızlıca yeni bir görev oluştur",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      action: () => navigate("/tasks/new"),
      color: "blue" as const,
    },
    {
      title: "Görev Listesi",
      description: "Tüm görevleri görüntüle",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
      action: () => navigate("/tasks"),
      color: "purple" as const,
    },
    {
      title: "Kategoriler",
      description: "Kategori yönetimi",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      action: () => navigate("/categories"),
      color: "green" as const,
    },
  ];

  // Recent activities mock data
  const recentActivities = [
    {
      id: 1,
      action: "Görev tamamlandı",
      task: "Proje dokümantasyonu",
      time: "2 saat önce",
      type: "completed",
    },
    {
      id: 2,
      action: "Yeni görev oluşturuldu",
      task: "API entegrasyonu",
      time: "4 saat önce",
      type: "created",
    },
    {
      id: 3,
      action: "Görev güncellendi",
      task: "UI/UX tasarım",
      time: "1 gün önce",
      type: "updated",
    },
  ];

  return (
    <DashboardLayout title="Dashboard" breadcrumbs={[{ name: "Dashboard" }]}>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Hoş Geldiniz, {user?.firstName}! 👋
              </h2>
              <p className="text-lg opacity-90">
                Bugün{" "}
                {new Date().toLocaleDateString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {/* Yıldız Simgesi Kaldırıldı */}
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {isStatsLoading ? (
          // Yükleme durumu için iskelet ekranı
          <>
            {[...Array(4)].map((_, index) => (
              <StatsCard
                key={index}
                isLoading={true}
                title=""
                value=""
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c1.657 0 3 1.343 3 3v2a3 3 0 01-3 3m0-6V7m0 6v2m-3 0h6m-3-6v6m-4-3h4"
                    />
                  </svg>
                }
              />
            ))}
          </>
        ) : isStatsError ? (
          // Hata durumu
          <div className="lg:col-span-4 text-center text-red-600 font-medium">
            İstatistikler yüklenirken bir hata oluştu.
          </div>
        ) : (
          statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendUp={stat.trendUp}
              progress={stat.progress}
              color={stat.color}
              isLoading={isStatsLoading}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Görev Tamamlama Grafiği */}
        <Card className="p-6 shadow-md rounded-lg h-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Görev Tamamlama Oranı
          </h3>
          {isStatsLoading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner />
            </div>
          ) : isStatsError || !statsResponse?.data ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              İstatistikler yüklenirken bir hata oluştu.
            </div>
          ) : (
            <TaskCompletionChart
              completedTasks={statsResponse.data.completedTasks}
              totalTasks={statsResponse.data.totalTasks}
            />
          )}
        </Card>

        {/* Son Aktiviteler */}
        <Card title="Son Aktiviteler" className="p-6">
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {activity.type === "completed" ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.action}</span>:{" "}
                    {activity.task} -{" "}
                    <span className="text-gray-500">{activity.time}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Henüz bir aktivite yok.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Hızlı İşlemler */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
        Hızlı İşlemler
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="p-6 shadow-md rounded-lg flex flex-col items-start space-y-4 hover:shadow-lg transition-shadow duration-200"
            onClick={action.action}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${action.color}-100 text-${action.color}-600`}
            >
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {action.title}
            </h3>
            <p className="text-sm text-gray-600">{action.description}</p>
            <Button variant="ghost" className="mt-2">
              Git <span aria-hidden="true">→</span>
            </Button>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
