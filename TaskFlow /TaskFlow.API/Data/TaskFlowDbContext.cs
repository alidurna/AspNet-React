// ****************************************************************************************************
//  TASKFLOWDBCONTEXT.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının veritabanı yönetimi sisteminin ana DbContext sınıfıdır. Entity
//  Framework Core ile veritabanı işlemlerini, entity ilişkilerini, migration'ları ve business
//  rules'ları yönetir. Veritabanı ile uygulama arasındaki köprü görevi görür.
//
//  ANA BAŞLIKLAR:
//  - Entity Configuration ve Relationships
//  - Database Operations (CRUD)
//  - Change Tracking ve Auditing
//  - Business Rules Enforcement
//  - Migration Management
//  - Performance Optimization
//
//  GÜVENLİK:
//  - Data validation constraints
//  - Foreign key relationships
//  - Cascade delete rules
//  - Unique constraints
//  - Data integrity protection
//
//  HATA YÖNETİMİ:
//  - Entity validation
//  - Business rule validation
//  - Database constraint violations
//  - Transaction management
//  - Graceful error recovery
//
//  EDGE-CASE'LER:
//  - Circular references
//  - Orphaned records
//  - Constraint violations
//  - Large data sets
//  - Concurrent modifications
//  - Database connection failures
//  - Migration conflicts
//
//  YAN ETKİLER:
//  - Entity changes trigger validation
//  - Cascade operations affect related data
//  - Timestamp updates occur automatically
//  - Business rules affect data integrity
//  - Performance impacts from relationships
//
//  PERFORMANS:
//  - Efficient query optimization
//  - Relationship loading strategies
//  - Change tracking optimization
//  - Connection pooling
//  - Index management
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear entity relationships
//  - Comprehensive documentation
//  - Extensible model structure
//  - Migration-friendly design
//  - Configuration-based settings
// ****************************************************************************************************

using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Models;

namespace TaskFlow.API.Data;

/// <summary>
/// TaskFlow uygulamasının ana DbContext sınıfı
/// Veritabanı işlemlerini ve entity ilişkilerini yönetir
/// </summary>
public class TaskFlowDbContext : DbContext
{
    // ===== CONSTRUCTOR =====
    /// <summary>
    /// TaskFlowDbContext constructor
    /// Dependency Injection ile DbContextOptions geçirilir
    /// Base constructor'a options geçirilerek DbContext konfigüre edilir
    /// </summary>
    /// <param name="options">EF Core konfigürasyon seçenekleri (connection string vb.)</param>
    public TaskFlowDbContext(DbContextOptions<TaskFlowDbContext> options) : base(options)
    {
        // Base DbContext constructor'ına options geçiriyoruz
        // Bu options Program.cs'de dependency injection ile sağlanacak
    }

    // ===== DBSETS (VERİTABANI TABLOLARI) =====
    
    /// <summary>
    /// Users tablosu - Kullanıcı bilgileri
    /// DbSet<User>: User entity'si için CRUD işlemleri sağlar
    /// 
    /// Örnek kullanım:
    /// - Users.Add(newUser) -> Yeni kullanıcı ekle
    /// - Users.Where(u => u.Email == "test@test.com") -> Email ile ara
    /// - Users.Include(u => u.Tasks) -> İlişkili görevleri de getir
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;

    /// <summary>
    /// Categories tablosu - Görev kategorileri
    /// Her kullanıcının kendi kategorileri var
    /// 
    /// Örnek kullanım:
    /// - Categories.Where(c => c.UserId == userId) -> Kullanıcının kategorileri
    /// - Categories.Include(c => c.Tasks) -> Kategori ve görevleri
    /// </summary>
    public DbSet<Category> Categories { get; set; } = null!;

    /// <summary>
    /// TodoTasks tablosu - Görevler (ana entity)
    /// En karmaşık tablo - birden fazla foreign key içerir
    /// 
    /// Örnek kullanım:
    /// - TodoTasks.Include(t => t.User).Include(t => t.Category) -> İlişkilerle getir
    /// - TodoTasks.Where(t => t.IsCompleted == false) -> Tamamlanmamış görevler
    /// - TodoTasks.Include(t => t.SubTasks) -> Alt görevleri de getir
    /// </summary>
    public DbSet<TodoTask> TodoTasks { get; set; } = null!;

