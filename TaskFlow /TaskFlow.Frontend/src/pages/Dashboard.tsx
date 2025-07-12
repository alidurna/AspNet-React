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
import ToastDemo from "../components/demo/ToastDemo";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data - gerçek API'den gelecek
  const statsData = [
    {
      title: "Toplam Görev",
      value: "24",
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
      trend: "+12%",
      trendUp: true,
      color: "blue" as const,
    },
    {
      title: "Tamamlanan",
      value: "18",
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
      trend: "+8%",
      trendUp: true,
      progress: 75,
      color: "green" as const,
    },
    {
      title: "Devam Ediyor",
      value: "4",
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
      trend: "-2%",
      trendUp: false,
      color: "yellow" as const,
    },
    {
      title: "Vadesi Geçen",
      value: "2",
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
  ];

  // Quick actions data
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
              <h2 className="text-2xl font-bold mb-2">
                Hoş Geldiniz, {user?.firstName}! 👋
              </h2>
              <p className="text-blue-100">
                Bugün{" "}
                {new Date().toLocaleDateString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
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
        ))}
      </div>

      {/* Toast Demo Section */}
      <div className="mb-8">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Notification System Demo
            </h3>
            <p className="text-gray-600 mb-4">
              Aşağıdaki butonları kullanarak yeni toast notification sistemini
              test edebilirsiniz.
            </p>
            <ToastDemo />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hızlı İşlemler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={action.action}
                  >
                    <div
                      className={`
                      w-12 h-12 rounded-lg flex items-center justify-center mb-3
                      ${
                        action.color === "blue"
                          ? "bg-blue-100 text-blue-600"
                          : action.color === "purple"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-green-100 text-green-600"
                      }
                    `}
                    >
                      {action.icon}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Son Aktiviteler
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${
                        activity.type === "completed"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "created"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                      }
                    `}
                    >
                      {activity.type === "completed" ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : activity.type === "created" ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                      ) : (
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
                  </div>
                ))}
              </div>
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
