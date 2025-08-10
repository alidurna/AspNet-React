using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;

namespace TaskFlow.Tests.Helpers;

/// <summary>
/// Test için in-memory database oluşturan factory sınıfı
/// Her test için izole database instance'ı sağlar
/// </summary>
public static class TestDbContextFactory
{
    /// <summary>
    /// Yeni bir in-memory database context'i oluşturur
    /// </summary>
    /// <param name="databaseName">Unique database adı</param>
    /// <returns>Test için hazır TaskFlowDbContext</returns>
    public static TaskFlowDbContext CreateInMemoryContext(string databaseName = "")
    {
        if (string.IsNullOrEmpty(databaseName))
        {
            databaseName = Guid.NewGuid().ToString();
        }

        var options = new DbContextOptionsBuilder<TaskFlowDbContext>()
            .UseInMemoryDatabase(databaseName: databaseName)
            .Options;

        var context = new TaskFlowDbContext(options);
        
        // Her test için temiz database
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
        
        return context;
    }

    /// <summary>
    /// Test verileri ile dolu database context'i oluşturur
    /// </summary>
    /// <param name="databaseName">Unique database adı</param>
    /// <returns>Test verileri ile dolu context</returns>
    public static TaskFlowDbContext CreateContextWithTestData(string databaseName = "")
    {
        var context = CreateInMemoryContext(databaseName);
        SeedTestData(context);
        return context;
    }

    /// <summary>
    /// Test verileri ekler
    /// </summary>
    /// <param name="context">Database context</param>
    private static void SeedTestData(TaskFlowDbContext context)
    {
        // Test kullanıcıları
        var testUsers = new List<User>
        {
            new User
            {
                Id = 1,
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                PasswordHash = "$2a$11$TestHashedPassword123456789012345678901234567890123456789",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = DateTime.UtcNow.AddDays(-1),
                IsActive = true
            },
            new User
            {
                Id = 2,
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@example.com",
                PasswordHash = "$2a$11$AdminHashedPassword123456789012345678901234567890123456789",
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                UpdatedAt = DateTime.UtcNow.AddDays(-2),
                IsActive = true
            }
        };

        // Test kategorileri
        var testCategories = new List<Category>
        {
            new Category
            {
                Id = 1,
                UserId = 1,
                Name = "İş",
                Description = "İş ile ilgili görevler",
                ColorCode = "#007bff",
                Icon = "💼",
                IsActive = true,
                IsDefault = true,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Category
            {
                Id = 2,
                UserId = 1,
                Name = "Kişisel",
                Description = "Kişisel görevler",
                ColorCode = "#28a745",
                Icon = "🏠",
                IsActive = true,
                IsDefault = false,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Category
            {
                Id = 3,
                UserId = 2,
                Name = "Admin Kategorisi",
                Description = "Admin görevleri",
                ColorCode = "#dc3545",
                Icon = "⚙️",
                IsActive = true,
                IsDefault = true,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        // Test görevleri
        var testTasks = new List<TodoTask>
        {
            new TodoTask
            {
                Id = 1,
                UserId = 1,
                CategoryId = 1,
                Title = "API Dokümantasyonu",
                Description = "RESTful API için dokümantasyon hazırla",
                Priority = Priority.High,
                CompletionPercentage = 75,
                DueDate = DateTime.UtcNow.AddDays(7),
                StartDate = DateTime.UtcNow.AddDays(-3),
                IsCompleted = false,
                IsActive = true,
                Tags = "api,documentation,high-priority",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                UpdatedAt = DateTime.UtcNow.AddDays(-1),
                User = testUsers[0] // Required User property'si set edildi
            },
            new TodoTask
            {
                Id = 2,
                UserId = 1,
                CategoryId = 1,
                ParentTaskId = 1,
                Title = "Swagger UI Kurulumu",
                Description = "API dokümantasyonu için Swagger UI kurulumu",
                Priority = Priority.Normal,
                CompletionPercentage = 100,
                DueDate = DateTime.UtcNow.AddDays(5),
                IsCompleted = true,
                CompletedAt = DateTime.UtcNow.AddDays(-2),
                IsActive = true,
                Tags = "swagger,setup,completed",
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                UpdatedAt = DateTime.UtcNow.AddDays(-2),
                User = testUsers[0] // Required User property'si set edildi
            },
            new TodoTask
            {
                Id = 3,
                UserId = 1,
                CategoryId = 2,
                Title = "Alışveriş Listesi",
                Description = "Haftalık alışveriş listesi hazırla",
                Priority = Priority.Low,
                CompletionPercentage = 0,
                DueDate = DateTime.UtcNow.AddDays(2),
                IsCompleted = false,
                IsActive = true,
                Tags = "shopping,personal,weekly",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-1),
                User = testUsers[0] // Required User property'si set edildi
            },
            new TodoTask
            {
                Id = 4,
                UserId = 2,
                CategoryId = 3,
                Title = "Sistem Bakımı",
                Description = "Sunucu bakımı ve güncelleme",
                Priority = Priority.Critical,
                CompletionPercentage = 25,
                DueDate = DateTime.UtcNow.AddDays(1),
                IsCompleted = false,
                IsActive = true,
                Tags = "maintenance,server,critical",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow,
                User = testUsers[1] // Required User property'si set edildi
            },
            new TodoTask
            {
                Id = 5,
                UserId = 1,
                CategoryId = 1,
                Title = "Gecikmiş Görev",
                Description = "Bu görev süresi geçmiş",
                Priority = Priority.High,
                CompletionPercentage = 60,
                DueDate = DateTime.UtcNow.AddDays(-5), // Geçmiş tarih
                IsCompleted = false,
                IsActive = true,
                Tags = "overdue,delayed",
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-10),
                User = testUsers[0] // Required User property'si set edildi
            }
        };

        // Verileri context'e ekle
        context.Users.AddRange(testUsers);
        context.Categories.AddRange(testCategories);
        context.TodoTasks.AddRange(testTasks);

        // Değişiklikleri kaydet
        context.SaveChanges();
    }
} 