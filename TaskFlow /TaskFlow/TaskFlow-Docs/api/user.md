# 👤 User API

TaskFlow kullanıcı yönetimi API dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Endpoint'ler](#endpointler)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Örnekler](#örnekler)

## 🎯 Genel Bakış

User API, kullanıcı profil yönetimi, avatar yükleme, şifre değiştirme ve kullanıcı istatistikleri için gerekli endpoint'leri sağlar.

### Desteklenen Özellikler
- **Profile Management**: Profil bilgileri yönetimi
- **Avatar Upload**: Profil fotoğrafı yükleme
- **Password Management**: Şifre değiştirme
- **User Statistics**: Kullanıcı istatistikleri
- **Account Settings**: Hesap ayarları
- **Security Settings**: Güvenlik ayarları

## 🔧 Endpoint'ler

### 1. Kullanıcı Profili

#### GET `/api/users/profile`

Kullanıcının profil bilgilerini getirir.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profil bilgileri başarıyla getirildi",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "emailVerified": true,
      "avatarUrl": "https://storage.taskflow.com/avatars/user123.jpg",
      "phoneNumber": "+905551234567",
      "dateOfBirth": "1990-01-01",
      "timezone": "Europe/Istanbul",
      "language": "tr",
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        },
        "privacy": {
          "profileVisibility": "public",
          "showEmail": false,
          "showPhone": false
        }
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-19T10:30:00Z",
      "lastLoginAt": "2024-12-19T10:30:00Z"
    }
  }
}
```

#### PUT `/api/users/profile`

Kullanıcı profil bilgilerini günceller.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+905551234567",
  "dateOfBirth": "1990-01-01",
  "timezone": "Europe/Istanbul",
  "language": "tr",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "privacy": {
      "profileVisibility": "public",
      "showEmail": false,
      "showPhone": false
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profil başarıyla güncellendi",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+905551234567",
      "dateOfBirth": "1990-01-01",
      "timezone": "Europe/Istanbul",
      "language": "tr",
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        },
        "privacy": {
          "profileVisibility": "public",
          "showEmail": false,
          "showPhone": false
        }
      },
      "updatedAt": "2024-12-19T11:00:00Z"
    }
  }
}
```

### 2. Avatar Yönetimi

#### POST `/api/users/avatar`

Profil fotoğrafı yükler.

**Request Body (multipart/form-data):**
```
avatar: [image file]
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Avatar başarıyla yüklendi",
  "data": {
    "avatar": {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "fileName": "avatar.jpg",
      "fileSize": 102400,
      "fileType": "image/jpeg",
      "url": "https://storage.taskflow.com/avatars/user123.jpg",
      "thumbnailUrl": "https://storage.taskflow.com/avatars/user123_thumb.jpg",
      "uploadedAt": "2024-12-19T11:30:00Z"
    }
  }
}
```

#### DELETE `/api/users/avatar`

Profil fotoğrafını siler.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar başarıyla silindi"
}
```

### 3. Şifre Yönetimi

#### PUT `/api/users/password`

Kullanıcı şifresini değiştirir.

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Şifre başarıyla değiştirildi"
}
```

### 4. Kullanıcı İstatistikleri

#### GET `/api/users/stats`

Kullanıcının istatistiklerini getirir.

**Query Parameters:**
```
?period=month&startDate=2024-12-01&endDate=2024-12-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "İstatistikler başarıyla getirildi",
  "data": {
    "stats": {
      "totalTasks": 150,
      "completedTasks": 120,
      "pendingTasks": 20,
      "overdueTasks": 10,
      "completionRate": 80.0,
      "averageTaskDuration": 3.5,
      "totalCategories": 8,
      "totalAttachments": 45,
      "streakDays": 15,
      "lastActivity": "2024-12-19T10:30:00Z"
    },
    "period": {
      "startDate": "2024-12-01",
      "endDate": "2024-12-31",
      "type": "month"
    },
    "charts": {
      "taskCompletion": [
        { "date": "2024-12-01", "completed": 5, "created": 8 },
        { "date": "2024-12-02", "completed": 3, "created": 6 },
        { "date": "2024-12-03", "completed": 7, "created": 4 }
      ],
      "categoryDistribution": [
        { "category": "İş", "count": 45, "percentage": 30.0 },
        { "category": "Kişisel", "count": 35, "percentage": 23.3 },
        { "category": "Eğitim", "count": 25, "percentage": 16.7 }
      ],
      "priorityDistribution": [
        { "priority": "high", "count": 30, "percentage": 20.0 },
        { "priority": "medium", "count": 75, "percentage": 50.0 },
        { "priority": "low", "count": 45, "percentage": 30.0 }
      ]
    }
  }
}
```

