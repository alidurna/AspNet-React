/**
 * Dashboard Sayfası - TaskFlow Frontend
 *
 * Kullanıcıların giriş yaptıktan sonra gördüğü ana kontrol paneli.
 * Geçici basit versiyon - ileride geliştirilecek.
 */

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

/**
 * Dashboard Component
 */
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Hoş geldin, {user?.firstName}!
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="col-span-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard
            </h2>
            <p className="text-gray-600">
              TaskFlow uygulamasına hoş geldiniz! Bu geçici bir dashboard
              sayfasıdır.
            </p>
          </Card>

          {/* Stats Cards */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Toplam Görevler
            </h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-gray-500">Henüz görev yok</p>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tamamlanan
            </h3>
            <p className="text-3xl font-bold text-success-600">0</p>
            <p className="text-sm text-gray-500">Tamamlanan görev</p>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen</h3>
            <p className="text-3xl font-bold text-warning-600">0</p>
            <p className="text-sm text-gray-500">Bekleyen görev</p>
          </Card>

          {/* User Info Card */}
          <Card className="col-span-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Kullanıcı Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ad Soyad</p>
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">
                  {user?.phoneNumber || "Belirtilmemiş"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Üyelik Tarihi</p>
                <p className="font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                    : "-"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
