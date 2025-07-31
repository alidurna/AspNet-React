using TaskFlow.API.Models;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.API.Data
{
    /// <summary>
    /// Database'e test verisi eklemek için seed data sınıfı
    /// </summary>
    public static class SeedData
    {
        /// <summary>
        /// Database'e test verisi ekler
        /// </summary>
        /// <param name="context">Database context</param>
        public static async Task SeedAsync(TaskFlowDbContext context)
        {
                    // Test kullanıcısı oluştur
        var testUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "test@taskflow.com");
        if (testUser == null)
        {
            testUser = new User
            {
                Email = "test@taskflow.com",
                FirstName = "Test",
                LastName = "Kullanıcı",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), // Test şifresi
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(testUser);
            await context.SaveChangesAsync();
        }

        // Kategorileri ekle
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new Category { Name = "İş", Description = "İş ile ilgili görevler", ColorCode = "#3B82F6", UserId = testUser.Id },
                new Category { Name = "Kişisel", Description = "Kişisel görevler", ColorCode = "#10B981", UserId = testUser.Id },
                new Category { Name = "Eğitim", Description = "Eğitim ile ilgili görevler", ColorCode = "#F59E0B", UserId = testUser.Id },
                new Category { Name = "Sağlık", Description = "Sağlık ile ilgili görevler", ColorCode = "#EF4444", UserId = testUser.Id },
                new Category { Name = "Alışveriş", Description = "Alışveriş listesi", ColorCode = "#8B5CF6", UserId = testUser.Id }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

            // Test görevleri oluştur
            if (!await context.TodoTasks.AnyAsync())
            {
                var categories = await context.Categories.ToListAsync();
                var tasks = new List<TodoTask>
                {
                    new TodoTask
                    {
                        Title = "Proje raporunu tamamla",
                        Description = "Q1 proje raporunu hazırla ve yöneticiye gönder",
                        DueDate = DateTime.UtcNow.AddDays(3),
                        Priority = Priority.High,
                        Progress = 60,
                        CompletionPercentage = 60,
                        CategoryId = categories.FirstOrDefault(c => c.Name == "İş")?.Id,
                        UserId = testUser.Id,
                        User = testUser,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new TodoTask
                    {
                        Title = "Spor salonuna git",
                        Description = "Haftalık spor rutinini tamamla",
                        DueDate = DateTime.UtcNow.AddDays(1),
                        Priority = Priority.Normal,
                        Progress = 0,
                        CompletionPercentage = 0,
                        CategoryId = categories.FirstOrDefault(c => c.Name == "Sağlık")?.Id,
                        UserId = testUser.Id,
                        User = testUser,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new TodoTask
                    {
                        Title = "React öğren",
                        Description = "React hooks ve state management konularını çalış",
                        DueDate = DateTime.UtcNow.AddDays(7),
                        Priority = Priority.High,
                        Progress = 0,
                        CompletionPercentage = 0,
                        CategoryId = categories.FirstOrDefault(c => c.Name == "Eğitim")?.Id,
                        UserId = testUser.Id,
                        User = testUser,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new TodoTask
                    {
                        Title = "Market alışverişi",
                        Description = "Haftalık market listesini al",
                        DueDate = DateTime.UtcNow.AddDays(2),
                        Priority = Priority.Low,
                        Progress = 0,
                        CompletionPercentage = 0,
                        CategoryId = categories.FirstOrDefault(c => c.Name == "Alışveriş")?.Id,
                        UserId = testUser.Id,
                        User = testUser,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    },
                    new TodoTask
                    {
                        Title = "Kitap oku",
                        Description = "Günlük 30 dakika kitap okuma hedefini tamamla",
                        DueDate = DateTime.UtcNow,
                        Priority = Priority.Normal,
                        IsCompleted = true,
                        Progress = 100,
                        CompletionPercentage = 100,
                        CompletedAt = DateTime.UtcNow,
                        CategoryId = categories.FirstOrDefault(c => c.Name == "Kişisel")?.Id,
                        UserId = testUser.Id,
                        User = testUser,
                        CreatedAt = DateTime.UtcNow.AddDays(-7)
                    }
                };

                await context.TodoTasks.AddRangeAsync(tasks);
                await context.SaveChangesAsync();
            }
        }
    }
} 