    /// <summary>
    /// Attachments tablosu - Görevlere eklenen dosyalar
    /// Her görevin birden fazla eki olabilir
    /// </summary>
    public DbSet<Attachment> Attachments { get; set; } = null!;

    /// <summary>
    /// WebAuthnCredentials tablosu - Biyometrik giriş kimlik bilgileri
    /// Her kullanıcının birden fazla biyometrik credential'ı olabilir
    /// </summary>
    public DbSet<WebAuthnCredential> WebAuthnCredentials { get; set; } = null!;

    // ===== MODEL YAPILANDIRMASI (FLUENT API) =====
    /// <summary>
    /// Model konfigürasyonu - Fluent API
    /// Bu method EF Core tarafından çağrılır ve veritabanı şemasını oluşturur
    /// 
    /// Burada yapılanlar:
    /// - İlişkileri (relationships) tanımlarız
    /// - Unique constraints ekleriz
    /// - Index'leri belirleriz
    /// - Property konfigürasyonları yaparız
    /// - Seeding (varsayılan veri) ekleriz
    /// </summary>
    /// <param name="modelBuilder">Model yapılandırma aracı</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.ProfileImage).HasMaxLength(500);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.LastLoginAt);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsEmailVerified).HasDefaultValue(false);
            entity.Property(e => e.EmailVerificationToken).HasMaxLength(500);
            entity.Property(e => e.PasswordResetToken).HasMaxLength(500);
            entity.Property(e => e.RefreshToken).HasMaxLength(500);

            entity.HasIndex(e => e.Email).IsUnique();

            // Kullanıcının oluşturduğu görevler
            entity.HasMany(e => e.Tasks)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Kullanıcıya atanan görevler
            entity.HasMany(e => e.AssignedTasks)
                .WithOne(t => t.AssignedUser)
                .HasForeignKey(t => t.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull); // Atanan kullanıcı silinirse görevi null yapar

