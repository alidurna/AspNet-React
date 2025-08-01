/**
 * ProfileForm Component
 * 
 * Kullanıcının profil bilgilerini düzenlemesi için form component'i.
 * Ad, soyad, email, telefon gibi temel bilgileri yönetir.
 */

import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaTimes } from 'react-icons/fa';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isReadOnly = false
}) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Form verisi değiştiğinde hasChanges'i güncelle
  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(isChanged);
  }, [formData, initialData]);

  // Initial data değiştiğinde form'u güncelle
  useEffect(() => {
    setFormData(initialData);
    setHasChanges(false);
  }, [initialData]);

  /**
   * Form input değişikliklerini handle eder
   */
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Form validasyonu
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (formData.phoneNumber && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Form submit işlemi
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  /**
   * Değişiklikleri geri al
   */
  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    setHasChanges(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Profil Bilgileri
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ad ve Soyad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ad *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Adınızı girin"
              disabled={isLoading || isReadOnly}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.firstName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              } ${isReadOnly ? 'bg-gray-50 dark:bg-gray-600' : ''}`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Soyad *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Soyadınızı girin"
              disabled={isLoading || isReadOnly}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.lastName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              } ${isReadOnly ? 'bg-gray-50 dark:bg-gray-600' : ''}`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* E-posta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaEnvelope className="inline w-4 h-4 mr-1" />
            E-posta Adresi *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="E-posta adresinizi girin"
            disabled={isLoading || isReadOnly}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            } ${isReadOnly ? 'bg-gray-50 dark:bg-gray-600' : ''}`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaPhone className="inline w-4 h-4 mr-1" />
            Telefon Numarası
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+90 555 123 45 67"
            disabled={isLoading || isReadOnly}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.phoneNumber ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            } ${isReadOnly ? 'bg-gray-50 dark:bg-gray-600' : ''}`}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            İsteğe bağlı - Bildirimlerde kullanılabilir
          </p>
        </div>

        {/* Form Buttons */}
        {!isReadOnly && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
              >
                <FaTimes className="w-4 h-4 inline mr-1" />
                İptal
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm; 