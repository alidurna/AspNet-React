# 📂 Category API

TaskFlow kategori yönetimi API dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Endpoint'ler](#endpointler)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Örnekler](#örnekler)

## 🎯 Genel Bakış

Category API, kullanıcıların görevlerini kategorilere ayırması için gerekli endpoint'leri sağlar. Her kategori, renk, ikon ve açıklama ile özelleştirilebilir.

### Desteklenen Özellikler
- **CRUD Operations**: Kategori oluşturma, okuma, güncelleme, silme
- **Custom Colors**: Özel renk seçimi
- **Custom Icons**: Özel ikon seçimi
- **Category Statistics**: Kategori istatistikleri
- **Bulk Operations**: Toplu işlemler
- **Default Categories**: Varsayılan kategoriler

## 🔧 Endpoint'ler

### 1. Kategori Listesi

#### GET `/api/categories`

Kullanıcının kategorilerini listeler.

**Query Parameters:**
```
?page=1&limit=10&search=work&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kategoriler başarıyla getirildi",
  "data": {
    "categories": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "İş",
        "color": "#3B82F6",
        "icon": "briefcase",
        "description": "İş ile ilgili görevler",
        "taskCount": 25,
        "isDefault": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-12-19T10:30:00Z"
      },
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "name": "Kişisel",
        "color": "#10B981",
        "icon": "user",
        "description": "Kişisel görevler",
        "taskCount": 15,
        "isDefault": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-12-19T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### 2. Kategori Oluşturma

#### POST `/api/categories`

Yeni kategori oluşturur.

**Request Body:**
```json
{
  "name": "Eğitim",
  "color": "#8B5CF6",
  "icon": "graduation-cap",
  "description": "Eğitim ve öğrenme ile ilgili görevler"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Kategori başarıyla oluşturuldu",
  "data": {
    "category": {
      "id": "abc12345-e89b-12d3-a456-426614174003",
      "name": "Eğitim",
      "color": "#8B5CF6",
      "icon": "graduation-cap",
      "description": "Eğitim ve öğrenme ile ilgili görevler",
      "taskCount": 0,
      "isDefault": false,
      "createdAt": "2024-12-19T11:00:00Z",
      "updatedAt": "2024-12-19T11:00:00Z"
    }
  }
}
```

### 3. Kategori Detayı

#### GET `/api/categories/{id}`

Belirli bir kategorinin detaylarını getirir.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kategori detayları başarıyla getirildi",
  "data": {
    "category": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "İş",
      "color": "#3B82F6",
      "icon": "briefcase",
      "description": "İş ile ilgili görevler",
      "taskCount": 25,
      "isDefault": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    },
    "recentTasks": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Proje planlaması",
        "status": "in_progress",
        "priority": "high",
        "dueDate": "2024-12-31T23:59:59Z",
        "createdAt": "2024-12-19T10:30:00Z"
      }
    ],
    "statistics": {
      "totalTasks": 25,
      "completedTasks": 18,
      "pendingTasks": 5,
      "overdueTasks": 2,
      "completionRate": 72.0,
      "averageTaskDuration": 4.2
    }
  }
}
```

### 4. Kategori Güncelleme

#### PUT `/api/categories/{id}`

Kategori bilgilerini günceller.

**Request Body:**
```json
{
  "name": "İş Projeleri",
  "color": "#1E40AF",
  "icon": "folder",
  "description": "İş projeleri ve görevler"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kategori başarıyla güncellendi",
  "data": {
    "category": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "İş Projeleri",
      "color": "#1E40AF",
      "icon": "folder",
      "description": "İş projeleri ve görevler",
      "taskCount": 25,
      "isDefault": false,
      "updatedAt": "2024-12-19T11:30:00Z"
    }
  }
}
```

### 5. Kategori Silme

#### DELETE `/api/categories/{id}`

