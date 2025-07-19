# 🔐 Authentication API

TaskFlow kimlik doğrulama sistemi API dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Endpoint'ler](#endpointler)
- [Request/Response Formatları](#requestresponse-formatları)
- [Error Handling](#error-handling)
- [Güvenlik](#güvenlik)
- [Örnekler](#örnekler)

## 🎯 Genel Bakış

TaskFlow authentication sistemi aşağıdaki yöntemleri destekler:

- **JWT Token Authentication**: Stateless kimlik doğrulama
- **Refresh Token**: Otomatik token yenileme
- **OAuth Integration**: Google, Apple sosyal giriş
- **WebAuthn**: Biyometrik giriş (fingerprint, face ID)
- **Two-Factor Authentication (2FA)**: TOTP tabanlı
- **Password Reset**: Email tabanlı şifre sıfırlama

## 🔧 Endpoint'ler

### 1. Kullanıcı Kaydı

#### POST `/api/auth/register`

Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "emailVerified": false,
      "createdAt": "2024-12-19T10:30:00Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "refresh_token_here",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

### 2. Kullanıcı Girişi

#### POST `/api/auth/login`

Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "emailVerified": true,
      "lastLoginAt": "2024-12-19T10:30:00Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "refresh_token_here",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

### 3. Token Yenileme

#### POST `/api/auth/refresh`

Access token'ı yeniler.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token başarıyla yenilendi",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new_refresh_token_here",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### 4. Çıkış Yapma

#### POST `/api/auth/logout`

Kullanıcı çıkışı yapar.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Başarıyla çıkış yapıldı"
}
```

### 5. Şifre Sıfırlama

#### POST `/api/auth/forgot-password`

Şifre sıfırlama email'i gönderir.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Şifre sıfırlama email'i gönderildi"
}
```

#### POST `/api/auth/reset-password`

Şifre sıfırlama işlemini tamamlar.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Şifre başarıyla güncellendi"
}
```

### 6. Email Doğrulama

#### POST `/api/auth/verify-email`

Email doğrulama işlemini tamamlar.

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email başarıyla doğrulandı"
}
```

### 7. Sosyal Medya Girişi

#### POST `/api/auth/google`

Google OAuth ile giriş.

**Request Body:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Google ile giriş başarılı",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@gmail.com",
      "emailVerified": true,
      "provider": "Google"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "refresh_token_here",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

#### POST `/api/auth/apple`

Apple Sign-In ile giriş.

**Request Body:**
```json
{
  "identityToken": "apple_identity_token_here",
  "authorizationCode": "authorization_code_here"
}
```

### 8. İki Faktörlü Kimlik Doğrulama

#### POST `/api/auth/2fa/enable`

2FA'yı etkinleştirir.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA etkinleştirildi",
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret": "JBSWY3DPEHPK3PXP",
    "recoveryCodes": [
      "12345678",
      "87654321",
      "11223344",
      "44332211"
    ]
  }
}
```

#### POST `/api/auth/2fa/verify`

2FA doğrulaması yapar.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA doğrulaması başarılı"
}
```

### 9. WebAuthn (Biyometrik Giriş)

#### POST `/api/webauthn/register`

WebAuthn credential kaydı.

**Request Body:**
```json
{
  "credential": {
    "id": "credential_id_here",
    "type": "public-key",
    "response": {
      "attestationObject": "attestation_object_here",
      "clientDataJSON": "client_data_json_here"
    }
  }
}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Biyometrik giriş başarıyla kaydedildi",
  "data": {
    "credentialId": "credential_id_here",
    "name": "iPhone Touch ID"
  }
}
```

#### POST `/api/webauthn/authenticate`

WebAuthn ile giriş.

**Request Body:**
```json
{
  "credential": {
    "id": "credential_id_here",
    "type": "public-key",
    "response": {
      "authenticatorData": "authenticator_data_here",
      "clientDataJSON": "client_data_json_here",
      "signature": "signature_here"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Biyometrik giriş başarılı",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "refresh_token_here",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

## 📝 Request/Response Formatları

### Standard Request Headers
```
Content-Type: application/json
Accept: application/json
User-Agent: TaskFlow-Client/1.0.0
```

### Authentication Headers
```
Authorization: Bearer <access_token>
```

### Standard Response Format
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "timestamp": "ISO-8601",
  "version": "string"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "string",
  "errors": [
    {
      "field": "string",
      "message": "string",
      "code": "string"
    }
  ],
  "timestamp": "ISO-8601",
  "version": "string"
}
```

