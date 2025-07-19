# 📝 Task API

TaskFlow görev yönetimi API dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Endpoint'ler](#endpointler)
- [Data Models](#data-models)
- [Query Parameters](#query-parameters)
- [Error Handling](#error-handling)
- [Örnekler](#örnekler)

## 🎯 Genel Bakış

Task API, kullanıcıların görevlerini oluşturması, düzenlemesi, silmesi ve yönetmesi için gerekli tüm endpoint'leri sağlar.

### Desteklenen Özellikler
- **CRUD Operations**: Oluşturma, okuma, güncelleme, silme
- **Search & Filtering**: Gelişmiş arama ve filtreleme
- **Bulk Operations**: Toplu işlemler
- **File Attachments**: Dosya ekleme
- **Progress Tracking**: İlerleme takibi
- **Categories**: Kategori yönetimi
- **Priorities**: Öncelik seviyeleri

## 🔧 Endpoint'ler

### 1. Görev Listesi

#### GET `/api/tasks`

Kullanıcının görevlerini listeler.

**Query Parameters:**
```
?page=1&limit=10&search=test&category=work&priority=high&status=pending&sortBy=createdAt&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Görevler başarıyla getirildi",
  "data": {
    "tasks": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Proje planlaması",
        "description": "Q1 projelerini planla",
        "status": "pending",
        "priority": "high",
        "progress": 0,
        "dueDate": "2024-12-31T23:59:59Z",
        "category": {
          "id": "456e7890-e89b-12d3-a456-426614174001",
          "name": "İş",
          "color": "#3B82F6"
        },
        "attachments": [
          {
            "id": "789e0123-e89b-12d3-a456-426614174002",
            "fileName": "plan.pdf",
            "fileSize": 1024000,
            "fileType": "application/pdf"
          }
        ],
        "createdAt": "2024-12-19T10:30:00Z",
        "updatedAt": "2024-12-19T10:30:00Z"
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

### 2. Görev Oluşturma

#### POST `/api/tasks`

Yeni görev oluşturur.

**Request Body:**
```json
{
  "title": "Proje planlaması",
  "description": "Q1 projelerini detaylı olarak planla ve timeline oluştur",
  "categoryId": "456e7890-e89b-12d3-a456-426614174001",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["planlama", "proje", "q1"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Görev başarıyla oluşturuldu",
  "data": {
    "task": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Proje planlaması",
      "description": "Q1 projelerini detaylı olarak planla ve timeline oluştur",
      "status": "pending",
      "priority": "high",
      "progress": 0,
      "dueDate": "2024-12-31T23:59:59Z",
      "category": {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "İş",
        "color": "#3B82F6"
      },
      "tags": ["planlama", "proje", "q1"],
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    }
  }
}
```

### 3. Görev Detayı

#### GET `/api/tasks/{id}`

Belirli bir görevin detaylarını getirir.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Görev detayları başarıyla getirildi",
  "data": {
    "task": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Proje planlaması",
      "description": "Q1 projelerini detaylı olarak planla ve timeline oluştur",
      "status": "in_progress",
      "priority": "high",
      "progress": 60,
      "dueDate": "2024-12-31T23:59:59Z",
      "category": {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "İş",
        "color": "#3B82F6"
      },
      "attachments": [
        {
          "id": "789e0123-e89b-12d3-a456-426614174002",
          "fileName": "plan.pdf",
          "fileSize": 1024000,
          "fileType": "application/pdf",
          "uploadedAt": "2024-12-19T10:30:00Z"
        }
      ],
      "tags": ["planlama", "proje", "q1"],
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T11:45:00Z",
      "completedAt": null
    }
  }
}
```

### 4. Görev Güncelleme

#### PUT `/api/tasks/{id}`

Görev bilgilerini günceller.

**Request Body:**
```json
{
  "title": "Proje planlaması - Güncellenmiş",
  "description": "Q1 projelerini detaylı olarak planla ve timeline oluştur. Risk analizi de ekle.",
  "categoryId": "456e7890-e89b-12d3-a456-426614174001",
  "priority": "medium",
  "dueDate": "2024-12-25T23:59:59Z",
  "tags": ["planlama", "proje", "q1", "risk-analizi"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Görev başarıyla güncellendi",
  "data": {
    "task": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Proje planlaması - Güncellenmiş",
      "description": "Q1 projelerini detaylı olarak planla ve timeline oluştur. Risk analizi de ekle.",
      "status": "in_progress",
      "priority": "medium",
      "progress": 60,
      "dueDate": "2024-12-25T23:59:59Z",
      "category": {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "İş",
        "color": "#3B82F6"
      },
      "tags": ["planlama", "proje", "q1", "risk-analizi"],
      "updatedAt": "2024-12-19T12:00:00Z"
    }
  }
}
```

### 5. Görev Silme

#### DELETE `/api/tasks/{id}`

Görevi siler.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Görev başarıyla silindi"
}
```

### 6. İlerleme Güncelleme

#### PUT `/api/tasks/{id}/progress`

Görev ilerlemesini günceller.

**Request Body:**
```json
{
  "progress": 75,
  "status": "in_progress"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "İlerleme başarıyla güncellendi",
  "data": {
    "task": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "progress": 75,
      "status": "in_progress",
      "updatedAt": "2024-12-19T12:30:00Z"
    }
  }
}
```

### 7. Görev Tamamlama

#### PUT `/api/tasks/{id}/complete`

Görevi tamamlar.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Görev başarıyla tamamlandı",
  "data": {
    "task": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "completed",
      "progress": 100,
      "completedAt": "2024-12-19T13:00:00Z",
      "updatedAt": "2024-12-19T13:00:00Z"
    }
  }
}
```

### 8. Toplu İşlemler

#### POST `/api/tasks/bulk-delete`

Birden fazla görevi siler.

**Request Body:**
```json
{
  "taskIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "456e7890-e89b-12d3-a456-426614174001"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2 görev başarıyla silindi",
  "data": {
    "deletedCount": 2
  }
}
```

#### POST `/api/tasks/bulk-complete`

Birden fazla görevi tamamlar.

**Request Body:**
```json
{
  "taskIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "456e7890-e89b-12d3-a456-426614174001"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2 görev başarıyla tamamlandı",
  "data": {
    "completedCount": 2
  }
}
```

### 9. Dosya Ekleme

#### POST `/api/tasks/{id}/attachments`

Göreve dosya ekler.

**Request Body (multipart/form-data):**
```
file: [binary file data]
description: "Proje planı dosyası"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Dosya başarıyla eklendi",
  "data": {
    "attachment": {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "fileName": "plan.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "description": "Proje planı dosyası",
      "uploadedAt": "2024-12-19T14:00:00Z"
    }
  }
}
```

### 10. Arama ve Filtreleme

#### GET `/api/tasks/search`

Gelişmiş arama yapar.

**Query Parameters:**
```
?q=proje&category=work&priority=high&status=pending&dueDateFrom=2024-12-01&dueDateTo=2024-12-31&tags=planlama,proje
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Arama sonuçları",
  "data": {
    "tasks": [...],
    "pagination": {...},
    "filters": {
      "applied": {
        "search": "proje",
        "category": "work",
        "priority": "high"
      },
      "available": {
        "categories": [...],
        "priorities": [...],
        "statuses": [...]
      }
    }
  }
}
```

## 📊 Data Models

### Task Model
```json
{
  "id": "string (UUID)",
  "title": "string (required, max 200 chars)",
  "description": "string (max 2000 chars)",
  "status": "enum (pending, in_progress, completed, cancelled)",
  "priority": "enum (low, medium, high, urgent)",
  "progress": "number (0-100)",
  "dueDate": "datetime (ISO 8601)",
  "categoryId": "string (UUID)",
  "category": "Category object",
  "attachments": "Attachment[]",
  "tags": "string[]",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "completedAt": "datetime (nullable)"
}
```

### Category Model
```json
{
  "id": "string (UUID)",
  "name": "string (required, max 100 chars)",
  "color": "string (hex color)",
  "icon": "string (icon name)",
  "description": "string (max 500 chars)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Attachment Model
```json
{
  "id": "string (UUID)",
  "fileName": "string",
  "fileSize": "number (bytes)",
  "fileType": "string (MIME type)",
  "filePath": "string",
  "description": "string (max 500 chars)",
  "uploadedAt": "datetime"
}
```

## 🔍 Query Parameters

### Pagination
- `page`: Sayfa numarası (default: 1)
- `limit`: Sayfa başına öğe sayısı (default: 10, max: 100)

### Sorting
- `sortBy`: Sıralama alanı (title, createdAt, dueDate, priority, progress)
- `sortOrder`: Sıralama yönü (asc, desc)

### Filtering
- `search`: Metin araması
- `category`: Kategori ID'si
- `priority`: Öncelik seviyesi
- `status`: Görev durumu
- `dueDateFrom`: Başlangıç tarihi
- `dueDateTo`: Bitiş tarihi
- `tags`: Etiket listesi (virgülle ayrılmış)

### Date Ranges
- `createdAtFrom`: Oluşturulma tarihi başlangıç
- `createdAtTo`: Oluşturulma tarihi bitiş
- `completedAtFrom`: Tamamlanma tarihi başlangıç
- `completedAtTo`: Tamamlanma tarihi bitiş

## ❌ Error Handling

### HTTP Status Codes
- **200 OK**: Başarılı işlem
- **201 Created**: Kaynak oluşturuldu
- **400 Bad Request**: Geçersiz istek
- **401 Unauthorized**: Kimlik doğrulama gerekli
- **403 Forbidden**: Yetkisiz erişim
- **404 Not Found**: Görev bulunamadı
- **422 Unprocessable Entity**: Doğrulama hatası
- **429 Too Many Requests**: Rate limit aşıldı

### Error Codes
```json
{
  "TASK_NOT_FOUND": "Görev bulunamadı",
  "TASK_ACCESS_DENIED": "Bu göreve erişim yetkiniz yok",
  "TASK_ALREADY_COMPLETED": "Görev zaten tamamlanmış",
  "TASK_DUE_DATE_INVALID": "Geçersiz bitiş tarihi",
  "TASK_TITLE_REQUIRED": "Görev başlığı gerekli",
  "TASK_TITLE_TOO_LONG": "Görev başlığı çok uzun",
  "TASK_DESCRIPTION_TOO_LONG": "Görev açıklaması çok uzun",
  "TASK_CATEGORY_NOT_FOUND": "Kategori bulunamadı",
  "TASK_PROGRESS_INVALID": "Geçersiz ilerleme değeri",
  "TASK_BULK_OPERATION_FAILED": "Toplu işlem başarısız"
}
```

## 💡 Örnekler

### cURL Örnekleri

#### Görev Listesi
```bash
curl -X GET "http://localhost:5000/api/tasks?page=1&limit=10&priority=high" \
  -H "Authorization: Bearer <access_token>"
```

#### Görev Oluşturma
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Yeni görev",
    "description": "Görev açıklaması",
    "categoryId": "456e7890-e89b-12d3-a456-426614174001",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

#### Görev Güncelleme
```bash
curl -X PUT http://localhost:5000/api/tasks/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Güncellenmiş görev",
    "progress": 50
  }'
```

### JavaScript Örnekleri

#### Görev Listesi
```javascript
const getTasks = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/tasks?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

// Kullanım
const tasks = await getTasks({
  page: 1,
  limit: 10,
  priority: 'high',
  status: 'pending'
});
```

#### Görev Oluşturma
```javascript
const createTask = async (taskData) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(taskData)
  });
  
  return response.json();
};

