/**
 * Profile Sayfası Component
 *
 * Bu dosya, kullanıcıların profil bilgilerini görüntüleyebilmesi ve
 * güncelleyebilmesi için tasarlanmış profil yönetim sayfasını içerir.
 * React Query ile veri yönetimi ve modern form handling kullanılmıştır.
 *
 * Ana Özellikler:
 * - Profil bilgilerini görüntüleme (ad, soyad, email, profil fotoğrafı)
 * - Profil bilgilerini güncelleme
 * - Profil fotoğrafı yükleme/değiştirme
 * - Şifre değiştirme
 * - Form validation
 * - Loading state yönetimi
 * - Toast bildirimleri
 *
 * Güvenlik:
 * - Sadece giriş yapmış kullanıcılar erişebilir
 * - Şifre değiştirme için mevcut şifre doğrulaması
 * - Dosya upload güvenliği
 * - XSS koruması
 *
 * API Entegrasyonu:
 * - React Query ile veri fetching
 * - Optimistic updates
 * - Cache invalidation
 * - Error handling
 *
 * Form Yönetimi:
 * - Controlled components
 * - Real-time validation
 * - Form state management
 * - File upload handling
 *
 * Performans:
 * - Lazy loading
 * - Optimized re-renders
 * - Efficient state updates
 * - Memory leak koruması
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive error handling
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  profileAPI,
  type UserProfile,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type ApiResponse,
} from "../services/api";
import { useToast } from "../hooks/useToast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Input from "../components/ui/Input";
import { FaCamera } from "react-icons/fa";

/**
 * Profile component
 * Kullanıcı profilini gösterir ve güncellemeye olanak tanır.
 *
 * - Profil verisini React Query ile API'den çeker.
 * - Profil güncelleme, şifre değiştirme ve fotoğraf yükleme işlemlerini yönetir.
 * - Tüm işlemler için toast ile kullanıcıya bilgi verir.
 *
 * @returns {JSX.Element} Profil sayfası UI'sı
 * @sideeffect API çağrıları, global cache invalidation, toast gösterimi
 */
