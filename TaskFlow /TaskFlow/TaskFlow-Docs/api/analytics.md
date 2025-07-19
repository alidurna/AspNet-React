# 📊 Analytics API

TaskFlow analytics ve monitoring API dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Endpoint'ler](#endpointler)
- [Data Models](#data-models)
- [Real-time Analytics](#real-time-analytics)
- [Error Handling](#error-handling)
- [Örnekler](#örnekler)

## 🎯 Genel Bakış

Analytics API, kullanıcı davranışlarını, performans metriklerini ve sistem durumunu takip etmek için gerekli endpoint'leri sağlar. Real-time dashboard güncellemeleri ve detaylı raporlama özellikleri içerir.

### Desteklenen Özellikler
- **User Behavior Tracking**: Kullanıcı davranış takibi
- **Performance Metrics**: Performans metrikleri
- **Error Monitoring**: Hata izleme
- **Real-time Dashboard**: Gerçek zamanlı dashboard
- **Custom Events**: Özel event tracking
- **Data Export**: Veri dışa aktarma

## 🔧 Endpoint'ler

### 1. Event Tracking

#### POST `/api/analytics/events`

Kullanıcı davranış event'lerini kaydeder.

**Request Body:**
```json
{
  "eventType": "user_action",
  "eventName": "task_created",
  "page": "/tasks",
  "properties": {
    "taskId": "123e4567-e89b-12d3-a456-426614174000",
    "category": "work",
    "priority": "high",
    "source": "web"
  },
  "sessionId": "session123",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Event başarıyla kaydedildi",
  "data": {
    "eventId": "event123",
    "timestamp": "2024-12-19T10:30:00Z"
  }
}
```

#### POST `/api/analytics/events/batch`

Birden fazla event'i toplu olarak kaydeder.

**Request Body:**
```json
{
  "events": [
    {
      "eventType": "user_action",
      "eventName": "task_created",
      "page": "/tasks",
      "properties": {
        "taskId": "123e4567-e89b-12d3-a456-426614174000",
        "category": "work"
      },
      "timestamp": "2024-12-19T10:30:00Z"
    },
    {
      "eventType": "user_action",
      "eventName": "task_completed",
      "page": "/tasks",
      "properties": {
        "taskId": "456e7890-e89b-12d3-a456-426614174001",
        "duration": 3600
      },
      "timestamp": "2024-12-19T10:35:00Z"
    }
  ]
}
```

### 2. Performance Metrics

#### POST `/api/analytics/performance`

Performans metriklerini kaydeder.

**Request Body:**
```json
{
  "sessionId": "session123",
  "page": "/tasks",
  "metrics": {
    "lcp": 1200,
    "fid": 45,
    "cls": 0.05,
    "fcp": 800,
    "ttfb": 200,
    "domLoad": 1500,
    "windowLoad": 2500
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Performans metrikleri başarıyla kaydedildi",
  "data": {
    "metricsId": "metrics123",
    "score": 85,
    "timestamp": "2024-12-19T10:30:00Z"
  }
}
```

### 3. Error Reporting

#### POST `/api/analytics/errors`

Hata raporlarını kaydeder.

**Request Body:**
```json
{
  "message": "TypeError: Cannot read property 'title' of undefined",
  "name": "TypeError",
  "stack": "at TaskList.render (TaskList.js:45:12)\n    at ReactDOMComponent.js:123:45",
  "severity": "error",
  "category": "javascript",
  "page": "/tasks",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "sessionId": "session123",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Hata raporu başarıyla kaydedildi",
  "data": {
    "errorId": "error123",
    "fingerprint": "typeerror_cannot_read_property_title",
    "timestamp": "2024-12-19T10:30:00Z"
  }
}
```

### 4. Dashboard Data

#### GET `/api/analytics/dashboard`

Dashboard verilerini getirir.

**Query Parameters:**
```
?period=day&startDate=2024-12-19&endDate=2024-12-19&userId=123
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard verileri başarıyla getirildi",
  "data": {
    "overview": {
      "totalUsers": 1250,
      "activeUsers": 890,
      "totalTasks": 5670,
      "completedTasks": 4230,
      "completionRate": 74.6,
      "averageSessionDuration": 1800
    },
    "userActivity": {
      "newUsers": 45,
      "returningUsers": 845,
      "userRetention": 78.5,
      "topPages": [
        { "page": "/tasks", "visits": 1250, "percentage": 35.2 },
        { "page": "/dashboard", "visits": 890, "percentage": 25.1 },
        { "page": "/profile", "visits": 450, "percentage": 12.7 }
      ]
    },
    "taskMetrics": {
      "tasksCreated": 234,
      "tasksCompleted": 189,
      "tasksOverdue": 23,
      "averageTaskDuration": 3.2,
      "categoryDistribution": [
        { "category": "İş", "count": 89, "percentage": 38.0 },
        { "category": "Kişisel", "count": 67, "percentage": 28.6 },
        { "category": "Eğitim", "count": 45, "percentage": 19.2 }
      ]
    },
    "performance": {
      "averageLCP": 1200,
      "averageFID": 45,
      "averageCLS": 0.05,
      "performanceScore": 85,
      "slowPages": [
        { "page": "/tasks", "averageLoadTime": 2500, "visits": 1250 },
        { "page": "/dashboard", "averageLoadTime": 1800, "visits": 890 }
      ]
    },
    "errors": {
      "totalErrors": 23,
      "errorRate": 0.8,
      "topErrors": [
        { "message": "TypeError: Cannot read property 'title'", "count": 8, "percentage": 34.8 },
        { "message": "Network Error", "count": 5, "percentage": 21.7 }
      ]
    },
    "charts": {
      "userGrowth": [
        { "date": "2024-12-19", "newUsers": 45, "activeUsers": 890 },
        { "date": "2024-12-18", "newUsers": 38, "activeUsers": 845 },
        { "date": "2024-12-17", "newUsers": 42, "activeUsers": 823 }
      ],
      "taskCompletion": [
        { "date": "2024-12-19", "created": 234, "completed": 189 },
        { "date": "2024-12-18", "created": 198, "completed": 167 },
        { "date": "2024-12-17", "created": 212, "completed": 178 }
      ],
      "performanceTrend": [
        { "date": "2024-12-19", "lcp": 1200, "fid": 45, "cls": 0.05 },
        { "date": "2024-12-18", "lcp": 1250, "fid": 48, "cls": 0.06 },
        { "date": "2024-12-17", "lcp": 1180, "fid": 42, "cls": 0.04 }
      ]
    }
  }
}
```

### 5. User Analytics

#### GET `/api/analytics/users`

Kullanıcı analytics verilerini getirir.

**Query Parameters:**
```
?period=month&startDate=2024-12-01&endDate=2024-12-31&groupBy=day
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kullanıcı analytics verileri başarıyla getirildi",
  "data": {
    "summary": {
      "totalUsers": 1250,
      "newUsers": 234,
      "activeUsers": 890,
      "returningUsers": 656,
      "userRetention": 78.5,
      "averageSessionDuration": 1800,
      "averageSessionsPerUser": 3.2
    },
    "userJourney": {
      "signupToFirstTask": 120,
      "firstTaskToSecondTask": 85,
      "taskCompletionRate": 74.6,
      "userChurnRate": 12.3
    },
    "userSegments": [
      {
        "segment": "Power Users",
        "count": 156,
        "percentage": 12.5,
        "averageTasksPerDay": 8.5,
        "completionRate": 89.2
      },
      {
        "segment": "Regular Users",
        "count": 445,
        "percentage": 35.6,
        "averageTasksPerDay": 3.2,
        "completionRate": 76.8
      },
      {
        "segment": "Casual Users",
        "count": 649,
        "percentage": 51.9,
        "averageTasksPerDay": 1.1,
        "completionRate": 65.4
      }
    ],
    "charts": {
      "userGrowth": [
        { "date": "2024-12-01", "newUsers": 12, "activeUsers": 234 },
        { "date": "2024-12-02", "newUsers": 15, "activeUsers": 245 },
        { "date": "2024-12-03", "newUsers": 8, "activeUsers": 238 }
      ],
      "userRetention": [
        { "cohort": "2024-12-01", "day1": 100, "day7": 78, "day30": 65 },
        { "cohort": "2024-12-08", "day1": 100, "day7": 82, "day30": 68 },
        { "cohort": "2024-12-15", "day1": 100, "day7": 85, "day30": 72 }
      ]
    }
  }
}
```

### 6. Task Analytics

#### GET `/api/analytics/tasks`

Görev analytics verilerini getirir.

**Query Parameters:**
```
?period=week&startDate=2024-12-16&endDate=2024-12-22&category=work
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Görev analytics verileri başarıyla getirildi",
  "data": {
    "summary": {
      "totalTasks": 1567,
      "completedTasks": 1234,
      "pendingTasks": 234,
      "overdueTasks": 99,
      "completionRate": 78.7,
      "averageTaskDuration": 3.2,
      "totalTimeSpent": 5024.5
    },
    "categoryAnalysis": [
      {
        "category": "İş",
        "totalTasks": 567,
        "completedTasks": 445,
        "completionRate": 78.5,
        "averageDuration": 4.1,
        "popularTags": ["proje", "toplantı", "rapor"]
      },
      {
        "category": "Kişisel",
        "totalTasks": 423,
        "completedTasks": 345,
        "completionRate": 81.6,
        "averageDuration": 2.8,
        "popularTags": ["alışveriş", "temizlik", "spor"]
      }
    ],
    "priorityAnalysis": [
      {
        "priority": "high",
        "totalTasks": 234,
        "completedTasks": 189,
        "completionRate": 80.8,
        "averageDuration": 2.1
      },
      {
        "priority": "medium",
        "totalTasks": 789,
        "completedTasks": 623,
        "completionRate": 79.0,
        "averageDuration": 3.5
      },
      {
        "priority": "low",
        "totalTasks": 544,
        "completedTasks": 422,
        "completionRate": 77.6,
        "averageDuration": 4.8
      }
    ],
    "charts": {
      "taskCreation": [
        { "date": "2024-12-16", "created": 45, "completed": 38 },
        { "date": "2024-12-17", "created": 52, "completed": 42 },
        { "date": "2024-12-18", "created": 38, "completed": 35 }
      ],
      "completionTrend": [
        { "date": "2024-12-16", "completionRate": 84.4 },
        { "date": "2024-12-17", "completionRate": 80.8 },
        { "date": "2024-12-18", "completionRate": 92.1 }
      ]
    }
  }
}
```

### 7. Real-time Dashboard

#### POST `/api/analytics/dashboard/connect`

Real-time dashboard bağlantısı kurar.

**Request Body:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "dashboardType": "admin",
  "filters": {
    "period": "realtime",
    "categories": ["work", "personal"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard bağlantısı kuruldu",
  "data": {
    "connectionId": "conn123",
    "streamUrl": "/hubs/analytics",
    "updateInterval": 5000,
    "lastUpdate": "2024-12-19T10:30:00Z"
  }
}
```

#### POST `/api/analytics/dashboard/update`

Dashboard verilerini günceller.

**Request Body:**
```json
{
  "connectionId": "conn123",
  "updateType": "full",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 8. Data Export

#### GET `/api/analytics/export`

Analytics verilerini dışa aktarır.

**Query Parameters:**
```
?type=events&format=csv&startDate=2024-12-01&endDate=2024-12-31&filters=category:work
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Veri dışa aktarma başlatıldı",
  "data": {
    "exportId": "export123",
    "status": "processing",
    "estimatedCompletion": "2024-12-19T10:35:00Z",
    "downloadUrl": "/api/analytics/export/export123/download"
  }
}
```

#### GET `/api/analytics/export/{exportId}/status`

Export durumunu kontrol eder.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Export durumu",
  "data": {
    "exportId": "export123",
    "status": "completed",
    "progress": 100,
    "fileSize": 1024000,
    "downloadUrl": "/api/analytics/export/export123/download",
    "expiresAt": "2024-12-20T10:30:00Z"
  }
}
```

## 📊 Data Models

### Analytics Event Model
```json
{
  "id": "string (UUID)",
  "eventType": "string (user_action, system_event, error)",
  "eventName": "string (max 100 chars)",
  "sessionId": "string (UUID)",
  "userId": "string (UUID, nullable)",
  "page": "string (max 200 chars)",
  "userAgent": "string (max 500 chars)",
  "properties": "object (JSON)",
  "timestamp": "datetime",
  "createdAt": "datetime"
}
```

### Performance Metric Model
```json
{
  "id": "string (UUID)",
  "sessionId": "string (UUID)",
  "userId": "string (UUID, nullable)",
  "page": "string (max 200 chars)",
  "metricType": "string (lcp, fid, cls, fcp, ttfb)",
  "value": "number",
  "unit": "string (ms, seconds)",
  "score": "number (0-100)",
  "thresholds": "object (JSON)",
  "timestamp": "datetime",
  "createdAt": "datetime"
}
```

### Error Report Model
```json
{
  "id": "string (UUID)",
  "message": "string (max 500 chars)",
  "name": "string (max 100 chars)",
  "severity": "string (error, warning, info)",
  "category": "string (javascript, network, server)",
  "sessionId": "string (UUID)",
  "userId": "string (UUID, nullable)",
  "page": "string (max 200 chars)",
  "fingerprint": "string (max 200 chars)",
  "occurrences": "number",
  "firstSeen": "datetime",
  "lastSeen": "datetime",
  "resolved": "boolean",
  "userImpact": "string (low, medium, high)",
  "timestamp": "datetime",
  "createdAt": "datetime"
}
```

### User Session Model
```json
{
  "id": "string (UUID)",
  "userId": "string (UUID, nullable)",
  "startTime": "datetime",
  "endTime": "datetime (nullable)",
  "duration": "number (seconds)",
  "pageViews": "number",
  "events": "number",
  "device": "string (desktop, mobile, tablet)",
  "browser": "string (max 100 chars)",
  "os": "string (max 100 chars)",
  "country": "string (max 100 chars)",
  "city": "string (max 100 chars)",
  "ipAddress": "string (max 45 chars)",
  "userAgent": "string (max 500 chars)",
  "createdAt": "datetime"
}
```

## 🔄 Real-time Analytics

### SignalR Hub Methods

#### ConnectToAnalyticsStream
```csharp
public async Task ConnectToAnalyticsStream(string streamType, object filters)
{
    // Kullanıcıyı analytics stream'ine bağla
    await Groups.AddToGroupAsync(Context.ConnectionId, $"analytics_{streamType}");
    
    // Bağlantı durumunu kaydet
    await _analyticsService.RecordConnectionAsync(Context.ConnectionId, streamType);
}
```

#### SendAnalyticsEvent
```csharp
public async Task SendAnalyticsEvent(AnalyticsEventDto eventData)
{
    // Event'i kaydet
    await _analyticsService.RecordEventAsync(eventData);
    
    // Gerçek zamanlı güncelleme gönder
    await Clients.Group("analytics_dashboard").SendAsync("AnalyticsEventReceived", eventData);
}
```

#### SendPerformanceMetric
```csharp
public async Task SendPerformanceMetric(PerformanceMetricDto metricData)
{
    // Metrik'i kaydet
    await _analyticsService.RecordPerformanceMetricAsync(metricData);
    
    // Dashboard'a güncelleme gönder
    await Clients.Group("analytics_dashboard").SendAsync("PerformanceMetricReceived", metricData);
}
```

### Real-time Dashboard Updates
```javascript
// SignalR bağlantısı
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/analytics")
    .build();

// Analytics stream'ine bağlan
await connection.invoke("ConnectToAnalyticsStream", "dashboard", {
    period: "realtime",
    categories: ["work", "personal"]
});

// Event dinleyicileri
connection.on("AnalyticsEventReceived", (eventData) => {
    console.log("Yeni event:", eventData);
    updateDashboard(eventData);
});

connection.on("PerformanceMetricReceived", (metricData) => {
    console.log("Yeni performans metrik:", metricData);
    updatePerformanceChart(metricData);
});

connection.on("DashboardUpdate", (dashboardData) => {
    console.log("Dashboard güncellemesi:", dashboardData);
    updateDashboardUI(dashboardData);
});
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

### Error Codes
```json
{
  "ANALYTICS_ACCESS_DENIED": "Analytics erişim yetkiniz yok",
  "INVALID_EVENT_DATA": "Geçersiz event verisi",
  "INVALID_METRIC_DATA": "Geçersiz metrik verisi",
  "INVALID_DATE_RANGE": "Geçersiz tarih aralığı",
  "EXPORT_NOT_FOUND": "Export bulunamadı",
  "EXPORT_EXPIRED": "Export süresi dolmuş",
  "REAL_TIME_CONNECTION_FAILED": "Gerçek zamanlı bağlantı başarısız",
  "DATA_LIMIT_EXCEEDED": "Veri limiti aşıldı",
  "INVALID_FILTERS": "Geçersiz filtreler"
}
```

## 💡 Örnekler

### cURL Örnekleri

#### Event Tracking
```bash
curl -X POST http://localhost:5000/api/analytics/events \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "user_action",
    "eventName": "task_created",
    "page": "/tasks",
    "properties": {
      "taskId": "123e4567-e89b-12d3-a456-426614174000",
      "category": "work"
    }
  }'
```

#### Performance Metrics
```bash
curl -X POST http://localhost:5000/api/analytics/performance \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "page": "/tasks",
    "metrics": {
      "lcp": 1200,
      "fid": 45,
      "cls": 0.05
    }
  }'
```

#### Dashboard Data
```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard?period=day" \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript Örnekleri

#### Event Tracking
```javascript
const trackEvent = async (eventName, properties = {}) => {
  const response = await fetch('/api/analytics/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({
      eventType: 'user_action',
      eventName,
      page: window.location.pathname,
      properties,
      timestamp: new Date().toISOString()
    })
  });
  
  return response.json();
};

// Kullanım
await trackEvent('task_created', {
  taskId: '123e4567-e89b-12d3-a456-426614174000',
  category: 'work',
  priority: 'high'
});
```

#### Performance Tracking
```javascript
const trackPerformance = async (metrics) => {
  const response = await fetch('/api/analytics/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({
      page: window.location.pathname,
      metrics,
      timestamp: new Date().toISOString()
    })
  });
  
  return response.json();
};

