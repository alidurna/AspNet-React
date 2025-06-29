/*
 * Program.cs - ASP.NET Core Application Entry Point
 * ================================================
 * 
 * Bu dosya uygulamanın başlangıç noktasıdır ve modern C# top-level statements kullanır.
 * Burada yapılan işlemler:
 * 
 * 1. SERVICE REGISTRATION (Dependency Injection Container)
 * 2. MIDDLEWARE PIPELINE CONFIGURATION
 * 3. DATABASE CONFIGURATION
 * 4. APPLICATION STARTUP
 */

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskFlow.API.Data;
using TaskFlow.API.Services;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Extensions;
using Asp.Versioning;

// ===== WEB APPLICATION BUILDER =====
/*
 * WebApplication.CreateBuilder() modern ASP.NET Core'un başlangıç noktasıdır.
 * Bu method:
 * - Host configuration yapar
 * - Service container'ı hazırlar
 * - Configuration sources'ları ekler (appsettings.json, environment variables vb.)
 * - Logging configuration yapar
 */
var builder = WebApplication.CreateBuilder(args);

// ===== CONFIGURATION =====
/*
 * Configuration sistem appsettings.json, environment variables,
 * command line arguments gibi kaynaklardan configuration okur.
 * 
 * Öncelik sırası:
 * 1. Command line arguments (en yüksek)
 * 2. Environment variables
 * 3. appsettings.{Environment}.json
 * 4. appsettings.json (en düşük)
 */
var configuration = builder.Configuration;

// ===== SERVICE REGISTRATION (DEPENDENCY INJECTION) =====
/*
 * ASP.NET Core'un built-in Dependency Injection container'ına
 * servisleri kaydettiğimiz bölüm.
 * 
 * Service Lifetimes:
 * - Singleton: Uygulama boyunca tek instance
 * - Scoped: HTTP request boyunca tek instance (EF DbContext için ideal)
 * - Transient: Her injection'da yeni instance
 */

// ===== CORS CONFIGURATION =====
/*
 * CORS (Cross-Origin Resource Sharing) ayarları
 * Frontend (React) ile Backend (ASP.NET Core) arasındaki iletişim için gerekli
 */
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React development server
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ===== API CONTROLLERS =====
/*
 * AddControllers() method'u:
 * - MVC Controller pattern'ını aktifleştirir
 * - API Controller attributes'larını tanır
 * - Model binding ve validation yapar
 * - JSON serialization konfigüre eder
 */
builder.Services.AddControllers(options =>
{
    // Global Validation Action Filter'ı tüm controller'lara ekle
    options.Filters.Add<TaskFlow.API.Middleware.GlobalValidationActionFilter>();
})
.ConfigureApiBehaviorOptions(options =>
{
    // [ApiController] attribute'unun otomatik model validation'ını devre dışı bırak
    // Bizim GlobalValidationActionFilter'ımız validation'ı handle edecek
    options.SuppressModelStateInvalidFilter = true;
});

// ===== ENTITY FRAMEWORK CORE =====
/*
 * AddDbContext<T>() method'u:
 * - DbContext'i DI container'a kaydeder
 * - Scoped lifetime kullanır (HTTP request boyunca yaşar)
 * - Database provider'ı konfigüre eder
 * - Connection string'i ayarlar
 */
builder.Services.AddDbContext<TaskFlowDbContext>(options =>
{
    // SQLite database kullanıyoruz (development için ideal)
    // Production'da SQL Server, PostgreSQL vb. kullanılabilir
    var connectionString = configuration.GetConnectionString("DefaultConnection") 
                          ?? "Data Source=TaskFlow.db";
    
    /*
     * UseSqlite() method'u:
     * - SQLite provider'ını aktifleştirir
     * - Connection string'i ayarlar
     * - SQLite-specific konfigürasyonları yapar
     * 
     * SQLite AVANTAJLARI:
     * - Dosya tabanlı (kolay deployment)
     * - Zero-configuration
     * - Development için mükemmel
     * - Cross-platform
     * 
     * SQLite KISITLAMALARI:
     * - Concurrent writes sınırlı
     * - Büyük ölçekli uygulamalar için uygun değil
     * - Advanced features eksik (stored procedures vb.)
     */
    options.UseSqlite(connectionString);
    
    /*
     * DEVELOPMENT ORTAMI İÇİN EK AYARLAR:
     * EnableSensitiveDataLogging(): SQL log'larında parameter değerlerini gösterir
     * EnableDetailedErrors(): Hata mesajlarında daha detaylı bilgi verir
     * 
     * ÖNEMLİ: Bu ayarlar sadece development'ta kullanılmalı!
     * Production'da güvenlik riski oluşturur.
     */
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();   // SQL parameters'ı log'la
        options.EnableDetailedErrors();         // Detaylı hata mesajları
    }
});