// Kullanım
const newTask = await createTask({
  title: 'Yeni görev',
  description: 'Görev açıklaması',
  categoryId: '456e7890-e89b-12d3-a456-426614174001',
  priority: 'high',
  dueDate: '2024-12-31T23:59:59Z'
});
```

#### Dosya Ekleme
```javascript
const addAttachment = async (taskId, file, description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  
  const response = await fetch(`/api/tasks/${taskId}/attachments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: formData
  });
  
  return response.json();
};

// Kullanım
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const attachment = await addAttachment(taskId, file, 'Proje dosyası');
```

## 📊 Monitoring

### Task Metrics
- **Task Creation Rate**: Görev oluşturma oranı
- **Task Completion Rate**: Görev tamamlama oranı
- **Average Task Duration**: Ortalama görev süresi
- **Overdue Tasks**: Gecikmiş görevler
- **Category Distribution**: Kategori dağılımı

### Performance Metrics
- **API Response Time**: Endpoint yanıt süreleri
- **Database Query Performance**: Veritabanı sorgu performansı
- **File Upload Success Rate**: Dosya yükleme başarı oranı
- **Search Performance**: Arama performansı

---

**Son Güncelleme**: 2024-12-19  
**API Versiyon**: v1.0.0  
**Durum**: ✅ Production Ready 