### 5. Hesap Ayarları

#### GET `/api/users/settings`

Kullanıcı ayarlarını getirir.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ayarlar başarıyla getirildi",
  "data": {
    "settings": {
      "account": {
        "emailNotifications": true,
        "pushNotifications": true,
        "smsNotifications": false,
        "marketingEmails": false,
        "twoFactorEnabled": true,
        "sessionTimeout": 3600
      },
      "privacy": {
        "profileVisibility": "public",
        "showEmail": false,
        "showPhone": false,
        "showBirthDate": false,
        "allowSearch": true,
        "dataSharing": false
      },
      "notifications": {
        "taskReminders": true,
        "dueDateAlerts": true,
        "overdueNotifications": true,
        "weeklyReports": true,
        "achievementAlerts": true
      },
      "display": {
        "theme": "dark",
        "language": "tr",
        "timezone": "Europe/Istanbul",
        "dateFormat": "DD/MM/YYYY",
        "timeFormat": "24h"
      }
    }
  }
}
```

#### PUT `/api/users/settings`

Kullanıcı ayarlarını günceller.

**Request Body:**
```json
{
  "account": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "marketingEmails": false,
    "sessionTimeout": 3600
  },
  "privacy": {
    "profileVisibility": "public",
    "showEmail": false,
    "showPhone": false,
    "showBirthDate": false,
    "allowSearch": true,
    "dataSharing": false
  },
  "notifications": {
    "taskReminders": true,
    "dueDateAlerts": true,
    "overdueNotifications": true,
    "weeklyReports": true,
    "achievementAlerts": true
  },
  "display": {
    "theme": "dark",
    "language": "tr",
    "timezone": "Europe/Istanbul",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h"
  }
}
```

### 6. Güvenlik Ayarları

#### GET `/api/users/security`

Güvenlik ayarlarını getirir.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Güvenlik ayarları başarıyla getirildi",
  "data": {
    "security": {
      "twoFactorEnabled": true,
      "twoFactorMethod": "totp",
      "lastPasswordChange": "2024-12-01T00:00:00Z",
      "passwordExpiryDays": 90,
      "loginHistory": [
        {
          "timestamp": "2024-12-19T10:30:00Z",
          "ipAddress": "192.168.1.100",
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "location": "Istanbul, Turkey",
          "device": "Desktop",
          "browser": "Chrome",
          "success": true
        }
      ],
      "activeSessions": [
        {
          "sessionId": "session123",
          "device": "Desktop",
          "browser": "Chrome",
          "ipAddress": "192.168.1.100",
          "lastActivity": "2024-12-19T10:30:00Z",
          "createdAt": "2024-12-19T09:00:00Z"
        }
      ],
      "webAuthnCredentials": [
        {
          "id": "credential123",
          "name": "iPhone Touch ID",
          "createdAt": "2024-12-01T00:00:00Z",
          "lastUsedAt": "2024-12-19T10:30:00Z"
        }
      ]
    }
  }
}
```

#### DELETE `/api/users/sessions/{sessionId}`

Belirli bir oturumu sonlandırır.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Oturum başarıyla sonlandırıldı"
}
```

#### DELETE `/api/users/sessions`

Tüm oturumları sonlandırır (mevcut oturum hariç).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tüm oturumlar başarıyla sonlandırıldı"
}
```

### 7. Kullanıcı Arama

#### GET `/api/users/search`

Kullanıcı arama yapar (admin yetkisi gerekli).

