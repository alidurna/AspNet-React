using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Category yönetimi işlemleri implementation
    /// CRUD operasyonları, business rules ve category statistics işlemlerini yönetir
    /// </summary>
    public class CategoryService : ICategoryService
    {
        #region Private Fields

        private readonly TaskFlowDbContext _context;
        private readonly ILogger<CategoryService> _logger;
        private readonly IConfiguration _configuration;

        #endregion

        #region Constructor

        public CategoryService(
            TaskFlowDbContext context,
            ILogger<CategoryService> logger,
            IConfiguration configuration)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        #endregion

        #region CRUD Operations

        public async Task<CategoryDto> CreateCategoryAsync(int userId, CreateCategoryDto createDto)
        {
            try
            {
                _logger.LogInformation("Creating category for user {UserId}: {CategoryName}", userId, createDto.Name);

                // Kategori limit kontrolü
                if (!await CheckCategoryLimitAsync(userId))
                {
                    var maxCategories = _configuration.GetValue<int>("ApplicationSettings:BusinessRules:MaxCategoriesPerUser", 50);
                    throw new InvalidOperationException($"Maksimum kategori sayısı limitine ulaştınız ({maxCategories})");
                }

                // Kategori adı benzersizlik kontrolü
                if (!await IsCategoryNameUniqueAsync(userId, createDto.Name))
                {
                    throw new InvalidOperationException("Bu kategori adı zaten mevcut");
                }

                // Category entity oluştur
                var category = new Category
                {
                    UserId = userId,
                    Name = createDto.Name.Trim(),
                    Description = createDto.Description?.Trim(),
                    ColorCode = createDto.ColorCode?.Trim() ?? "#007bff",
                    Icon = createDto.Icon?.Trim(),
                    IsActive = true,
                    IsDefault = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Category created successfully: {CategoryId} for user {UserId}", category.Id, userId);

                return MapToDto(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<CategoryDto>> GetCategoriesAsync(int userId, CategoryFilterDto filter)
        {
            try
            {
                _logger.LogDebug("Getting categories for user {UserId} with filter", userId);

                var query = _context.Categories
                    .Include(c => c.Tasks.Where(t => t.IsActive))
                    .Where(c => c.UserId == userId);

                // Filtreleme
                if (filter.IsActive.HasValue)
                {
                    query = query.Where(c => c.IsActive == filter.IsActive.Value);
                }

                if (!string.IsNullOrWhiteSpace(filter.Search))
                {
                    var searchLower = filter.Search.ToLower();
                    query = query.Where(c => c.Name.ToLower().Contains(searchLower));
                }

                if (filter.OnlyDefault.HasValue && filter.OnlyDefault.Value)
                {
                    query = query.Where(c => c.IsDefault == true);
                }

                // Sıralama
                query = filter.OrderBy?.ToLower() switch
                {
                    "createdat" => filter.OrderDirection?.ToLower() == "desc" 
                        ? query.OrderByDescending(c => c.CreatedAt)
                        : query.OrderBy(c => c.CreatedAt),
                    "updatedat" => filter.OrderDirection?.ToLower() == "desc"
                        ? query.OrderByDescending(c => c.UpdatedAt)
                        : query.OrderBy(c => c.UpdatedAt),
                    _ => filter.OrderDirection?.ToLower() == "desc"
                        ? query.OrderByDescending(c => c.Name)
                        : query.OrderBy(c => c.Name)
                };

                var categories = await query.ToListAsync();

                return categories.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories for user {UserId}", userId);
                throw;
            }
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int userId, int categoryId)
        {
            try
            {
                var category = await _context.Categories
                    .Include(c => c.Tasks.Where(t => t.IsActive))
                    .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);

                return category != null ? MapToDto(category) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category {CategoryId} for user {UserId}", categoryId, userId);
                throw;
            }
        }

        public async Task<CategoryDto> UpdateCategoryAsync(int userId, int categoryId, UpdateCategoryDto updateDto)
        {
            try
            {
                _logger.LogInformation("Updating category {CategoryId} for user {UserId}", categoryId, userId);

                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);

                if (category == null)
                {
                    throw new InvalidOperationException("Kategori bulunamadı");
                }

                // Kategori adı benzersizlik kontrolü (güncelleme için)
                if (!string.IsNullOrWhiteSpace(updateDto.Name) && 
                    updateDto.Name.Trim() != category.Name &&
                    !await IsCategoryNameUniqueAsync(userId, updateDto.Name, categoryId))
                {
                    throw new InvalidOperationException("Bu kategori adı zaten mevcut");
                }

                // Güncelleme işlemleri
                if (!string.IsNullOrWhiteSpace(updateDto.Name))
                {
                    category.Name = updateDto.Name.Trim();
                }

                if (updateDto.Description != null)
                {
                    category.Description = string.IsNullOrWhiteSpace(updateDto.Description) 
                        ? null 
                        : updateDto.Description.Trim();
                }

                if (!string.IsNullOrWhiteSpace(updateDto.ColorCode))
                {
                    category.ColorCode = updateDto.ColorCode.Trim();
                }

                if (updateDto.Icon != null)
                {
                    category.Icon = string.IsNullOrWhiteSpace(updateDto.Icon) 
                        ? null 
                        : updateDto.Icon.Trim();
                }

                category.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Güncellenmiş kategoriyi task'larıyla birlikte yeniden yükle
                var updatedCategory = await _context.Categories
                    .Include(c => c.Tasks.Where(t => t.IsActive))
                    .FirstAsync(c => c.Id == categoryId);

                _logger.LogInformation("Category updated successfully: {CategoryId}", categoryId);

                return MapToDto(updatedCategory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {CategoryId} for user {UserId}", categoryId, userId);
                throw;
            }
        }

        public async Task<bool> DeleteCategoryAsync(int userId, int categoryId)
        {
            try
            {
                _logger.LogInformation("Deleting category {CategoryId} for user {UserId}", categoryId, userId);

                var category = await _context.Categories
                    .Include(c => c.Tasks)
                    .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);

                if (category == null)
                {
                    return false;
                }

                // Default kategori silinip silinemeyeceğini kontrol et
                if (!await CanCategoryBeDeletedAsync(categoryId))
                {
                    throw new InvalidOperationException("Default kategoriler silinemez");
                }

                // Soft delete - kategoriyi ve ilgili task'ları pasif yap
                category.IsActive = false;
                category.UpdatedAt = DateTime.UtcNow;

                // İlgili task'ları da soft delete yap
                foreach (var task in category.Tasks.Where(t => t.IsActive))
                {
                    task.IsActive = false;
                    task.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Category deleted successfully: {CategoryId}", categoryId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {CategoryId} for user {UserId}", categoryId, userId);
                throw;
            }
        }

        #endregion

        #region Validation & Business Rules

        public async Task<bool> IsCategoryNameUniqueAsync(int userId, string categoryName, int? excludeCategoryId = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(categoryName))
                    return false;

                var normalizedName = categoryName.Trim().ToLower();
                var query = _context.Categories
                    .Where(c => c.UserId == userId && 
                                c.IsActive && 
                                c.Name.ToLower() == normalizedName);

                if (excludeCategoryId.HasValue)
                {
                    query = query.Where(c => c.Id != excludeCategoryId.Value);
                }

                return !await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking category name uniqueness for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> CanCategoryBeDeletedAsync(int categoryId)
        {
            try
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == categoryId);

                if (category == null)
                    return false;

                // Default kategoriler silinemez
                return !category.IsDefault;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if category {CategoryId} can be deleted", categoryId);
                throw;
            }
        }

        public async Task<bool> CheckCategoryLimitAsync(int userId)
        {
            try
            {
                var maxCategories = _configuration.GetValue<int>("ApplicationSettings:BusinessRules:MaxCategoriesPerUser", 50);
                var currentCount = await _context.Categories
                    .CountAsync(c => c.UserId == userId && c.IsActive);

                return currentCount < maxCategories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking category limit for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Category Statistics

        public async Task<CategoryStatsDto> GetCategoryStatsAsync(int userId, int categoryId)
        {
            try
            {
                var category = await _context.Categories
                    .Include(c => c.Tasks.Where(t => t.IsActive))
                    .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);

                if (category == null)
                {
                    throw new InvalidOperationException("Kategori bulunamadı");
                }

                var totalTasks = category.Tasks.Count;
                var completedTasks = category.Tasks.Count(t => t.IsCompleted);
                var pendingTasks = totalTasks - completedTasks;
                var overdueTasks = category.Tasks.Count(t => 
                    !t.IsCompleted && 
                    t.DueDate.HasValue && 
                    t.DueDate.Value < DateTime.UtcNow);

                var stats = new CategoryStatsDto
                {
                    CategoryId = category.Id,
                    CategoryName = category.Name,
                    TotalTasks = totalTasks,
                    CompletedTasks = completedTasks,
                    PendingTasks = pendingTasks,
                    OverdueTasks = overdueTasks,
                    CompletionPercentage = totalTasks > 0 ? (decimal)completedTasks / totalTasks * 100 : 0,
                    LastTaskDate = category.Tasks.OrderByDescending(t => t.CreatedAt).FirstOrDefault()?.CreatedAt,
                    MostUsedPriority = category.Tasks
                        .GroupBy(t => t.Priority)
                        .OrderByDescending(g => g.Count())
                        .FirstOrDefault()?.Key
                };

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category stats for category {CategoryId}", categoryId);
                throw;
            }
        }

        public async Task<List<CategorySummaryDto>> GetCategorySummaryAsync(int userId)
        {
            try
            {
                var categories = await _context.Categories
                    .Include(c => c.Tasks.Where(t => t.IsActive))
                    .Where(c => c.UserId == userId && c.IsActive)
                    .ToListAsync();

                return categories.Select(category =>
                {
                    var totalTasks = category.Tasks.Count;
                    var completedTasks = category.Tasks.Count(t => t.IsCompleted);

                    return new CategorySummaryDto
                    {
                        Id = category.Id,
                        Name = category.Name,
                        ColorCode = category.ColorCode,
                        Icon = category.Icon,
                        TaskCount = totalTasks,
                        CompletionRate = totalTasks > 0 ? (decimal)completedTasks / totalTasks * 100 : 0
                    };
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category summary for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Helper Methods

        public CategoryDto MapToDto(Category category)
        {
            if (category == null)
                throw new ArgumentNullException(nameof(category));

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ColorCode = category.ColorCode,
                Icon = category.Icon,
                IsActive = category.IsActive,
                IsDefault = category.IsDefault,
                TotalTaskCount = category.Tasks?.Count ?? 0,
                CompletedTaskCount = category.Tasks?.Count(t => t.IsCompleted) ?? 0,
                PendingTaskCount = category.Tasks?.Count(t => !t.IsCompleted) ?? 0,
                CompletionPercentage = category.Tasks != null && category.Tasks.Count > 0
                    ? Math.Round((decimal)category.Tasks.Count(t => t.IsCompleted) / category.Tasks.Count * 100, 1)
                    : 0,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };
        }

        public async Task<List<CategoryDto>> CreateDefaultCategoriesAsync(int userId)
        {
            try
            {
                _logger.LogInformation("Creating default categories for user {UserId}", userId);

                var defaultCategories = new List<Category>
                {
                    new()
                    {
                        UserId = userId,
                        Name = "Genel",
                        Description = "Genel görevler için kategori",
                        ColorCode = "#007bff",
                        Icon = "📝",
                        IsActive = true,
                        IsDefault = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        UserId = userId,
                        Name = "İş",
                        Description = "İş ile ilgili görevler",
                        ColorCode = "#28a745",
                        Icon = "💼",
                        IsActive = true,
                        IsDefault = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        UserId = userId,
                        Name = "Kişisel",
                        Description = "Kişisel görevler ve hatırlatmalar",
                        ColorCode = "#17a2b8",
                        Icon = "👤",
                        IsActive = true,
                        IsDefault = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                _context.Categories.AddRange(defaultCategories);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Default categories created successfully for user {UserId}", userId);

                return defaultCategories.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating default categories for user {UserId}", userId);
                throw;
            }
        }

        #endregion
    }
} 