Kategoriyi siler (içinde görev varsa silinmez).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kategori başarıyla silindi"
}
```

**Response (400 Bad Request) - Kategori kullanımda:**
```json
{
  "success": false,
  "message": "Bu kategori kullanımda olduğu için silinemez",
  "errors": [
    {
      "field": "category",
      "message": "Kategori 25 görev tarafından kullanılıyor",
      "code": "CATEGORY_IN_USE"
    }
  ]
}
```

### 6. Kategori İstatistikleri

#### GET `/api/categories/{id}/stats`

Kategorinin detaylı istatistiklerini getirir.

**Query Parameters:**
```
?period=month&startDate=2024-12-01&endDate=2024-12-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kategori istatistikleri başarıyla getirildi",
  "data": {
    "category": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "İş",
      "color": "#3B82F6"
    },
    "statistics": {
      "totalTasks": 25,
      "completedTasks": 18,
      "pendingTasks": 5,
      "overdueTasks": 2,
      "completionRate": 72.0,
      "averageTaskDuration": 4.2,
      "totalTimeSpent": 126.5,
      "productivityScore": 85.5
    },
    "period": {
      "startDate": "2024-12-01",
      "endDate": "2024-12-31",
      "type": "month"
    },
    "charts": {
      "taskCompletion": [
        { "date": "2024-12-01", "completed": 3, "created": 5 },
        { "date": "2024-12-02", "completed": 2, "created": 3 },
        { "date": "2024-12-03", "completed": 4, "created": 2 }
      ],
      "priorityDistribution": [
        { "priority": "high", "count": 8, "percentage": 32.0 },
        { "priority": "medium", "count": 12, "percentage": 48.0 },
        { "priority": "low", "count": 5, "percentage": 20.0 }
      ],
      "progressTrend": [
        { "week": "2024-W49", "completionRate": 65.0 },
        { "week": "2024-W50", "completionRate": 72.0 },
        { "week": "2024-W51", "completionRate": 78.0 }
      ]
    }
  }
}
```

### 7. Toplu İşlemler

#### POST `/api/categories/bulk-delete`

Birden fazla kategoriyi siler.

**Request Body:**
```json
{
  "categoryIds": [
    "456e7890-e89b-12d3-a456-426614174001",
    "789e0123-e89b-12d3-a456-426614174002"
  ],
  "forceDelete": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2 kategori başarıyla silindi",
  "data": {
    "deletedCount": 2,
    "failedCount": 0,
    "failedCategories": []
  }
}
```

### 8. Varsayılan Kategoriler

#### GET `/api/categories/defaults`

Varsayılan kategorileri getirir.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Varsayılan kategoriler başarıyla getirildi",
  "data": {
    "categories": [
      {
        "id": "default-work",
        "name": "İş",
        "color": "#3B82F6",
        "icon": "briefcase",
        "description": "İş ile ilgili görevler",
        "isDefault": true
      },
      {
        "id": "default-personal",
        "name": "Kişisel",
        "color": "#10B981",
        "icon": "user",
        "description": "Kişisel görevler",
        "isDefault": true
      },
      {
        "id": "default-education",
        "name": "Eğitim",
        "color": "#8B5CF6",
        "icon": "graduation-cap",
        "description": "Eğitim ve öğrenme",
        "isDefault": true
      },
      {
        "id": "default-health",
        "name": "Sağlık",
        "color": "#EF4444",
        "icon": "heart",
        "description": "Sağlık ve fitness",
        "isDefault": true
      }
    ]
  }
}
```

#### POST `/api/categories/import-defaults`