## ❌ Error Handling

### HTTP Status Codes
- **200 OK**: Başarılı işlem
- **201 Created**: Kaynak oluşturuldu
- **400 Bad Request**: Geçersiz istek
- **401 Unauthorized**: Kimlik doğrulama gerekli
- **403 Forbidden**: Yetkisiz erişim
- **404 Not Found**: Kaynak bulunamadı
- **422 Unprocessable Entity**: Doğrulama hatası
- **429 Too Many Requests**: Rate limit aşıldı
- **500 Internal Server Error**: Sunucu hatası

### Error Codes
```json
{
  "AUTH_INVALID_CREDENTIALS": "Geçersiz email veya şifre",
  "AUTH_EMAIL_NOT_VERIFIED": "Email adresi doğrulanmamış",
  "AUTH_ACCOUNT_LOCKED": "Hesap kilitlendi",
  "AUTH_TOKEN_EXPIRED": "Token süresi doldu",
  "AUTH_TOKEN_INVALID": "Geçersiz token",
  "AUTH_2FA_REQUIRED": "2FA doğrulaması gerekli",
  "AUTH_2FA_INVALID": "Geçersiz 2FA kodu",
  "AUTH_PASSWORD_TOO_WEAK": "Şifre çok zayıf",
  "AUTH_EMAIL_ALREADY_EXISTS": "Email adresi zaten kullanımda"
}
```

## 🔒 Güvenlik

### Password Requirements
- **Minimum 8 karakter**
- **En az 1 büyük harf**
- **En az 1 küçük harf**
- **En az 1 rakam**
- **En az 1 özel karakter**

### Token Security
- **JWT Secret**: 256-bit minimum
- **Access Token**: 1 saat geçerlilik
- **Refresh Token**: 7 gün geçerlilik
- **Token Rotation**: Her refresh'te yeni token

### Rate Limiting
- **Login**: 5 deneme/15 dakika
- **Register**: 3 deneme/saat
- **Password Reset**: 3 deneme/saat
- **2FA**: 3 deneme/5 dakika

### CORS Configuration
```csharp
app.UseCors(options =>
{
    options.WithOrigins("https://taskflow.com", "https://app.taskflow.com")
           .AllowAnyHeader()
           .AllowAnyMethod()
           .AllowCredentials();
});
```

## 💡 Örnekler

### cURL Örnekleri

#### Kullanıcı Kaydı
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

#### Kullanıcı Girişi
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Token Yenileme
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_token_here"
  }'
```

### JavaScript Örnekleri

#### Fetch API ile Giriş
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Token'ları localStorage'a kaydet
      localStorage.setItem('accessToken', data.data.token.accessToken);
      localStorage.setItem('refreshToken', data.data.token.refreshToken);
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

#### Axios ile API Çağrısı
```javascript
import axios from 'axios';

// Axios interceptor ile token ekleme
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token yenileme interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });
          
          localStorage.setItem('accessToken', response.data.data.accessToken);
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
          
          // Orijinal isteği tekrarla
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh token geçersiz, kullanıcıyı logout yap
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

## 📊 Monitoring

### Authentication Metrics
- **Login Success Rate**: Başarılı giriş oranı
- **Login Failure Rate**: Başarısız giriş oranı
- **Token Refresh Rate**: Token yenileme oranı
- **2FA Usage**: 2FA kullanım oranı
- **Social Login Usage**: Sosyal giriş kullanım oranı

### Security Monitoring
- **Failed Login Attempts**: Başarısız giriş denemeleri
- **Suspicious Activity**: Şüpheli aktiviteler
- **Account Lockouts**: Hesap kilitleri
- **Token Abuse**: Token kötüye kullanımı

---

**Son Güncelleme**: 2024-12-19  
**API Versiyon**: v1.0.0  
**Durum**: ✅ Production Ready 