// ===== JWT AUTHENTICATION SERVICES =====
/*
 * JWT (JSON Web Token) authentication servisleri.
 * Bu servisler kullanıcı authentication ve authorization için kullanılır.
 * 
 * JWT AVANTAJLARI:
 * - Stateless (server-side session yok)
 * - Scalable (multiple server'larda çalışır)
 * - Cross-platform (mobile, web, desktop)
 * - Self-contained (user info token içinde)
 */

// ===== CUSTOM SERVICES REGISTRATION =====
/*
 * Uygulama seviyesindeki custom service'leri DI container'a kaydet.
 * Service implementation'ları dependency sırasına göre kaydedilir.
 */

// JWT Service - Authentication için gerekli
builder.Services.AddScoped<IJwtService, JwtService>();

// Password Service - Şifre hash'leme ve validation için
builder.Services.AddScoped<IPasswordService, PasswordService>();

// User Service - Kullanıcı yönetimi ve authentication için
builder.Services.AddScoped<IUserService, UserService>();

// Category Service - Kategori yönetimi için
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Task Service - Görev yönetimi için
builder.Services.AddScoped<ITaskService, TaskService>();

// JWT Authentication configuration
builder.Services.AddAuthentication(options =>
{
    // Default authentication scheme JWT Bearer olsun
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // JWT validation parameters
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Token'ı kim oluşturdu kontrolü (issuer validation)
        ValidateIssuer = true,
        ValidIssuer = configuration["Jwt:Issuer"],
        
        // Token kim için oluşturuldu kontrolü (audience validation)
        ValidateAudience = true,
        ValidAudience = configuration["Jwt:Audience"],
        
        // Token'ın süresi dolmuş mu kontrolü
        ValidateLifetime = true,
        
        // Token imzası geçerli mi kontrolü
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not found"))
        ),
        
        // Clock skew - server saatleri arasındaki fark toleransı
        ClockSkew = TimeSpan.Zero // Sıfır tolerans
    };
    
    // JWT Bearer events - debugging ve logging için
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            // Token başarıyla validate edildiğinde
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Token validated for user: {UserId}", 
                context.Principal?.FindFirst("sub")?.Value);
            return Task.CompletedTask;
        },
        
        OnAuthenticationFailed = context =>
        {
            // Token validation başarısız olduğunda
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("Token validation failed: {Error}", context.Exception.Message);
            return Task.CompletedTask;
        },
        
        OnChallenge = context =>
        {
            // Unauthorized response dönülürken
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("JWT Challenge triggered for path: {Path}", context.Request.Path);
            return Task.CompletedTask;
        }
    };
});

// Authorization servisleri
builder.Services.AddAuthorization();

// ===== API DOCUMENTATION (SWAGGER/OPENAPI) =====
/*
 * Swagger/OpenAPI documentation için gerekli servisler.
 * Bu servisler API'mizi dokümante eder ve test etmemizi sağlar.
 * 
 * AddEndpointsApiExplorer(): Minimal API endpoints'lerini keşfeder
 * AddSwaggerGen(): Swagger UI ve OpenAPI spec'i üretir
 */
builder.Services.AddEndpointsApiExplorer();

// ===== API VERSIONING =====
/*
 * API versioning servisleri - RESTful API versioning desteği
 * Farklı versioning stratejileri desteklenir:
 * - URL Path: /api/v1/users, /api/v2/users
 * - Query String: /api/users?version=1.0
 * - Header: X-Version: 1.0
 * - Media Type: Accept: application/json;version=1.0
 */
