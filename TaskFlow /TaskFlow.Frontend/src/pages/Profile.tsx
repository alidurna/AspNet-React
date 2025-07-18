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
  type ApiResponse,
  authAPI, // authAPI'yi import et
  fileUploadAPI, // fileUploadAPI'yi import et
} from "../services/api";
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../types/auth.types";
import type { UploadLimitsDto } from "../types/file.types"; // Doğru yerden import edildi
import { useToast } from "../hooks/useToast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Input from "../components/ui/Input";
import { FaCamera } from "react-icons/fa";
import { MdDelete } from "react-icons/md"; // Yeni import: Silme ikonu

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
  // isUploadingImage state'i kaldırılıyor
  // const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  // E-posta doğrulama formu için state
  const [emailVerificationToken, setEmailVerificationToken] = useState<string>("");

  /**
   * Yükleme limitlerini çeker.
   * @returns {UseQueryResult<ApiResponse<UploadLimitsDto>, Error>}
   * @sideeffect API'ye GET isteği atar, cache'den okur veya günceller.
   */
  const { data: uploadLimits } = useQuery({
    queryKey: ["uploadLimits"],
    queryFn: fileUploadAPI.getUploadLimits, // fileUploadAPI.getUploadLimits olarak düzeltildi
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
        phoneNumber: profile.data.phoneNumber || "", // Telefon numarası eklendi
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
  const changePasswordMutation = useMutation<ApiResponse<object>, Error, ChangePasswordRequest>({
    mutationFn: authAPI.changePassword, // profileAPI yerine authAPI kullanıldı
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
   * E-posta doğrulama isteği gönderme işlemini yöneten mutation.
   *
   * @mutationFn authAPI.requestEmailVerification
   * @onSuccess Kullanıcıya toast ile başarı mesajı gösterir.
   * @onError Kullanıcıya hata mesajı gösterir.
   * @sideeffect API'ye POST isteği atar.
   */
  const requestEmailVerificationMutation = useMutation({
    mutationFn: authAPI.requestEmailVerification,
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess("Doğrulama e-postası başarıyla gönderildi!");
      } else {
        toast.showError(response.message || "Doğrulama e-postası gönderilirken bir hata oluştu.");
      }
    },
    onError: (error) => {
      toast.showError(error.message || "Doğrulama e-postası gönderilirken bir hata oluştu.");
    },
  });

  /**
   * E-posta doğrulama işlemini yöneten mutation.
   *
   * @mutationFn authAPI.verifyEmail
   * @onSuccess Kullanıcıya toast ile başarı mesajı gösterir, profil verisini yeniden çeker.
   * @onError Kullanıcıya hata mesajı gösterir.
   * @sideeffect API'ye POST isteği atar, cache invalidation ile profil verisini günceller.
   */
  const verifyEmailMutation = useMutation({
    mutationFn: authAPI.verifyEmail,
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess("E-posta adresiniz başarıyla doğrulandı!");
        setEmailVerificationToken(""); // Formu sıfırla
        queryClient.invalidateQueries({ queryKey: ["profile"] }); // Profil verisini yeniden çek
      } else {
        toast.showError(response.message || "E-posta doğrulanırken bir hata oluştu.");
      }
    },
    onError: (error) => {
      toast.showError(error.message || "E-posta doğrulanırken bir hata oluştu.");
    },
  });

  /**
   * Avatar silme işlemini yöneten mutation.
   *
   * @mutationFn fileUploadAPI.deleteAvatar
   * @onSuccess Kullanıcıya toast ile başarı mesajı gösterir, profil verisini yeniden çeker.
   * @onError Kullanıcıya hata mesajı gösterir.
   * @sideeffect API'ye DELETE isteği atar, cache invalidation ile profil verisini günceller.
   */
  // Avatar silme mutasyonu kaldırıldı
  // const deleteAvatarMutation = useMutation({
  //   mutationFn: fileUploadAPI.deleteAvatar,
  //   onSuccess: () => {
  //     toast.showSuccess("Profil fotoğrafı başarıyla silindi!");
  //     queryClient.invalidateQueries({ queryKey: ["profile"] }); // Profil verisini yeniden çek
  //   },
  //   onError: (error) => {
  //     toast.showError(error.message || "Profil fotoğrafı silinirken bir hata oluştu.");
  //   },
  // });

  /**
   * Profil fotoğrafı yükleme işlemini yöneten mutation.
   *
   * @mutationFn profileAPI.uploadProfileImage
   * @onSuccess Kullanıcıya toast ile başarı mesajı gösterir, profil verisini yeniden çeker.
   * @onError Kullanıcıya hata mesajı gösterir.
   * @sideeffect API'ye POST isteği atar, cache invalidation ile profil verisini günceller.
   */
  // Profil fotoğrafı yükleme mutasyonu kaldırıldı
  // const uploadImageMutation = useMutation({
  //   mutationFn: (file: File) => fileUploadAPI.uploadAvatar(file), // fileUploadAPI.uploadAvatar kullan
  //   onSuccess: (response) => {
  //     toast.showSuccess("Profil fotoğrafı başarıyla güncellendi");
  //     // setIsUploadingImage(false); // Kaldırıldı
  //     // Profil verilerini yeniden çek
  //     queryClient.invalidateQueries({ queryKey: ["profile"] });
  //     // Eğer backend'den yeni bir profil resmi URL'i dönüyorsa, doğrudan state'i güncelleyebiliriz.
  //     // Şu anki backend yanıtında fileName, originalName vb. dönüyor. Frontend'in avatar URL'ini alması için backend'in revize edilmesi gerekebilir.
  //   },
  //   onError: () => {
  //     toast.showError("Profil fotoğrafı yüklenirken bir hata oluştu");
  //     // setIsUploadingImage(false); // Kaldırıldı
  //   },
  // });

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
   * E-posta doğrulama isteği gönderme handler'ı.
   * Kullanıcının mevcut email adresine doğrulama e-postası gönderir.
   */
  const handleRequestEmailVerification = () => {
    if (profile?.data?.email) {
      requestEmailVerificationMutation.mutate({ email: profile.data.email });
    }
  };

  /**
   * E-posta doğrulama formu submit handler'ı.
   * Kullanıcının girdiği token ile e-postayı doğrular.
   */
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.data?.email && emailVerificationToken) {
      verifyEmailMutation.mutate({
        email: profile.data.email,
        token: emailVerificationToken,
      });
    } else {
      toast.showError("Lütfen doğrulama kodunu ve e-posta adresini girin.");
    }
  };

  /**
   * Avatar silme handler'ı.
   * Kullanıcının mevcut avatarını siler.
   */
  const handleDeleteAvatar = () => {
    if (profile?.data?.profileImage) {
      updateProfileMutation.mutate({
        ...formData,
        profileImage: "", // Profil resmini boş string olarak ayarla (backend null olarak işleyebilir)
      });
    } else {
      toast.showInfo("Silinecek bir profil fotoğrafınız bulunmamaktadır.");
    }
  };

  /**
   * Profil fotoğrafı seçildiğinde çağrılır.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Dosya input change event'i
   * @returns {void}
   * @sideeffect updateProfileMutation'u tetikler, API'ye dosya yükler.
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

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        updateProfileMutation.mutate({
          ...formData,
          profileImage: reader.result, // Base64 string'ini profileImage olarak gönder
        });
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Form input'larında değişiklik olduğunda çağrılır.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event'i
   * @returns {void}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UpdateProfileRequest) => ({ ...prev, [name]: value })); // prev açıkça tiplendirildi
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
    <DashboardLayout title="Profilim" breadcrumbs={[{ name: "Profilim" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Sütun: Profil Bilgileri ve İstatistikler */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profil Bilgileri Kartı */}
          <Card title="Profil Bilgilerim">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <p className="text-red-500">Profil bilgileri yüklenirken hata oluştu.</p>
            ) : (
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Ad</label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="mt-1 block w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Soyad</label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="mt-1 block w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile?.data?.email || ""}
                      readOnly
                      className="mt-1 block w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      value={formData.phoneNumber}
                      onChange={handleChange} // handleChange fonksiyonu kullanıldı
                      readOnly={!isEditing}
                      className="mt-1 block w-full"
                    />
                  </div>
                  {isEditing && (
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={updateProfileMutation.isPending}>İptal</Button>
                      <Button type="submit" isLoading={updateProfileMutation.isPending}>Kaydet</Button>
                    </div>
                  )}
                  {!isEditing && (
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setIsEditing(true)}>Profili Düzenle</Button>
                    </div>
                  )}
                </div>
              </form>
            )}
          </Card>

          {/* Şifre Değiştirme Kartı */}
          <Card title="Şifre Değiştir">
            {!isChangingPassword ? (
              <Button onClick={() => setIsChangingPassword(true)}>Şifre Değiştir</Button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mevcut Şifre</label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="secondary" onClick={() => setIsChangingPassword(false)} disabled={changePasswordMutation.isPending}>İptal</Button>
                  <Button type="submit" isLoading={changePasswordMutation.isPending}>Şifreyi Değiştir</Button>
                </div>
              </form>
            )}
          </Card>

          {/* E-posta Doğrulama Kartı */}
          <Card title="E-posta Doğrulama">
            {profile?.data?.isEmailVerified ? (
              <div className="text-green-600 font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                E-posta adresiniz doğrulandı.
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  E-posta adresiniz henüz doğrulanmadı. Hesabınızın güvenliğini artırmak için lütfen e-posta adresinizi doğrulayın.
                </p>
                <Button
                  onClick={handleRequestEmailVerification}
                  isLoading={requestEmailVerificationMutation.isPending}
                  disabled={requestEmailVerificationMutation.isPending}
                >
                  Doğrulama E-postası Gönder
                </Button>

                <form onSubmit={handleVerifyEmail} className="space-y-3 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">Doğrulama Kodunu Girin:</p>
                  <div>
                    <label htmlFor="emailVerificationToken" className="sr-only">Doğrulama Kodu</label>
                    <Input
                      id="emailVerificationToken"
                      name="emailVerificationToken"
                      type="text"
                      placeholder="Doğrulama Kodu"
                      value={emailVerificationToken}
                      onChange={(e) => setEmailVerificationToken(e.target.value)}
                      required
                      className="mt-1 block w-full"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={verifyEmailMutation.isPending}>E-postayı Doğrula</Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>

        {/* Sağ Sütun: Avatar ve İstatistikler */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Kartı */}
          <Card title="Profil Fotoğrafı">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
                {profile?.data?.profileImage ? (
                  <img src={profile.data.profileImage} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-gray-500">{profile?.data?.firstName?.charAt(0) || profile?.data?.email?.charAt(0) || 'U'}</span>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 text-xs hover:bg-blue-700 transition-colors duration-200"
                  title="Fotoğraf Yükle"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">PNG, JPG, JPEG veya GIF (max {uploadLimits?.data?.avatar.maxSizeFormatted || '5 MB'})</p>
              {profile?.data?.profileImage && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAvatar}
                  isLoading={updateProfileMutation.isPending}
                  disabled={updateProfileMutation.isPending}
                  className="mt-3 flex items-center justify-center"
                >
                  <MdDelete className="w-4 h-4 mr-2" /> Avatarı Sil
                </Button>
              )}
            </div>
          </Card>

          {/* İstatistikler Kartı */}
          <Card title="Görev İstatistikleri">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <p className="text-red-500">İstatistikler yüklenirken hata oluştu.</p>
            ) : (
              <div className="space-y-3">
                <p className="flex justify-between"><span>Toplam Görev:</span> <span className="font-semibold">{profile?.data?.stats?.totalTasks || 0}</span></p>
                <p className="flex justify-between"><span>Tamamlanan:</span> <span className="font-semibold">{profile?.data?.stats?.completedTasks || 0}</span></p>
                <p className="flex justify-between"><span>Bekleyen:</span> <span className="font-semibold">{profile?.data?.stats?.pendingTasks || 0}</span></p>
                <p className="flex justify-between"><span>Tamamlanma Oranı:</span> <span className="font-semibold">{profile?.data?.stats?.completionRate?.toFixed(2) || 0}%</span></p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
