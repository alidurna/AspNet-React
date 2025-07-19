# 🔧 Backend Mimarisi

TaskFlow backend sisteminin detaylı mimari dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Katman Mimarisi](#katman-mimarisi)
- [Teknoloji Stack](#teknoloji-stack)
- [Veritabanı Tasarımı](#veritabanı-tasarımı)
- [API Tasarımı](#api-tasarımı)
- [Güvenlik Mimarisi](#güvenlik-mimarisi)
- [Performance Optimizasyonu](#performance-optimizasyonu)
- [Monitoring & Logging](#monitoring--logging)

## 🎯 Genel Bakış

TaskFlow backend'i **Clean Architecture** prensiplerine uygun olarak tasarlanmış, **.NET 8** tabanlı bir REST API'dir. Sistem, **modüler yapı**, **ölçeklenebilirlik** ve **güvenlik** odaklı olarak geliştirilmiştir.

### Mimari Prensipler
- **Separation of Concerns**: Katmanlar arası bağımsızlık
- **Dependency Inversion**: Bağımlılıkların tersine çevrilmesi
- **Single Responsibility**: Her katmanın tek sorumluluğu
- **Open/Closed Principle**: Genişletilebilir, değiştirilemez
- **Interface Segregation**: Küçük ve odaklı arayüzler

## 🏗️ Katman Mimarisi

### 1. **Presentation Layer (Controllers)**
```
TaskFlow.API/Controllers/
├── AuthController.cs          # Kimlik doğrulama
├── UsersController.cs         # Kullanıcı yönetimi
├── TodoTasksController.cs     # Görev yönetimi
├── CategoriesController.cs    # Kategori yönetimi
├── FilesController.cs         # Dosya yönetimi
├── AnalyticsController.cs     # Analytics
├── WebAuthnController.cs      # Biyometrik giriş
└── SearchController.cs        # Arama işlemleri
```

**Sorumluluklar:**
- HTTP request/response handling
- Input validation
- Authentication/Authorization
- Response formatting
- Error handling

**Örnek Controller:**
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TodoTasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TodoTasksController> _logger;

    public TodoTasksController(ITaskService taskService, ILogger<TodoTasksController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<TodoTaskDto>>>> GetTasks(
        [FromQuery] TaskSearchDto searchDto)
    {
        try
        {
            var result = await _taskService.GetTasksAsync(searchDto);
            return Ok(ApiResponse<PagedResult<TodoTaskDto>>.Success(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tasks");
            return StatusCode(500, ApiResponse<object>.Error("Internal server error"));
        }
    }
}
```

### 2. **Application Layer (Services)**
```
TaskFlow.API/Services/
├── UserService.cs             # Kullanıcı iş mantığı
├── TaskService.cs             # Görev iş mantığı
├── CategoryService.cs         # Kategori iş mantığı
├── FileUploadService.cs       # Dosya yükleme
├── JwtService.cs              # JWT token yönetimi
├── PasswordService.cs         # Şifre işlemleri
├── TwoFactorAuthService.cs    # 2FA işlemleri
├── WebAuthnService.cs         # Biyometrik giriş
├── AnalyticsService.cs        # Analytics işlemleri
└── CacheService.cs            # Önbellek yönetimi
```

**Sorumluluklar:**
- Business logic implementation
- Data transformation
- Validation rules
- Business workflows
- External service integration

**Örnek Service:**
```csharp
public class TaskService : ITaskService
{
    private readonly TaskFlowDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TaskService> _logger;
    private readonly ICacheService _cacheService;

    public TaskService(
        TaskFlowDbContext context,
        IMapper mapper,
        ILogger<TaskService> logger,
        ICacheService cacheService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _cacheService = cacheService;
    }

    public async Task<PagedResult<TodoTaskDto>> GetTasksAsync(TaskSearchDto searchDto)
    {
        var cacheKey = $"tasks_{searchDto.GetHashCode()}";
        
        // Cache'den kontrol et
        var cachedResult = await _cacheService.GetAsync<PagedResult<TodoTaskDto>>(cacheKey);
        if (cachedResult != null)
            return cachedResult;

        // Veritabanından getir
        var query = _context.TodoTasks
            .Include(t => t.Category)
            .Include(t => t.Attachments)
            .AsQueryable();

        // Filtreleme
        query = ApplyFilters(query, searchDto);

        // Sıralama
        query = ApplySorting(query, searchDto);

        // Sayfalama
        var totalCount = await query.CountAsync();
        var tasks = await query
            .Skip((searchDto.Page - 1) * searchDto.Limit)
            .Take(searchDto.Limit)
            .ToListAsync();

        var result = new PagedResult<TodoTaskDto>
        {
            Items = _mapper.Map<List<TodoTaskDto>>(tasks),
            TotalCount = totalCount,
            Page = searchDto.Page,
            Limit = searchDto.Limit
        };

        // Cache'e kaydet
        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));

        return result;
    }
}
```

### 3. **Domain Layer (Models & Interfaces)**
```
TaskFlow.API/Models/
├── User.cs                    # Kullanıcı entity
├── TodoTask.cs                # Görev entity
├── Category.cs                # Kategori entity
├── Attachment.cs              # Dosya entity
├── WebAuthnCredential.cs      # Biyometrik credential
├── AnalyticsEvent.cs          # Analytics event
├── UserSession.cs             # Kullanıcı session
├── ErrorReport.cs             # Hata raporu
└── PerformanceMetric.cs       # Performans metrik

TaskFlow.API/Interfaces/
├── IUserService.cs            # Kullanıcı servis arayüzü
├── ITaskService.cs            # Görev servis arayüzü
├── ICategoryService.cs        # Kategori servis arayüzü
├── IFileUploadService.cs      # Dosya yükleme arayüzü
├── IPasswordService.cs        # Şifre servis arayüzü
├── ICacheService.cs           # Önbellek arayüzü
└── IWebAuthnService.cs        # WebAuthn arayüzü
```

**Entity Örneği:**
```csharp
public class TodoTask
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; }
    public Priority Priority { get; set; }
    public int Progress { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation Properties
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    
    // JSON Properties
    public List<string> Tags { get; set; } = new List<string>();
    public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
}
```

### 4. **Infrastructure Layer (Data Access)**
```
TaskFlow.API/Data/
├── TaskFlowDbContext.cs       # Entity Framework context
├── Migrations/                # Database migrations
└── Configurations/            # Entity configurations

TaskFlow.API/Extensions/
├── MiddlewareExtensions.cs    # Middleware konfigürasyonu
└── ServiceCollectionExtensions.cs # DI konfigürasyonu
```

**DbContext Örneği:**
```csharp
public class TaskFlowDbContext : DbContext
{
    public TaskFlowDbContext(DbContextOptions<TaskFlowDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<TodoTask> TodoTasks { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    public DbSet<WebAuthnCredential> WebAuthnCredentials { get; set; }
    public DbSet<AnalyticsEvent> AnalyticsEvents { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }
    public DbSet<ErrorReport> ErrorReports { get; set; }
    public DbSet<PerformanceMetric> PerformanceMetrics { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            
            // JSON Properties
            entity.Property(e => e.Preferences)
                .HasColumnType("jsonb");
        });

        // TodoTask Configuration
        modelBuilder.Entity<TodoTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.Priority).IsRequired();
            entity.Property(e => e.Progress).HasDefaultValue(0);
            
            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Tasks)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
                
            // JSON Properties
            entity.Property(e => e.Tags)
                .HasColumnType("jsonb");
                
            entity.Property(e => e.Metadata)
                .HasColumnType("jsonb");
                
            // Indexes
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.CreatedAt);
        });
    }
}
```

## 🔧 Teknoloji Stack

### Core Framework
- **.NET 8**: En son .NET sürümü
- **ASP.NET Core**: Web framework
- **Entity Framework Core**: ORM framework
- **AutoMapper**: Object mapping
- **FluentValidation**: Input validation

### Authentication & Security
- **JWT Bearer Tokens**: Stateless authentication
- **BCrypt**: Password hashing
- **ASP.NET Core Identity**: User management
- **WebAuthn**: Biyometrik giriş
- **TOTP**: Two-factor authentication

### Database & Caching
- **PostgreSQL**: Primary database
- **Redis**: Caching ve session storage
- **JSONB**: Semi-structured data storage
- **Full-text Search**: PostgreSQL search capabilities

### Real-time Communication
- **SignalR**: Real-time updates
- **WebSocket**: Bidirectional communication
- **Hub Pattern**: Centralized communication

### Logging & Monitoring
- **Serilog**: Structured logging
- **Application Insights**: Application monitoring
- **Health Checks**: System health monitoring

### File Storage
- **Local File System**: Development
- **Azure Blob Storage**: Production
- **AWS S3**: Alternative cloud storage

## 🗄️ Veritabanı Tasarımı

### Schema Overview
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    avatar_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TodoTasks table
CREATE TABLE todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    due_date TIMESTAMP,
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES todo_tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WebAuthn Credentials table
CREATE TABLE webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL,
    public_key TEXT NOT NULL,
    sign_count BIGINT DEFAULT 0,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- Analytics Events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    page VARCHAR(200),
    user_agent TEXT,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_tasks_user_id ON todo_tasks(user_id);
CREATE INDEX idx_tasks_category_id ON todo_tasks(category_id);
CREATE INDEX idx_tasks_status ON todo_tasks(status);
CREATE INDEX idx_tasks_priority ON todo_tasks(priority);
CREATE INDEX idx_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX idx_tasks_created_at ON todo_tasks(created_at);

-- Full-text search indexes
CREATE INDEX idx_tasks_title_search ON todo_tasks USING gin(to_tsvector('turkish', title));
CREATE INDEX idx_tasks_description_search ON todo_tasks USING gin(to_tsvector('turkish', description));

-- JSON indexes
CREATE INDEX idx_tasks_tags ON todo_tasks USING gin(tags);
CREATE INDEX idx_users_preferences ON users USING gin(preferences);
```

## 🔒 Güvenlik Mimarisi

### Authentication Flow
```
1. User Login Request
   ↓
2. Credential Validation
   ↓
3. JWT Token Generation
   ↓
4. Token Response
   ↓
5. API Request with Token
   ↓
6. Token Validation
   ↓
7. Authorization Check
   ↓
8. Resource Access
```

### Security Layers
1. **Network Security**
   - HTTPS/TLS 1.3
   - CORS configuration
   - Rate limiting

2. **Application Security**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF protection

3. **Data Security**
   - Password hashing (BCrypt)
   - Data encryption at rest
   - Secure communication

4. **Access Control**
   - Role-based authorization
   - Resource-based permissions
   - Token-based authentication

### JWT Configuration
```csharp
public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}

services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
        };
    });
```

## ⚡ Performance Optimizasyonu

### Caching Strategy
```csharp
public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheService> _logger;

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var value = await _cache.GetStringAsync(key);
        if (string.IsNullOrEmpty(value))
            return default;

        return JsonSerializer.Deserialize<T>(value);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var options = new DistributedCacheEntryOptions();
        if (expiration.HasValue)
            options.SetAbsoluteExpiration(expiration.Value);

        var serializedValue = JsonSerializer.Serialize(value);
        await _cache.SetStringAsync(key, serializedValue, options);
    }
}
```

### Database Optimization
```csharp
// Query optimization
public async Task<List<TodoTask>> GetTasksOptimizedAsync(Guid userId, TaskSearchDto searchDto)
{
    var query = _context.TodoTasks
        .AsNoTracking() // Read-only optimization
        .Include(t => t.Category)
        .Include(t => t.Attachments.Take(5)) // Limit related data
        .Where(t => t.UserId == userId);

    // Apply filters
    if (!string.IsNullOrEmpty(searchDto.Search))
    {
        query = query.Where(t => 
            EF.Functions.ILike(t.Title, $"%{searchDto.Search}%") ||
            EF.Functions.ILike(t.Description, $"%{searchDto.Search}%"));
    }

    // Apply sorting
    query = searchDto.SortBy?.ToLower() switch
    {
        "title" => searchDto.SortOrder == "desc" ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
        "duedate" => searchDto.SortOrder == "desc" ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
        "priority" => searchDto.SortOrder == "desc" ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
        _ => searchDto.SortOrder == "desc" ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
    };

    return await query
        .Skip((searchDto.Page - 1) * searchDto.Limit)
        .Take(searchDto.Limit)
        .ToListAsync();
}
```

## 📊 Monitoring & Logging

### Structured Logging
```csharp
public class RequestResponseLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestResponseLoggingMiddleware> _logger;

    public RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var requestBody = await GetRequestBodyAsync(context.Request);
        var originalBodyStream = context.Response.Body;

        using var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        var sw = Stopwatch.StartNew();
        await _next(context);
        sw.Stop();

        var responseBody = await GetResponseBodyAsync(context.Response);

        _logger.LogInformation(
            "HTTP {Method} {Path} => {StatusCode} in {ElapsedMs}ms",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            sw.ElapsedMilliseconds);

        await memoryStream.CopyToAsync(originalBodyStream);
    }
}
```

### Health Checks
```csharp
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddDbContext<TaskFlowDbContext>()
            .AddRedis(Configuration.GetConnectionString("Redis"))
            .AddUrlGroup(new Uri("https://api.external-service.com"), "External API");
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        });
    }
}
```

---

**Son Güncelleme**: 2024-12-19  
**Mimari Versiyon**: 1.0.0  
**Durum**: ✅ Production Ready 