builder.Services.AddApiVersioning(options =>
{
    // Default API version ayarla
    options.DefaultApiVersion = new ApiVersion(1, 0); // v1.0
    
    // Version belirtilmediğinde default version kullan
    options.AssumeDefaultVersionWhenUnspecified = true;
    
    // Versioning okuma stratejileri (birden fazla aktif olabilir)
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),    // /api/v1/users
        new QueryStringApiVersionReader(),   // ?version=1.0
        new HeaderApiVersionReader("X-Version") // X-Version: 1.0
    );
    
    // Desteklenen versiyonları response header'ında belirt
    options.ReportApiVersions = true;
})
.AddMvc() // MVC Controller desteği ekle
.AddApiExplorer(options =>
{
    // API Explorer configuration - Swagger için gerekli
    // Version format: 'v'major[.minor][-status]
    options.GroupNameFormat = "'v'VVV"; // v1.0, v2.0 format
    
    // Otomatik olarak deprecated version'ları belirt
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddSwaggerGen(options =>
{
    // API metadata
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "TaskFlow API",
        Version = "v1.0",
        Description = "Modern ASP.NET Core 9 Görev Yönetimi REST API'si",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "TaskFlow Development Team",
            Email = "dev@taskflow.com"
        },
        License = new Microsoft.OpenApi.Models.OpenApiLicense
        {
            Name = "MIT License",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });
    
    // JWT Authentication için Swagger UI'da authorize butonu ekle
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
    });
    
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    
    // XML documentation include et (eğer varsa)
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// ===== CORS (CROSS-ORIGIN RESOURCE SHARING) =====
/*
 * Frontend (React) ile backend (ASP.NET Core) arasında
 * cross-origin requests'lere izin vermek için CORS ayarları.
 * 
 * Bu ayarlar production'da daha kısıtlayıcı olmalı!
 */
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000") // React dev server
              .AllowAnyMethod()          // GET, POST, PUT, DELETE vb.
              .AllowAnyHeader()          // Content-Type, Authorization vb.
              .AllowCredentials();       // Cookies ve authentication headers
    });
});

// ===== WEB APPLICATION BUILD =====
/*
 * builder.Build() method'u:
 * - Service container'ı finalize eder
 * - WebApplication instance'ı oluşturur
 * - Middleware pipeline'ını hazırlar
 */
var app = builder.Build();

// ===== DATABASE MIGRATION CHECK =====
/*
 * Uygulama başlarken database'in güncel olup olmadığını kontrol et.
 * Eğer pending migration'lar varsa otomatik olarak uygula.
 * 
 * Bu approach development için uygundur.
 * Production'da manual migration tercih edilir.
 */
await EnsureDatabaseUpdated(app);

// ===== MIDDLEWARE PIPELINE CONFIGURATION =====
/*
 * Middleware'ler HTTP request pipeline'ını oluşturur.
 * Her middleware bir sonrakine request'i geçirir.
 * 
 * MIDDLEWARE SIRASI ÖNEMLİDİR!
 * Request: Yukarıdan aşağıya
 * Response: Aşağıdan yukarıya
 */

// ===== GLOBAL EXCEPTION HANDLER =====
/*
 * Global exception handler middleware - EN BAŞTA OLMALI!
 * Tüm unhandled exception'ları yakalar ve standart response döndürür
 * Development/Production ortamına göre farklı detay seviyeleri
 */
app.UseGlobalExceptionHandler();

// ===== REQUEST/RESPONSE LOGGING =====
/*
 * Request/Response logging middleware HTTP isteklerini ve yanıtlarını loglar.
 * Performance monitoring ve debugging için kullanılır.
 * Global exception handler'dan sonra çalışmalıdır.
 */
app.UseRequestResponseLogging();

// ===== DEVELOPMENT MIDDLEWARE =====
/*
 * Development ortamında ek middleware'ler aktifleştirilir:
 * - Swagger UI (API documentation)
 * - Developer exception page (detaylı hata sayfaları)
 */
if (app.Environment.IsDevelopment())
{
    // Swagger UI - API documentation ve test arayüzü
    app.UseSwagger();       // OpenAPI JSON endpoint'i
    app.UseSwaggerUI();     // Swagger UI web interface
}

// ===== HTTPS REDIRECTION =====
/*
 * HTTP isteklerini otomatik olarak HTTPS'e yönlendirir.
 * Güvenlik için kritik bir middleware.
 */
app.UseHttpsRedirection();

