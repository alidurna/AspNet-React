/*
 * CategoriesController.cs - Categories API Controller
 * ===================================================
 * 
 * Bu controller Categories entity'si için CRUD operations sağlar.
 * RESTful API design patterns kullanır.
 * 
 * HTTP METHODS & ENDPOINTS:
 * ========================
 * GET    /api/categories        -> Kullanıcının kategorilerini listele
 * GET    /api/categories/{id}   -> Belirli bir kategoriyi getir
 * POST   /api/categories        -> Yeni kategori oluştur
 * PUT    /api/categories/{id}   -> Kategoriyi tamamen güncelle
 * DELETE /api/categories/{id}   -> Kategoriyi sil (soft delete)
 * 
 * CONTROLLER PATTERN:
 * ==================
 * - Dependency Injection (DbContext)
 * - Model Binding & Validation
 * - HTTP Status Codes
 * - Error Handling
 * - Async/Await pattern
 * - Standardized API responses
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Controllers;

/// <summary>
/// Categories API Controller
/// Kategori yönetimi için RESTful API endpoints sağlar
/// </summary>
[ApiController]  // API Controller olduğunu belirtir (otomatik model validation vb.)
[Route("api/[controller]")]  // Route template: /api/categories
public class CategoriesController : ControllerBase
{
    // ===== DEPENDENCY INJECTION =====
    /// <summary>
    /// Entity Framework DbContext - Veritabanı işlemleri için
    /// Constructor injection ile DI container'dan gelir
    /// </summary>
    private readonly TaskFlowDbContext _context;

    /// <summary>
    /// Controller constructor
    /// Dependency Injection ile DbContext'i alır
    /// 
    /// DI CONTAINER otomatik olarak:
    /// - TaskFlowDbContext instance'ı oluşturur
    /// - Connection string'i configure eder
    /// - Scoped lifetime (HTTP request boyunca yaşar) sağlar
    /// </summary>
    /// <param name="context">EF Core DbContext</param>
    public CategoriesController(TaskFlowDbContext context)
    {
        _context = context;
    }

    // ===== GET /api/categories =====
    /// <summary>
    /// Kullanıcının kategorilerini listeler
    /// Query parameters ile filtreleme destekler
    /// 
    /// Örnek istekler:
    /// GET /api/categories
    /// GET /api/categories?isActive=true
    /// GET /api/categories?search=work&orderBy=name
    /// </summary>
    /// <param name="filter">Filtreleme parametreleri (query string'den gelir)</param>
    /// <returns>Kategoriler listesi</returns>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories(
        [FromQuery] CategoryFilterDto filter)
    {
        try
        {
            // ŞIMDILIK sabit kullanıcı ID'si (Authentication gelince değişecek)
            // JWT Authentication implement edilince: User.Identity.GetUserId()
            const int currentUserId = 1; // TODO: Replace with actual user from JWT

            // Base query - kullanıcının kategorileri
            var query = _context.Categories
                .Where(c => c.UserId == currentUserId);

            // ===== FILTERING =====
            // IsActive filter
            if (filter.IsActive.HasValue)
            {
                query = query.Where(c => c.IsActive == filter.IsActive.Value);
            }

            // Search filter (kategori adında arama)
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(c => c.Name.Contains(filter.Search));
            }

            // OnlyDefault filter
            if (filter.OnlyDefault.HasValue && filter.OnlyDefault.Value)
            {
                query = query.Where(c => c.IsDefault == true);
            }

            // ===== ORDERING =====
            // Sıralama (OrderBy parameter'ına göre)
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

            // ===== DATABASE QUERY EXECUTION =====
            // Include ile related tasks'ları getir (statistics için)
            var categories = await query
                .Include(c => c.Tasks.Where(t => t.IsActive)) // Sadece aktif task'lar
                .ToListAsync();

            // ===== DTO MAPPING =====
            // Entity'lerden DTO'lara çevir
            var categoryDtos = categories.Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ColorCode = category.ColorCode,
                Icon = category.Icon,
                IsActive = category.IsActive,
                IsDefault = category.IsDefault,
                // Computed properties (Tasks navigation property'sinden hesapla)
                TotalTaskCount = category.Tasks.Count,
                CompletedTaskCount = category.Tasks.Count(t => t.IsCompleted),
                PendingTaskCount = category.Tasks.Count(t => !t.IsCompleted),
                CompletionPercentage = category.Tasks.Count > 0 
                    ? Math.Round((decimal)category.Tasks.Count(t => t.IsCompleted) / category.Tasks.Count * 100, 1)
                    : 0,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            }).ToList();

            // ===== SUCCESS RESPONSE =====
            return Ok(ApiResponse<List<CategoryDto>>.CreateSuccess(
                categoryDtos, 
                $"{categoryDtos.Count} kategori bulundu"));
        }
        catch (Exception ex)
        {
            // ===== ERROR HANDLING =====
            // Production'da loglama yapılmalı
            // Development'ta detaylı hata göster
            return StatusCode(500, ApiResponse<List<CategoryDto>>.Error(
                "Kategoriler getirilirken bir hata oluştu", 
                ex.Message));
        }
    }

    // ===== GET /api/categories/{id} =====
    /// <summary>
    /// Belirli bir kategoriyi ID'sine göre getirir
    /// 
    /// Örnek istek: GET /api/categories/5
    /// </summary>
    /// <param name="id">Kategori ID'si</param>
    /// <returns>Kategori detayları</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(int id)
    {
        try
        {
            const int currentUserId = 1; // TODO: Replace with actual user from JWT

            // Kategoriyi bul (sadece kendi kategorileri)
            var category = await _context.Categories
                .Include(c => c.Tasks.Where(t => t.IsActive))
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == currentUserId);

            // ===== NOT FOUND CHECK =====
            if (category == null)
            {
                return NotFound(ApiResponse<CategoryDto>.Error("Kategori bulunamadı"));
            }

            // ===== DTO MAPPING =====
            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ColorCode = category.ColorCode,
                Icon = category.Icon,
                IsActive = category.IsActive,
                IsDefault = category.IsDefault,
                TotalTaskCount = category.Tasks.Count,
                CompletedTaskCount = category.Tasks.Count(t => t.IsCompleted),
                PendingTaskCount = category.Tasks.Count(t => !t.IsCompleted),
                CompletionPercentage = category.Tasks.Count > 0 
                    ? Math.Round((decimal)category.Tasks.Count(t => t.IsCompleted) / category.Tasks.Count * 100, 1)
                    : 0,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };

            return Ok(ApiResponse<CategoryDto>.CreateSuccess(categoryDto, "Kategori bulundu"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CategoryDto>.Error(
                "Kategori getirilirken bir hata oluştu", 
                ex.Message));
        }
    }

    // ===== POST /api/categories =====
    /// <summary>
    /// Yeni kategori oluşturur
    /// 
    /// Örnek istek body:
    /// {
    ///   "name": "İş",
    ///   "description": "İş ile ilgili görevler",
    ///   "colorCode": "#3498DB",
    ///   "icon": "fas fa-briefcase",
    ///   "isDefault": false
    /// }
    /// </summary>
    /// <param name="createDto">Yeni kategori bilgileri</param>
    /// <returns>Oluşturulan kategori</returns>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(
        [FromBody] CreateCategoryDto createDto)
    {
        try
        {
            // ===== MODEL VALIDATION =====
            // [Required], [StringLength] vb. attributes otomatik kontrol edilir
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CategoryDto>.ValidationError(ModelState));
            }

            const int currentUserId = 1; // TODO: Replace with actual user from JWT

            // ===== BUSINESS RULES VALIDATION =====
            
            // 1. Aynı isimde kategori var mı kontrol et
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.UserId == currentUserId && 
                                         c.Name == createDto.Name && 
                                         c.IsActive);

            if (existingCategory != null)
            {
                return BadRequest(ApiResponse<CategoryDto>.Error(
                    "Bu isimde bir kategori zaten mevcut"));
            }

            // 2. Maksimum kategori sayısı kontrolü
            var userCategoryCount = await _context.Categories
                .CountAsync(c => c.UserId == currentUserId && c.IsActive);

            const int maxCategoriesPerUser = 50; // Business rule
            if (userCategoryCount >= maxCategoriesPerUser)
            {
                return BadRequest(ApiResponse<CategoryDto>.Error(
                    $"Maksimum {maxCategoriesPerUser} kategori oluşturabilirsiniz"));
            }

            // ===== ENTITY CREATION =====
            var category = new Category
            {
                UserId = currentUserId,
                Name = createDto.Name,
                Description = createDto.Description,
                ColorCode = createDto.ColorCode ?? "#3498DB", // Default blue
                Icon = createDto.Icon,
                IsDefault = createDto.IsDefault,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // ===== DEFAULT CATEGORY LOGIC =====
            // Eğer bu kategori default olacaksa, diğer default'u false yap
            if (createDto.IsDefault)
            {
                var currentDefault = await _context.Categories
                    .FirstOrDefaultAsync(c => c.UserId == currentUserId && c.IsDefault && c.IsActive);

                if (currentDefault != null)
                {
                    currentDefault.IsDefault = false;
                    currentDefault.UpdatedAt = DateTime.UtcNow;
                }
            }

            // ===== DATABASE OPERATIONS =====
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // ===== RESPONSE DTO CREATION =====
            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ColorCode = category.ColorCode,
                Icon = category.Icon,
                IsActive = category.IsActive,
                IsDefault = category.IsDefault,
                TotalTaskCount = 0, // Yeni kategori, görev yok
                CompletedTaskCount = 0,
                PendingTaskCount = 0,
                CompletionPercentage = 0,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };

            // ===== SUCCESS RESPONSE =====
            // 201 Created status code ile response dön
            return CreatedAtAction(
                nameof(GetCategory), 
                new { id = category.Id }, 
                ApiResponse<CategoryDto>.CreateSuccess(categoryDto, "Kategori başarıyla oluşturuldu"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CategoryDto>.Error(
                "Kategori oluşturulurken bir hata oluştu", 
                ex.Message));
        }
    }

    // ===== PUT /api/categories/{id} =====
    /// <summary>
    /// Kategoriyi tamamen günceller
    /// 
    /// Örnek istek: PUT /api/categories/5
    /// </summary>
    /// <param name="id">Güncellenecek kategori ID'si</param>
    /// <param name="updateDto">Güncellenecek kategori bilgileri</param>
    /// <returns>Güncellenmiş kategori</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(
        int id, 
        [FromBody] UpdateCategoryDto updateDto)
    {
        try
        {
            // ===== MODEL VALIDATION =====
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<CategoryDto>.ValidationError(ModelState));
            }

            const int currentUserId = 1; // TODO: Replace with actual user from JWT

            // ===== FIND EXISTING CATEGORY =====
            var category = await _context.Categories
                .Include(c => c.Tasks.Where(t => t.IsActive))
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == currentUserId);

            if (category == null)
            {
                return NotFound(ApiResponse<CategoryDto>.Error("Kategori bulunamadı"));
            }

            // ===== BUSINESS RULES VALIDATION =====
            
            // Aynı isimde başka kategori var mı (kendisi hariç)
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.UserId == currentUserId && 
                                         c.Name == updateDto.Name && 
                                         c.Id != id &&
                                         c.IsActive);

            if (existingCategory != null)
            {
                return BadRequest(ApiResponse<CategoryDto>.Error(
                    "Bu isimde başka bir kategori zaten mevcut"));
            }

            // ===== UPDATE ENTITY =====
            category.Name = updateDto.Name;
            category.Description = updateDto.Description;
            category.ColorCode = updateDto.ColorCode ?? category.ColorCode;
            category.Icon = updateDto.Icon;
            category.IsActive = updateDto.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            // ===== DEFAULT CATEGORY LOGIC =====
            if (updateDto.IsDefault && !category.IsDefault)
            {
                // Bu kategori default olacaksa, diğer default'u false yap
                var currentDefault = await _context.Categories
                    .FirstOrDefaultAsync(c => c.UserId == currentUserId && c.IsDefault && c.Id != id);

                if (currentDefault != null)
                {
                    currentDefault.IsDefault = false;
                    currentDefault.UpdatedAt = DateTime.UtcNow;
                }

                category.IsDefault = true;
            }
            else if (!updateDto.IsDefault && category.IsDefault)
            {
                category.IsDefault = false;
            }

            // ===== DATABASE SAVE =====
            await _context.SaveChangesAsync();

            // ===== RESPONSE DTO =====
            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ColorCode = category.ColorCode,
                Icon = category.Icon,
                IsActive = category.IsActive,
                IsDefault = category.IsDefault,
                TotalTaskCount = category.Tasks.Count,
                CompletedTaskCount = category.Tasks.Count(t => t.IsCompleted),
                PendingTaskCount = category.Tasks.Count(t => !t.IsCompleted),
                CompletionPercentage = category.Tasks.Count > 0 
                    ? Math.Round((decimal)category.Tasks.Count(t => t.IsCompleted) / category.Tasks.Count * 100, 1)
                    : 0,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };

            return Ok(ApiResponse<CategoryDto>.CreateSuccess(categoryDto, "Kategori başarıyla güncellendi"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CategoryDto>.Error(
                "Kategori güncellenirken bir hata oluştu", 
                ex.Message));
        }
    }

    // ===== DELETE /api/categories/{id} =====
    /// <summary>
    /// Kategoriyi siler (soft delete)
    /// Kategoriye bağlı görevler varsa hata döner
    /// 
    /// Örnek istek: DELETE /api/categories/5
    /// </summary>
    /// <param name="id">Silinecek kategori ID'si</param>
    /// <returns>Silme işlemi sonucu</returns>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCategory(int id)
    {
        try
        {
            const int currentUserId = 1; // TODO: Replace with actual user from JWT

            // ===== FIND CATEGORY =====
            var category = await _context.Categories
                .Include(c => c.Tasks.Where(t => t.IsActive))
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == currentUserId);

            if (category == null)
            {
                return NotFound(ApiResponse<object>.Error("Kategori bulunamadı"));
            }

            // ===== BUSINESS RULES VALIDATION =====
            
            // 1. Kategoriye bağlı aktif görevler var mı kontrol et
            if (category.Tasks.Any())
            {
                return BadRequest(ApiResponse<object>.Error(
                    $"Bu kategoriye bağlı {category.Tasks.Count} aktif görev var. " +
                    "Önce görevleri başka kategoriye taşıyın veya silin."));
            }

            // 2. Default kategori silinemez
            if (category.IsDefault)
            {
                return BadRequest(ApiResponse<object>.Error(
                    "Varsayılan kategori silinemez. Önce başka bir kategoriyi varsayılan yapın."));
            }

            // ===== SOFT DELETE =====
            // Hard delete yerine soft delete (IsActive = false)
            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessMessage("Kategori başarıyla silindi"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Error(
                "Kategori silinirken bir hata oluştu", 
                ex.Message));
        }
    }
}

/*
 * CONTROLLER BEST PRACTICES UYGULAMASI:
 * =====================================
 * 
 * 1. ✅ Dependency Injection kullandık
 * 2. ✅ Async/Await pattern kullandık
 * 3. ✅ Proper HTTP status codes döndük
 * 4. ✅ Model validation yaptık
 * 5. ✅ Business rules validation yaptık
 * 6. ✅ Error handling implement ettik
 * 7. ✅ Standardized API responses kullandık
 * 8. ✅ DTO pattern uyguladık
 * 9. ✅ Soft delete kullandık
 * 10. ✅ Include ile related data getirdik
 * 
 * SONRAKI GELIŞTIRMELER:
 * =====================
 * 1. JWT Authentication (currentUserId)
 * 2. Logging (Serilog, NLog)
 * 3. Caching (Redis, Memory Cache)
 * 4. Rate Limiting
 * 5. API Versioning
 * 6. AutoMapper (DTO mapping için)
 * 7. FluentValidation (complex validation için)
 * 8. Unit Testing
 * 
 * HTTP STATUS CODES KULLANILAN:
 * ============================
 * - 200 OK: Başarılı GET, PUT
 * - 201 Created: Başarılı POST
 * - 400 Bad Request: Validation errors, business rule violations
 * - 404 Not Found: Resource bulunamadı
 * - 500 Internal Server Error: Beklenmeyen hatalar
 */ 