// Core Web Vitals tracking
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      trackPerformance({ lcp: entry.startTime });
    }
    if (entry.entryType === 'first-input') {
      trackPerformance({ fid: entry.processingStart - entry.startTime });
    }
  }
});

observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
```

#### Dashboard Integration
```javascript
const getDashboardData = async (period = 'day', filters = {}) => {
  const params = new URLSearchParams({
    period,
    ...filters
  });
  
  const response = await fetch(`/api/analytics/dashboard?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.json();
};

// Kullanım
const dashboardData = await getDashboardData('week', {
  startDate: '2024-12-16',
  endDate: '2024-12-22'
});

console.log(`Toplam kullanıcı: ${dashboardData.data.overview.totalUsers}`);
console.log(`Tamamlama oranı: ${dashboardData.data.overview.completionRate}%`);
```

#### Real-time Dashboard
```javascript
import { HubConnectionBuilder } from '@microsoft/signalr';

class RealTimeDashboard {
  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl('/hubs/analytics')
      .build();
    
    this.setupEventHandlers();
  }
  
  async connect() {
    try {
      await this.connection.start();
      await this.connection.invoke('ConnectToAnalyticsStream', 'dashboard', {
        period: 'realtime'
      });
      console.log('Real-time dashboard bağlandı');
    } catch (error) {
      console.error('Bağlantı hatası:', error);
    }
  }
  
  setupEventHandlers() {
    this.connection.on('AnalyticsEventReceived', (eventData) => {
      this.updateEventCounter(eventData);
    });
    
    this.connection.on('PerformanceMetricReceived', (metricData) => {
      this.updatePerformanceChart(metricData);
    });
    
    this.connection.on('DashboardUpdate', (dashboardData) => {
      this.updateDashboardUI(dashboardData);
    });
  }
  
  updateEventCounter(eventData) {
    const counter = document.getElementById('event-counter');
    if (counter) {
      counter.textContent = parseInt(counter.textContent) + 1;
    }
  }
  
  updatePerformanceChart(metricData) {
    // Chart.js veya başka bir charting library ile güncelleme
    console.log('Performans metrik güncellendi:', metricData);
  }
  
  updateDashboardUI(dashboardData) {
    // Dashboard UI güncellemeleri
    console.log('Dashboard güncellendi:', dashboardData);
  }
}

// Kullanım
const dashboard = new RealTimeDashboard();
dashboard.connect();
```

## 📊 Monitoring

### Analytics Metrics
- **Event Tracking Rate**: Event kaydetme oranı
- **Performance Data Quality**: Performans veri kalitesi
- **Error Reporting Rate**: Hata raporlama oranı
- **Real-time Connection Success**: Gerçek zamanlı bağlantı başarı oranı

### Performance Metrics
- **API Response Time**: Endpoint yanıt süreleri
- **Database Query Performance**: Veritabanı sorgu performansı
- **Data Processing Time**: Veri işleme süresi
- **Export Generation Time**: Export oluşturma süresi

---

**Son Güncelleme**: 2024-12-19  
**API Versiyon**: v1.0.0  
**Durum**: ✅ Production Ready 