// ===== CORS MIDDLEWARE =====
/*
 * CORS policy'sini uygular.
 * OPTIONS requests'leri handle eder.
 * Frontend'den gelen cross-origin requests'lere izin verir.
 */
app.UseCors("AllowReactApp");

// ===== GLOBAL VALIDATION =====
/*
 * Global validation middleware model validation'ı centralize eder.
 * Controller'larda manuel ModelState kontrolü yapmaya gerek kalmaz.
 * Authentication'dan önce çalışmalıdır çünkü validation auth gerektirmez.
 */
app.UseGlobalValidation();

// ===== AUTHENTICATION & AUTHORIZATION =====
/*
 * Authentication ve authorization middleware'leri.
 * Bu middleware'ler JWT token'ları validate eder ve kullanıcı yetkilerini kontrol eder.
 * 
 * ÖNEMLİ: Sıralama kritik!
 * 1. UseAuthentication() - Token validation
 * 2. UseAuthorization() - Permission checking
 */
app.UseAuthentication();    // JWT token validation
app.UseAuthorization();     // Role/policy based authorization

// ===== CONTROLLER ROUTING =====
/*
 * MapControllers(): Controller'ları route'lar.
 * Attribute routing kullanır ([Route], [HttpGet] vb.)
 */
app.MapControllers();

// ===== ROOT ENDPOINT =====
/*
 * Ana endpoint - API'nin çalıştığını gösterir.
 * Health check olarak da kullanılabilir.
 */
app.MapGet("/", () => new
{
    Message = "TaskFlow API is running! 🚀",
    Version = "1.0.0",
    Environment = app.Environment.EnvironmentName,
    Timestamp = DateTime.UtcNow
});

// ===== APPLICATION START =====
/*
 * Uygulamayı başlat ve HTTP requests'leri dinlemeye başla.
 * Bu method blocking'dir - uygulama burada çalışmaya devam eder.
 */
app.Run();

// ===== HELPER METHODS =====
/*
 * Database migration'ları kontrol eden ve uygulayan helper method.
 * Bu method uygulama başlarken çalışır.
 */
async Task EnsureDatabaseUpdated(WebApplication webApp)
{
    try
    {
        // Service scope oluştur (DbContext almak için)
        using var scope = webApp.Services.CreateScope();
        
        // DbContext'i DI container'dan al
        var context = scope.ServiceProvider.GetRequiredService<TaskFlowDbContext>();
        
        /*
         * Database.EnsureCreated() vs Database.Migrate():
         * 
         * EnsureCreated():
         * - Database yoksa oluşturur
         * - Migration history kullanmaz
         * - Development için uygundur
         * 
         * Migrate():
         * - Pending migration'ları uygular
         * - Migration history tutar
         * - Production için uygundur
         */
        
        // Pending migration'ları kontrol et
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        
        if (pendingMigrations.Any())
        {
            Console.WriteLine($"🔄 Applying {pendingMigrations.Count()} pending migration(s)...");
            
            // Migration'ları uygula
            await context.Database.MigrateAsync();
            
            Console.WriteLine("✅ Database migrations applied successfully!");
        }
        else
        {
            Console.WriteLine("✅ Database is up to date.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database migration error: {ex.Message}");
        
        // Development'ta hatayı göster, production'da log'la
        if (webApp.Environment.IsDevelopment())
        {
            throw; // Uygulamayı durdur
        }
        else
        {
            // Production'da log'la ama uygulamayı başlat
            // Logger implementation burada olacak
        }
    }
}

/*
 * SONRAKI ADIMLAR:
 * ================
 * 1. appsettings.json'a connection string ekleyeceğiz
 * 2. İlk migration'ı oluşturacağız
 * 3. Database'i güncelleyeceğiz
 * 4. Controller'ları oluşturacağız
 * 5. JWT Authentication ekleyeceğiz
 * 
 * PRODUCTION HAZIRLIK:
 * ===================
 * - Environment-specific configuration
 * - Proper error handling ve logging
 * - Health checks
 * - Rate limiting
 * - API versioning
 * - Caching strategies
 * - Performance monitoring
 * 
 * GÜVENLİK ÖNLEMLERİ:
 * ===================
 * - HTTPS enforcement
 * - JWT authentication
 * - Input validation
 * - SQL injection prevention (EF Core otomatik sağlar)
 * - XSS protection
 * - CSRF protection
 */