            // Kullanıcının yüklediği ekler
            entity.HasMany(e => e.Attachments)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Kullanıcı silindiğinde ekleri tutarız
        });

        // TodoTask entity configuration
        modelBuilder.Entity<TodoTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Tags).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Progress).HasDefaultValue(0);
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);

            entity.HasOne(e => e.User)
                .WithMany(e => e.Tasks)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany(e => e.Tasks)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ParentTask)
                .WithMany(e => e.SubTasks)
                .HasForeignKey(e => e.ParentTaskId)
                .OnDelete(DeleteBehavior.SetNull);
            
            // Göreve ait ekler
            entity.HasMany(e => e.Attachments)
                .WithOne(a => a.TodoTask)
                .HasForeignKey(a => a.TodoTaskId)
                .OnDelete(DeleteBehavior.Cascade); // Görev silindiğinde ekleri de sileriz
            
            // Atanan kullanıcı ilişkisi (daha önce eklenen AssignedUser config'i ile çakışmaması için burada tekrar tanımlıyorum)
            entity.HasOne(e => e.AssignedUser)
                .WithMany(e => e.AssignedTasks)
                .HasForeignKey(e => e.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull); // Atanan kullanıcı silindiğinde null yap
        });

        // Category entity configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ColorCode).HasMaxLength(10);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.User)
                .WithMany(e => e.Categories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Attachment entity configuration
        modelBuilder.Entity<Attachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FileSize).IsRequired();
            entity.Property(e => e.UploadDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.User)
                .WithMany(e => e.Attachments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Kullanıcı silindiğinde ekleri tutarız

            entity.HasOne(e => e.TodoTask)
                .WithMany(e => e.Attachments)
                .HasForeignKey(e => e.TodoTaskId)
                .OnDelete(DeleteBehavior.Cascade); // Görev silindiğinde ekleri de sileriz
        });

        // WebAuthnCredential entity configuration
        modelBuilder.Entity<WebAuthnCredential>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.CredentialId).IsRequired().HasMaxLength(500);
            entity.Property(e => e.PublicKey).IsRequired();
            entity.Property(e => e.SignCount).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.Transports).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(e => e.User)
                .WithMany(e => e.WebAuthnCredentials)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CredentialId).IsUnique();
        });

        SeedData(modelBuilder); // Seed data çağrısı
    }

    /// <summary>
    /// Varsayılan veri ekleme (Seed Data)
    /// Şimdilik boş - register ile test kullanıcısı oluşturacağız
    /// </summary>
    /// <param name="modelBuilder">Model builder instance</param>
    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Şimdilik seed data yok - register ile kullanıcı oluşturacağız
    }

    // ===== SAVECHANGES OVERRIDE =====
    /// <summary>
    /// SaveChanges method'unu override ederek
    /// otomatik UpdatedAt güncelleme ve business rules uyguluyoruz
    /// 
    /// Bu method her veri değişikliğinde çalışır:
    /// - Add, Update, Delete işlemlerinde
    /// - Automatic auditing sağlar
    /// - Business rule validation yapar
    /// </summary>
    /// <returns>Etkilenen kayıt sayısı</returns>
    public override int SaveChanges()
    {
        // Değişen entity'leri bul ve UpdatedAt'i güncelle
        UpdateTimestamps();

        // Validation kurallarını çalıştır
        ValidateBusinessRules();

        // Actual save operation
        return base.SaveChanges();
    }

    /// <summary>
    /// Async SaveChanges - Performance için
    /// Modern uygulamalarda async/await pattern kullanılmalı
    /// </summary>
    /// <param name="cancellationToken">İptal token'ı</param>
    /// <returns>Etkilenen kayıt sayısı</returns>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        ValidateBusinessRules();
        
        return await base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Otomatik timestamp güncelleme
    /// Modified olan entity'lerin UpdatedAt field'ını günceller
    /// </summary>
    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified)
            .ToList();

        foreach (var entry in entries)
        {
            // UpdatedAt property'si varsa güncelle
            if (entry.Entity.GetType().GetProperty("UpdatedAt") != null)
            {
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
    }

    /// <summary>
    /// Business rule validation
    /// Veritabanına kaydetmeden önce business kurallarını kontrol eder
    /// </summary>
    private void ValidateBusinessRules()
    {
        var todoTasks = ChangeTracker.Entries<TodoTask>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified)
            .Select(e => e.Entity)
            .ToList();

        foreach (var task in todoTasks)
        {
            // Business Rule 1: ReminderDate DueDate'den önce olmalı
            if (task.ReminderDate.HasValue && task.DueDate.HasValue)
            {
                if (task.ReminderDate >= task.DueDate)
                {
                    throw new InvalidOperationException(
                        "Hatırlatma tarihi, bitiş tarihinden önce olmalıdır.");
                }
            }

            // Business Rule 2: StartDate DueDate'den önce olmalı
            if (task.StartDate.HasValue && task.DueDate.HasValue)
            {
                if (task.StartDate >= task.DueDate)
                {
                    throw new InvalidOperationException(
                        "Başlangıç tarihi, bitiş tarihinden önce olmalıdır.");
                }
            }

            // Business Rule 3: Tamamlanan görevlerin CompletedAt'i olmalı
            if (task.IsCompleted && !task.CompletedAt.HasValue)
            {
                task.CompletedAt = DateTime.UtcNow;
            }

            // Business Rule 4: Tamamlanmamış görevlerin CompletedAt'i olmamalı
            if (!task.IsCompleted && task.CompletedAt.HasValue)
            {
                task.CompletedAt = null;
            }
        }
    }
}

/*
 * SONRAKI ADIMLAR:
 * ================
 * 1. Program.cs'e DbContext'i dependency injection ile ekleyeceğiz
 * 2. Connection string yapılandırması yapacağız
 * 3. İlk migration'ı oluşturacağız
 * 4. Database'i güncelleyeceğiz
 * 5. Seed data ekleyeceğiz
 * 
 * EF CORE BEST PRACTICES:
 * =======================
 * - Async methods kullanın (SaveChangesAsync)
 * - Lazy loading dikkatli kullanın (N+1 query problemi)
 * - Include() ile eager loading yapın
 * - Index'leri performance için kullanın
 * - Connection pooling aktifleştirin
 * - Query filtering ile soft delete implement edin
 * 
 * MIGRATION KOMUTLARI:
 * ===================
 * - dotnet ef migrations add InitialCreate
 * - dotnet ef database update
 * - dotnet ef migrations remove (son migration'ı sil)
 * - dotnet ef database drop (database'i sil)
 * 
 * PERFORMANCE TIPS:
 * =================
 * - AsNoTracking() readonly sorgular için
 * - Pagination büyük veri setleri için
 * - Select() sadece ihtiyaç olan alanlar için
 * - SplitQuery complex includes için
 */ 