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
          trend: `+${(statsResponse.data.completionRate ?? 0).toFixed(2)}%`,
          trendUp: true,
          progress: statsResponse.data.completionRate ?? 0,
          color: "green" as const,
        },
        {
          title: "Devam Eden",
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          trend: "",
          trendUp: false,
          color: "yellow" as const,
        },
        {
          title: "Vadesi Geçen",
          value: (statsResponse.data.overdueTasks ?? 0).toString(),
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
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          color: "red" as const,
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            />
          ))
        )}
      </div>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="flex flex-col items-center justify-center p-6 text-center shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={action.action}
          >
            <div
              className={`p-3 rounded-full mb-4 ${action.color === "blue" ? "bg-blue-100 text-blue-600" : action.color === "purple" ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"}`}
            >
              {action.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {action.title}
            </h3>
            <p className="text-gray-600 text-sm">{action.description}</p>
          </Card>
        ))}
      </div> */}

      {/* Notification System Demo */}
      {/* <div className="mb-8">
        <Card>
          <div className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168a3.189 3.189 0 00-4.887 0C7.785 12.383 6 15.367 6 18h12c0-2.633-1.785-5.617-4.248-6.832z"
              />
            </svg>
            <span>Notification System Demo</span>
          </div>
          <p className="text-gray-600 mb-6">
            Aşağıdaki butonları kullanarak yeni toast notification sistemini test
            edebilirsiniz.
          </p>
          <ToastDemo />
        </Card>
      </div> */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Hızlı İşlemler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  variant="outline"
                  className="flex flex-col items-center justify-center p-4 h-full"
                >
                  <span
                    className={`p-3 rounded-full mb-2 ${
                      action.color === "blue"
                        ? "bg-blue-100 text-blue-600"
                        : action.color === "purple"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {action.icon}
                  </span>
                  <span className="text-center font-medium">
                    {action.title}
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    {action.description}
                  </span>
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activities List */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Son Aktiviteler
            </h2>
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      activity.type === "completed"
                        ? "bg-green-100 text-green-700"
                        : activity.type === "created"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}
                  >
                    {activity.type === "completed" && (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {activity.type === "created" && (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {activity.type === "updated" && (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.task}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/activities")}
              >
                Tüm Aktiviteleri Gör
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Development Notice */}
      <div className="mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Geliştirme Aşamasında
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Bu dashboard şu anda demo verilerle çalışmaktadır. İleride
                gerçek API verilerine bağlanacak ve daha gelişmiş özellikler
                eklenecektir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