Varsayılan kategorileri kullanıcının hesabına ekler.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Varsayılan kategoriler başarıyla eklendi",
  "data": {
    "importedCount": 4,
    "categories": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "İş",
        "color": "#3B82F6",
        "icon": "briefcase",
        "description": "İş ile ilgili görevler",
        "isDefault": false
      }
    ]
  }
}
```

### 9. Kategori Arama

#### GET `/api/categories/search`

Kategori arama yapar.

**Query Parameters:**
```
?q=work&page=1&limit=10&sortBy=taskCount&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Arama sonuçları",
  "data": {
    "categories": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "İş",
        "color": "#3B82F6",
        "icon": "briefcase",
        "description": "İş ile ilgili görevler",
        "taskCount": 25,
        "isDefault": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## 📊 Data Models

### Category Model
```json
{
  "id": "string (UUID)",
  "name": "string (required, max 100 chars)",
  "color": "string (hex color, max 7 chars)",
  "icon": "string (icon name, max 50 chars)",
  "description": "string (max 500 chars)",
  "taskCount": "number (computed)",
  "isDefault": "boolean",
  "userId": "string (UUID)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Category Statistics Model
```json
{
  "totalTasks": "number",
  "completedTasks": "number",
  "pendingTasks": "number",
  "overdueTasks": "number",
  "completionRate": "number (0-100)",
  "averageTaskDuration": "number (days)",
  "totalTimeSpent": "number (hours)",
  "productivityScore": "number (0-100)"
}
```

### Category Chart Data Model
```json
{
  "taskCompletion": [
    {
      "date": "string (YYYY-MM-DD)",
      "completed": "number",
      "created": "number"
    }
  ],
  "priorityDistribution": [
    {
      "priority": "string (high, medium, low)",
      "count": "number",
      "percentage": "number"
    }
  ],
  "progressTrend": [
    {
      "week": "string (YYYY-WNN)",
      "completionRate": "number"
    }
  ]
}
```

## ❌ Error Handling

### HTTP Status Codes
- **200 OK**: Başarılı işlem
- **201 Created**: Kaynak oluşturuldu
- **400 Bad Request**: Geçersiz istek
- **401 Unauthorized**: Kimlik doğrulama gerekli
- **403 Forbidden**: Yetkisiz erişim
- **404 Not Found**: Kategori bulunamadı
- **422 Unprocessable Entity**: Doğrulama hatası
- **429 Too Many Requests**: Rate limit aşıldı

### Error Codes
```json
{
  "CATEGORY_NOT_FOUND": "Kategori bulunamadı",
  "CATEGORY_ACCESS_DENIED": "Bu kategoriye erişim yetkiniz yok",
  "CATEGORY_IN_USE": "Bu kategori kullanımda olduğu için silinemez",
  "CATEGORY_NAME_REQUIRED": "Kategori adı gerekli",
  "CATEGORY_NAME_TOO_LONG": "Kategori adı çok uzun",
  "CATEGORY_NAME_EXISTS": "Bu isimde bir kategori zaten mevcut",
  "INVALID_COLOR": "Geçersiz renk kodu",
  "INVALID_ICON": "Geçersiz ikon adı",
  "CATEGORY_DESCRIPTION_TOO_LONG": "Kategori açıklaması çok uzun",
  "CATEGORY_LIMIT_EXCEEDED": "Maksimum kategori sayısı aşıldı"
}
```

## 💡 Örnekler

### cURL Örnekleri

#### Kategori Listesi
```bash
curl -X GET "http://localhost:5000/api/categories?page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

#### Kategori Oluşturma
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eğitim",
    "color": "#8B5CF6",
    "icon": "graduation-cap",
    "description": "Eğitim ve öğrenme ile ilgili görevler"
  }'
```

#### Kategori Güncelleme
```bash
curl -X PUT http://localhost:5000/api/categories/456e7890-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "İş Projeleri",
    "color": "#1E40AF",
    "icon": "folder",
    "description": "İş projeleri ve görevler"
  }'
```

#### Kategori Silme
```bash
curl -X DELETE http://localhost:5000/api/categories/456e7890-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript Örnekleri

#### Kategori Yönetimi
```javascript
const getCategories = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/categories?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

const createCategory = async (categoryData) => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(categoryData)
  });
  
  return response.json();
};

const updateCategory = async (id, categoryData) => {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(categoryData)
  });
  
  return response.json();
};

const deleteCategory = async (id) => {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

// Kullanım
const categories = await getCategories({ page: 1, limit: 10 });

const newCategory = await createCategory({
  name: 'Eğitim',
  color: '#8B5CF6',
  icon: 'graduation-cap',
  description: 'Eğitim ve öğrenme ile ilgili görevler'
});

const updatedCategory = await updateCategory(categoryId, {
  name: 'İş Projeleri',
  color: '#1E40AF'
});

const deletedCategory = await deleteCategory(categoryId);
```

#### Kategori İstatistikleri
```javascript
const getCategoryStats = async (categoryId, period = 'month', startDate, endDate) => {
  const params = new URLSearchParams({
    period,
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });
  
  const response = await fetch(`/api/categories/${categoryId}/stats?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

// Kullanım
const stats = await getCategoryStats(categoryId, 'month', '2024-12-01', '2024-12-31');
console.log(`Kategori tamamlama oranı: ${stats.data.statistics.completionRate}%`);
```

#### Varsayılan Kategoriler
```javascript
const importDefaultCategories = async () => {
  const response = await fetch('/api/categories/import-defaults', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

// Kullanım
const result = await importDefaultCategories();
console.log(`${result.data.importedCount} varsayılan kategori eklendi`);
```

## 📊 Monitoring

### Category Metrics
- **Category Creation Rate**: Kategori oluşturma oranı
- **Category Usage Distribution**: Kategori kullanım dağılımı
- **Category Deletion Rate**: Kategori silme oranı
- **Default Category Import Rate**: Varsayılan kategori import oranı

### Performance Metrics
- **API Response Time**: Endpoint yanıt süreleri
- **Database Query Performance**: Veritabanı sorgu performansı
- **Cache Hit Rate**: Önbellek isabet oranı
- **Search Performance**: Arama performansı

---

**Son Güncelleme**: 2024-12-19  
**API Versiyon**: v1.0.0  
**Durum**: ✅ Production Ready 