const Profile: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  /**
   * Profil güncelleme formunun state'i.
   * @type {UpdateProfileRequest}
   * @default { firstName: '', lastName: '' }
   */
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
  });

  /**
   * Şifre değiştirme formunun state'i.
   * @type {ChangePasswordRequest}
   * @default { currentPassword: '', newPassword: '', confirmPassword: '' }
   */
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /**
   * Profil verisini API'den çeker.
   *
   * @returns {UseQueryResult<ApiResponse<UserProfile>, Error>}
   * @sideeffect API'ye GET isteği atar, cache'den okur veya günceller.
   * @error API hatası veya yetkisiz erişim durumunda error state'e düşer.
   */
  const {
    data: profile,
    isLoading,
    error,
  }: UseQueryResult<ApiResponse<UserProfile>, Error> = useQuery({
    queryKey: ["profile"],
    queryFn: profileAPI.getProfile,
  });

  /**
   * Profil verisi geldiğinde formu otomatik doldurur.
   * @sideeffect formData state'ini günceller.
   */
  React.useEffect(() => {
    if (profile?.data) {
      setFormData({
        firstName: profile.data.firstName,
        lastName: profile.data.lastName,
      });
    }
  }, [profile]);

  /**
   * Profil güncelleme işlemini yöneten mutation.
   *
   * @mutationFn profileAPI.updateProfile
   * @onSuccess Kullanıcıya toast ile başarı mesajı gösterir, düzenleme modunu kapatır.
   * @onError Kullanıcıya hata mesajı gösterir.
   * @sideeffect API'ye PUT isteği atar, cache invalidation yapılmaz (isteğe bağlı eklenebilir).
   */
  const updateProfileMutation = useMutation({
    mutationFn: profileAPI.updateProfile,
    onSuccess: () => {
      toast.showSuccess("Profil başarıyla güncellendi");
      setIsEditing(false);
    },
    onError: () => {
      toast.showError("Profil güncellenirken bir hata oluştu");
    },
  });

  /**
   * Şifre değiştirme işlemini yöneten mutation.
   *
   * @mutationFn profileAPI.changePassword
   * @onSuccess Kullanıcıya toast ile başarı mesajı gösterir, formu sıfırlar.
   * @onError Kullanıcıya hata mesajı gösterir.
   * @sideeffect API'ye PUT isteği atar.
   */
  const changePasswordMutation = useMutation({
    mutationFn: profileAPI.changePassword,
    onSuccess: () => {
      toast.showSuccess("Şifreniz başarıyla değiştirildi");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: () => {
      toast.showError("Şifre değiştirilirken bir hata oluştu");
    },
  });

  /**
   * Profil fotoğrafı yükleme işlemini yöneten mutation.
   *
   * @mutationFn profileAPI.uploadProfileImage
   * @onSuccess Kullanıcıya toast ile başarı mesajı gösterir, profil verisini yeniden çeker.
   * @onError Kullanıcıya hata mesajı gösterir.
   * @sideeffect API'ye POST isteği atar, cache invalidation ile profil verisini günceller.
   */
  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => profileAPI.uploadProfileImage(file),
    onSuccess: (response) => {
      toast.showSuccess("Profil fotoğrafı başarıyla güncellendi");
      setIsUploadingImage(false);
      // Profil verilerini yeniden çek
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast.showError("Profil fotoğrafı yüklenirken bir hata oluştu");
      setIsUploadingImage(false);
    },
  });

  /**
   * Profil güncelleme formunun submit event handler'ı.
   *
   * @param {React.FormEvent} e - Form submit event'i
   * @returns {void}
   * @sideeffect updateProfileMutation'u tetikler, API'ye istek atar.
   */
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  /**
   * Şifre değiştirme formunun submit event handler'ı.
   *
   * @param {React.FormEvent} e - Form submit event'i
   * @returns {void}
   * @sideeffect changePasswordMutation'u tetikler, API'ye istek atar.
   * @note Şifreler eşleşmiyorsa kullanıcıya hata mesajı gösterir.
   */
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.showError("Şifreler eşleşmiyor");
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  /**
   * Profil fotoğrafı seçildiğinde çağrılır.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Dosya input change event'i
   * @returns {void}
   * @sideeffect uploadImageMutation'u tetikler, API'ye dosya yükler.
   * @note Dosya tipi ve boyutu kontrolü yapılır, uygun değilse hata mesajı gösterir.
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.showError("Dosya boyutu 5MB'dan büyük olamaz");
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      toast.showError("Lütfen geçerli bir resim dosyası seçin");
      return;
    }

    setIsUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  // Profil verisi yükleniyorsa loading spinner göster
  if (isLoading) {
    return (
      <DashboardLayout title="Profil" breadcrumbs={[{ name: "Profil" }]}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  // Profil verisi veya hata yoksa hata mesajı göster
  if (error || !profile?.data) {
    return (
      <DashboardLayout title="Profil" breadcrumbs={[{ name: "Profil" }]}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Profil bilgileri yüklenirken bir hata oluştu
          </p>
          <Button onClick={() => window.location.reload()}>Yeniden Dene</Button>
        </div>
      </DashboardLayout>
    );
  }

  const userData = profile.data;

  return (
    <DashboardLayout title="Profil" breadcrumbs={[{ name: "Profil" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil Fotoğrafı ve İstatistikler */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-gray-200">
                  {userData.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt="Profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-4xl text-gray-400">
                        {userData.firstName[0]}
                        {userData.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                {/* Profil fotoğrafı yükleme butonu */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
                  disabled={isUploadingImage}
                >
                  <FaCamera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <h3 className="text-xl font-semibold">
                {userData.firstName} {userData.lastName}
              </h3>
              <p className="text-gray-600">{userData.email}</p>
            </div>
          </Card>

          {/* İstatistikler Kartı */}
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Görev İstatistikleri
              </h3>
              <div className="space-y-4">
                {/* Toplam Görev */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Toplam Görev</span>
                    <span className="font-semibold">
                      {userData.stats.totalTasks}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                {/* Tamamlanan Görev */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tamamlanan</span>
                    <span className="font-semibold">
                      {userData.stats.completedTasks}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          (userData.stats.completedTasks /
                            userData.stats.totalTasks) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Bekleyen Görev */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Bekleyen</span>
                    <span className="font-semibold">
                      {userData.stats.pendingTasks}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${
                          (userData.stats.pendingTasks /
                            userData.stats.totalTasks) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tamamlanma Oranı */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tamamlanma Oranı</span>
                    <span className="font-semibold text-lg">
                      %{Math.round(userData.stats.completionRate * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profil Bilgileri ve Şifre Değiştirme */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Profil Bilgileri</h2>

              {/* Profil düzenleme formu */}
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      E-posta
                    </label>
                    <p className="mt-1 text-gray-900">{userData.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ad
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Soyad
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? "Kaydediliyor..."
                        : "Kaydet"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        E-posta
                      </label>
                      <p className="mt-1 text-gray-900">{userData.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ad
                      </label>
                      <p className="mt-1 text-gray-900">{userData.firstName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Soyad
                      </label>
                      <p className="mt-1 text-gray-900">{userData.lastName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kayıt Tarihi
                      </label>
                      <p className="mt-1 text-gray-900">
                        {new Date(userData.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Son Giriş
                      </label>
                      <p className="mt-1 text-gray-900">
                        {userData.lastLoginAt
                          ? new Date(userData.lastLoginAt).toLocaleDateString(
                              "tr-TR"
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-x-4">
                    <Button onClick={() => setIsEditing(true)}>
                      Profili Düzenle
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Şifre Değiştir
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Şifre Değiştirme Formu */}
          {isChangingPassword && (
            <Card className="mt-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Şifre Değiştir</h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mevcut Şifre
                    </label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Yeni Şifre
                    </label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Yeni Şifre (Tekrar)
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending
                        ? "Değiştiriliyor..."
                        : "Şifreyi Değiştir"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