**Query Parameters:**
```
?q=john&page=1&limit=10&role=user&status=active
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Arama sonuçları",
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-12-19T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## 📊 Data Models

### User Model
```json
{
  "id": "string (UUID)",
  "firstName": "string (required, max 100 chars)",
  "lastName": "string (required, max 100 chars)",
  "email": "string (required, max 255 chars, unique)",
  "emailVerified": "boolean",
  "phoneNumber": "string (max 20 chars)",
  "dateOfBirth": "date (ISO 8601)",
  "timezone": "string (IANA timezone)",
  "language": "string (ISO 639-1)",
  "avatarUrl": "string (max 500 chars)",
  "preferences": "object (JSON)",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "lastLoginAt": "datetime"
}
```

### User Preferences Model
```json
{
  "theme": "enum (light, dark, auto)",
  "notifications": {
    "email": "boolean",
    "push": "boolean",
    "sms": "boolean"
  },
  "privacy": {
    "profileVisibility": "enum (public, private, friends)",
    "showEmail": "boolean",
    "showPhone": "boolean",
    "showBirthDate": "boolean",
    "allowSearch": "boolean",
    "dataSharing": "boolean"
  }
}
```

### User Statistics Model
```json
{
  "totalTasks": "number",
  "completedTasks": "number",
  "pendingTasks": "number",
  "overdueTasks": "number",
  "completionRate": "number (0-100)",
  "averageTaskDuration": "number (days)",
  "totalCategories": "number",
  "totalAttachments": "number",
  "streakDays": "number",
  "lastActivity": "datetime"
}
```

## ❌ Error Handling

### HTTP Status Codes
- **200 OK**: Başarılı işlem
- **201 Created**: Kaynak oluşturuldu
- **400 Bad Request**: Geçersiz istek
- **401 Unauthorized**: Kimlik doğrulama gerekli
- **403 Forbidden**: Yetkisiz erişim
- **404 Not Found**: Kullanıcı bulunamadı
- **422 Unprocessable Entity**: Doğrulama hatası
- **429 Too Many Requests**: Rate limit aşıldı

### Error Codes
```json
{
  "USER_NOT_FOUND": "Kullanıcı bulunamadı",
  "USER_ACCESS_DENIED": "Bu kullanıcıya erişim yetkiniz yok",
  "INVALID_PASSWORD": "Geçersiz şifre",
  "PASSWORD_TOO_WEAK": "Şifre çok zayıf",
  "PASSWORDS_DONT_MATCH": "Şifreler eşleşmiyor",
  "INVALID_AVATAR": "Geçersiz avatar dosyası",
  "AVATAR_TOO_LARGE": "Avatar dosyası çok büyük",
  "INVALID_PHONE": "Geçersiz telefon numarası",
  "INVALID_DATE": "Geçersiz tarih",
  "SETTINGS_UPDATE_FAILED": "Ayar güncellemesi başarısız"
}
```

## 💡 Örnekler

### cURL Örnekleri

#### Profil Getirme
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <access_token>"
```

#### Profil Güncelleme
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+905551234567",
    "timezone": "Europe/Istanbul"
  }'
```

#### Avatar Yükleme
```bash
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer <access_token>" \
  -F "avatar=@/path/to/avatar.jpg"
```

#### Şifre Değiştirme
```bash
curl -X PUT http://localhost:5000/api/users/password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

### JavaScript Örnekleri

#### Profil Yönetimi
```javascript
const getUserProfile = async () => {
  const response = await fetch('/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

const updateUserProfile = async (profileData) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(profileData)
  });
  
  return response.json();
};

// Kullanım
const profile = await getUserProfile();
const updatedProfile = await updateUserProfile({
  firstName: 'John',
  lastName: 'Doe',
  timezone: 'Europe/Istanbul'
});
```

#### Avatar Yükleme
```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch('/api/users/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: formData
  });
  
  return response.json();
};

// Kullanım
const fileInput = document.getElementById('avatarInput');
const file = fileInput.files[0];
const result = await uploadAvatar(file);
```

#### İstatistikler
```javascript
const getUserStats = async (period = 'month', startDate, endDate) => {
  const params = new URLSearchParams({
    period,
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });
  
  const response = await fetch(`/api/users/stats?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

// Kullanım
const stats = await getUserStats('month', '2024-12-01', '2024-12-31');
console.log(`Tamamlanan görevler: ${stats.data.stats.completedTasks}`);
```

## 📊 Monitoring

### User Metrics
- **Profile Update Rate**: Profil güncelleme oranı
- **Avatar Upload Success Rate**: Avatar yükleme başarı oranı
- **Password Change Rate**: Şifre değiştirme oranı
- **Settings Update Rate**: Ayar güncelleme oranı
- **Session Management**: Oturum yönetimi metrikleri

### Performance Metrics
- **API Response Time**: Endpoint yanıt süreleri
- **File Upload Performance**: Dosya yükleme performansı
- **Database Query Performance**: Veritabanı sorgu performansı
- **Cache Hit Rate**: Önbellek isabet oranı

---

**Son Güncelleme**: 2024-12-19  
**API Versiyon**: v1.0.0  
**Durum**: ✅ Production Ready 