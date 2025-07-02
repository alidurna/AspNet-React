/*
 * TaskFlowDbContext.cs - Entity Framework DbContext Sınıfı
 * ========================================================
 * 
 * Bu sınıf Entity Framework Core'un kalbidir.
 * Veritabanı ile uygulama arasındaki köprü görevi görür.
 * 
 * DBCONTEXT NE YAPAR:
 * ===================
 * - Model sınıflarını veritabanı tablolarına çevirir
 * - CRUD işlemlerini yönetir (Create, Read, Update, Delete)
 * - Change tracking yapar (hangi entity'ler değişmiş)
 * - Migration'ları destekler
 * - İlişkileri (relationships) yönetir
 * - Database connection'ı sağlar
 * 
 * DBSET'LER:
 * ==========
 * Her DbSet<T> bir veritabanı tablosunu temsil eder
 * LINQ sorguları DbSet'ler üzerinde çalışır
 * 
 * FLUENT API:
 * ===========
 * OnModelCreating method'unda Fluent API ile:
 * - İlişkileri tanımlarız
 * - Constraints ekleriz
 * - Index'leri belirleriz
 * - Naming conventions'ı override ederiz
 */

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
        // Base method'u çağır (standart konfigürasyonlar için)
        base.OnModelCreating(modelBuilder);

        // ===== USER ENTITY KONFIGÜRASYONU =====
        ConfigureUser(modelBuilder);

        // ===== CATEGORY ENTITY KONFIGÜRASYONU =====
        ConfigureCategory(modelBuilder);

        // ===== TODOTASK ENTITY KONFIGÜRASYONU =====
        ConfigureTodoTask(modelBuilder);

        // ===== SEED DATA (VARSAYILAN VERİLER) =====
        SeedData(modelBuilder);
    }

    /// <summary>
    /// User entity konfigürasyonu
    /// Unique constraints, indexes ve property ayarları
    /// </summary>
    /// <param name="modelBuilder">Model builder instance</param>
    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        // User tablosu konfigürasyonu
        modelBuilder.Entity<User>(entity =>
        {
            // ===== TABLE NAME =====
            // Tablo adını açıkça belirle (convention: "Users")
            entity.ToTable("Users");

            // ===== PRIMARY KEY =====
            // Primary key zaten convention'la belirlendi (Id property)
            entity.HasKey(u => u.Id);

            // ===== UNIQUE CONSTRAINTS =====
            // Email adresi unique olmalı (aynı email ile iki kullanıcı olamaz)
            entity.HasIndex(u => u.Email)
                  .IsUnique()
                  .HasDatabaseName("IX_Users_Email_Unique");

            // ===== PROPERTY CONFIGURATIONS =====
            // Email property için ek konfigürasyonlar
            entity.Property(u => u.Email)
                  .IsRequired()           // NOT NULL
                  .HasMaxLength(256);     // VARCHAR(256)

            // FirstName konfigürasyonu
            entity.Property(u => u.FirstName)
                  .IsRequired()
                  .HasMaxLength(100);

            // LastName konfigürasyonu
            entity.Property(u => u.LastName)
                  .IsRequired()
                  .HasMaxLength(100);

            // PasswordHash konfigürasyonu
            entity.Property(u => u.PasswordHash)
                  .IsRequired()
                  .HasMaxLength(256);

            // Optional fields (nullable)
            entity.Property(u => u.ProfileImageUrl)
                  .HasMaxLength(500);

            entity.Property(u => u.Bio)
                  .HasMaxLength(1000);

            // ===== DATETIME CONFIGURATIONS =====
            // DateTime fields için timezone ve default value ayarları
            entity.Property(u => u.CreatedAt)
                  .IsRequired()
                  .HasDefaultValueSql("CURRENT_TIMESTAMP"); // SQLite için

            entity.Property(u => u.UpdatedAt)
                  .IsRequired();

            // ===== COMPUTED PROPERTIES IGNORE =====
            // NotMapped properties'i ignore et (veritabanına map edilmesin)
            entity.Ignore(u => u.FullName);
            entity.Ignore(u => u.TotalTaskCount);
            entity.Ignore(u => u.CompletedTaskCount);
        });
    }

    /// <summary>
    /// Category entity konfigürasyonu
    /// Foreign key ilişkileri ve business rules
    /// </summary>
    /// <param name="modelBuilder">Model builder instance</param>
    private static void ConfigureCategory(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            // ===== TABLE NAME =====
            entity.ToTable("Categories");

            // ===== PRIMARY KEY =====
            entity.HasKey(c => c.Id);

            // ===== FOREIGN KEY RELATIONSHIPS =====
            // Category -> User ilişkisi (Many-to-One)
            entity.HasOne(c => c.User)                    // Her kategorinin bir User'ı var
                  .WithMany(u => u.Categories)            // Her User'ın birden fazla Category'si var
                  .HasForeignKey(c => c.UserId)           // Foreign key: UserId
                  .OnDelete(DeleteBehavior.Cascade);      // User silinirse categoriler de silinir

            // ===== UNIQUE CONSTRAINTS =====
            // Kategori adı kullanıcı bazında unique olmalı
            // Aynı kullanıcının iki aynı isimli kategorisi olamaz
            entity.HasIndex(c => new { c.UserId, c.Name })
                  .IsUnique()
                  .HasDatabaseName("IX_Categories_UserId_Name_Unique");

            // ===== PROPERTY CONFIGURATIONS =====
            entity.Property(c => c.Name)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(c => c.Description)
                  .HasMaxLength(500);

            // Color code validation - HEX format
            entity.Property(c => c.ColorCode)
                  .IsRequired()
                  .HasMaxLength(7)
                  .HasDefaultValue("#3498DB");  // Default blue

            entity.Property(c => c.Icon)
                  .HasMaxLength(50);

            // ===== DATETIME CONFIGURATIONS =====
            entity.Property(c => c.CreatedAt)
                  .IsRequired()
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(c => c.UpdatedAt)
                  .IsRequired();

            // ===== COMPUTED PROPERTIES IGNORE =====
            entity.Ignore(c => c.TotalTaskCount);
            entity.Ignore(c => c.CompletedTaskCount);
            entity.Ignore(c => c.PendingTaskCount);
            entity.Ignore(c => c.CompletionPercentage);
        });
    }

    /// <summary>
    /// TodoTask entity konfigürasyonu
    /// En karmaşık entity - multiple foreign keys ve self-reference
    /// </summary>
    /// <param name="modelBuilder">Model builder instance</param>
    private static void ConfigureTodoTask(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TodoTask>(entity =>
        {
            // ===== TABLE NAME =====
            entity.ToTable("TodoTasks");

            // ===== PRIMARY KEY =====
            entity.HasKey(t => t.Id);

            // ===== FOREIGN KEY RELATIONSHIPS =====
            
            // TodoTask -> User ilişkisi (Many-to-One)
            entity.HasOne(t => t.User)
                  .WithMany(u => u.Tasks)
                  .HasForeignKey(t => t.UserId)
                  .OnDelete(DeleteBehavior.Cascade);      // User silinirse task'lar da silinir

            // TodoTask -> Category ilişkisi (Many-to-One)
            entity.HasOne(t => t.Category)
                  .WithMany(c => c.Tasks)
                  .HasForeignKey(t => t.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);     // Category silinmeye çalışılırsa hata ver
                                                          // Önce task'lar başka kategoriye taşınmalı

            // ===== SELF-REFERENCE RELATIONSHIP =====
            // TodoTask -> ParentTask ilişkisi (Self-Reference)
            // Ana görev -> Alt görevler hiyerarşisi
            entity.HasOne(t => t.ParentTask)              // Her task'ın bir parent'ı olabilir
                  .WithMany(t => t.SubTasks)              // Her task'ın birden fazla child'ı olabilir
                  .HasForeignKey(t => t.ParentTaskId)     // Foreign key: ParentTaskId
                  .OnDelete(DeleteBehavior.SetNull);      // Parent silinirse child'lar independent olur

            // ===== PROPERTY CONFIGURATIONS =====
            
            // Core task properties
            entity.Property(t => t.Title)
                  .IsRequired()
                  .HasMaxLength(200);

            entity.Property(t => t.Description)
                  .HasMaxLength(2000);

            // Priority enum - integer olarak saklanır
            entity.Property(t => t.Priority)
                  .IsRequired()
                  .HasConversion<int>();        // Enum'u int'e çevir

            // Optional datetime fields
            entity.Property(t => t.DueDate)
                  .IsRequired(false);           // Nullable

            entity.Property(t => t.ReminderDate)
                  .IsRequired(false);

            entity.Property(t => t.StartDate)
                  .IsRequired(false);

            entity.Property(t => t.CompletedAt)
                  .IsRequired(false);

            // Additional features
            entity.Property(t => t.Tags)
                  .HasMaxLength(500);

            entity.Property(t => t.Notes)
                  .HasMaxLength(1000);

            // ===== DATETIME CONFIGURATIONS =====
            entity.Property(t => t.CreatedAt)
                  .IsRequired()
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(t => t.UpdatedAt)
                  .IsRequired();

            // ===== INDEXES FOR PERFORMANCE =====
            // Sık kullanılan sorgular için index'ler

            // User'ın task'larını getirmek için
            entity.HasIndex(t => t.UserId)
                  .HasDatabaseName("IX_TodoTasks_UserId");

            // Category'nin task'larını getirmek için
            entity.HasIndex(t => t.CategoryId)
                  .HasDatabaseName("IX_TodoTasks_CategoryId");

            // Tamamlanmamış task'ları bulmak için
            entity.HasIndex(t => t.IsCompleted)
                  .HasDatabaseName("IX_TodoTasks_IsCompleted");

            // Due date'e göre sıralama için
            entity.HasIndex(t => t.DueDate)
                  .HasDatabaseName("IX_TodoTasks_DueDate");

            // Priority'ye göre sıralama için
            entity.HasIndex(t => t.Priority)
                  .HasDatabaseName("IX_TodoTasks_Priority");

            // Parent-child ilişkisi için
            entity.HasIndex(t => t.ParentTaskId)
                  .HasDatabaseName("IX_TodoTasks_ParentTaskId");

            // ===== COMPUTED PROPERTIES IGNORE =====
            entity.Ignore(t => t.IsOverdue);
            entity.Ignore(t => t.DaysSinceCreated);
            entity.Ignore(t => t.TimeRemaining);
            entity.Ignore(t => t.SubTaskCount);
            entity.Ignore(t => t.CompletedSubTaskCount);
            entity.Ignore(t => t.ActualCompletionPercentage);
            entity.Ignore(t => t.TagList);
        });
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