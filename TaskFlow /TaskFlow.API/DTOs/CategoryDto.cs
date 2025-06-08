/*
 * CategoryDto.cs - Category Data Transfer Objects
 * ==============================================
 * 
 * DTO (Data Transfer Object) Pattern:
 * - API'den dönen verinin formatını kontrol eder
 * - Internal model'ları dış dünyadan gizler
 * - Version compatibility sağlar
 * - Security (sensitive field'ları gizleme)
 * - Validation rules (input validation)
 * 
 * NEDEN DTO KULLANIYORUZ:
 * ======================
 * 1. Separation of Concerns: API contract vs Database model
 * 2. Security: Password hash gibi alanları gizleyebiliriz
 * 3. Performance: Sadece gerekli alanları döneriz
 * 4. Versioning: API versiyonları arasında compatibility
 * 5. Validation: Input validation rules
 */

using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs;

/// <summary>
/// Category bilgilerini API'den dönerken kullanılan DTO
/// GET /api/categories endpoint'inden döner
/// 
/// Bu DTO sadece READ operations için kullanılır
/// Computed properties ve navigation properties içerir
/// </summary>
public class CategoryDto
{
    /// <summary>
    /// Kategori ID'si - Primary key
    /// Frontend'de routing ve state management için kullanılır
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Kategori adı
    /// UI'da gösterilecek ana text
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kategori açıklaması (opsiyonel)
    /// Tooltip veya description area'da gösterilebilir
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Kategori renk kodu (HEX format)
    /// UI'da kategori badge'leri için kullanılır
    /// Örnek: "#3498DB", "#E74C3C"
    /// </summary>
    public string ColorCode { get; set; } = string.Empty;

    /// <summary>
    /// Kategori ikonu (CSS class veya icon name)
    /// Font Awesome, Material Icons vb. için
    /// Örnek: "fas fa-briefcase", "work_outline"
    /// </summary>
    public string? Icon { get; set; }

    /// <summary>
    /// Kategorinin aktif olup olmadığı
    /// Soft delete pattern için kullanılır
    /// false olsa da database'de kalır, sadece UI'da gösterilmez
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Varsayılan kategori mi?
    /// Kullanıcının default kategorisi (ilk kurulumda)
    /// Her kullanıcının bir tane default kategorisi olur
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Bu kategorideki toplam görev sayısı
    /// Dashboard'da istatistik göstermek için
    /// Computed property - database'de tutulmaz
    /// </summary>
    public int TotalTaskCount { get; set; }

    /// <summary>
    /// Bu kategorideki tamamlanan görev sayısı
    /// Progress tracking için kullanılır
    /// </summary>
    public int CompletedTaskCount { get; set; }

    /// <summary>
    /// Bu kategorideki bekleyen görev sayısı
    /// TotalTaskCount - CompletedTaskCount
    /// </summary>
    public int PendingTaskCount { get; set; }

    /// <summary>
    /// Tamamlanma yüzdesi (0-100)
    /// Progress bar'lar için kullanılır
    /// Math.Round((CompletedTaskCount / TotalTaskCount) * 100, 1)
    /// </summary>
    public decimal CompletionPercentage { get; set; }

    /// <summary>
    /// Kategori oluşturulma tarihi
    /// Sorting ve filtering için kullanılır
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Son güncellenme tarihi
    /// Cache invalidation için kullanılabilir
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Yeni kategori oluşturmak için kullanılan DTO
/// POST /api/categories endpoint'ine gönderilir
/// 
/// Bu DTO sadece WRITE operations için kullanılır
/// Validation attributes içerir
/// </summary>
public class CreateCategoryDto
{
    /// <summary>
    /// Kategori adı (zorunlu)
    /// Minimum 2, maksimum 100 karakter
    /// </summary>
    [Required(ErrorMessage = "Kategori adı zorunludur")]
    [StringLength(100, MinimumLength = 2, 
        ErrorMessage = "Kategori adı 2-100 karakter arasında olmalıdır")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kategori açıklaması (opsiyonel)
    /// Maksimum 500 karakter
    /// </summary>
    [StringLength(500, ErrorMessage = "Açıklama maksimum 500 karakter olabilir")]
    public string? Description { get; set; }

    /// <summary>
    /// Kategori renk kodu (opsiyonel)
    /// HEX format validation (#RRGGBB)
    /// Girilmezse default blue (#3498DB) kullanılır
    /// </summary>
    [RegularExpression(@"^#([A-Fa-f0-9]{6})$", 
        ErrorMessage = "Renk kodu geçerli HEX formatında olmalıdır (örn: #3498DB)")]
    public string? ColorCode { get; set; }

    /// <summary>
    /// Kategori ikonu (opsiyonel)
    /// CSS class name veya icon identifier
    /// </summary>
    [StringLength(50, ErrorMessage = "İkon maksimum 50 karakter olabilir")]
    public string? Icon { get; set; }

    /// <summary>
    /// Bu kategori varsayılan kategori olsun mu?
    /// Default: false
    /// Eğer true ise, kullanıcının mevcut default kategorisi false yapılır
    /// </summary>
    public bool IsDefault { get; set; } = false;
}

/// <summary>
/// Kategori güncellemek için kullanılan DTO
/// PUT /api/categories/{id} endpoint'ine gönderilir
/// 
/// CreateCategoryDto'ya benzer ama ID içermez (URL'de gelir)
/// Partial update için PATCH method da eklenebilir
/// </summary>
public class UpdateCategoryDto
{
    /// <summary>
    /// Güncellenecek kategori adı
    /// Validation rules CreateCategoryDto ile aynı
    /// </summary>
    [Required(ErrorMessage = "Kategori adı zorunludur")]
    [StringLength(100, MinimumLength = 2, 
        ErrorMessage = "Kategori adı 2-100 karakter arasında olmalıdır")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Güncellenecek açıklama
    /// </summary>
    [StringLength(500, ErrorMessage = "Açıklama maksimum 500 karakter olabilir")]
    public string? Description { get; set; }

    /// <summary>
    /// Güncellenecek renk kodu
    /// </summary>
    [RegularExpression(@"^#([A-Fa-f0-9]{6})$", 
        ErrorMessage = "Renk kodu geçerli HEX formatında olmalıdır (örn: #3498DB)")]
    public string? ColorCode { get; set; }

    /// <summary>
    /// Güncellenecek ikon
    /// </summary>
    [StringLength(50, ErrorMessage = "İkon maksimum 50 karakter olabilir")]
    public string? Icon { get; set; }

    /// <summary>
    /// Kategorinin aktiflik durumu
    /// Soft delete için kullanılır
    /// false yapılırsa kategori deaktive olur
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Varsayılan kategori durumu
    /// </summary>
    public bool IsDefault { get; set; } = false;
}

/// <summary>
/// Kategoriler için liste filtreleme parametreleri
/// GET /api/categories?isActive=true&search=work query parameters
/// 
/// Bu DTO query string'den gelen filtreleme parametrelerini alır
/// </summary>
public class CategoryFilterDto
{
    /// <summary>
    /// Sadece aktif kategorileri getir
    /// ?isActive=true
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Kategori adında arama
    /// ?search=work -> Name.Contains("work")
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Sıralama kriteri
    /// ?orderBy=name, ?orderBy=createdAt
    /// </summary>
    public string? OrderBy { get; set; } = "name";

    /// <summary>
    /// Sıralama yönü
    /// ?orderDirection=desc
    /// </summary>
    public string? OrderDirection { get; set; } = "asc";

    /// <summary>
    /// Sadece varsayılan kategorileri getir
    /// ?onlyDefault=true
    /// </summary>
    public bool? OnlyDefault { get; set; }
}

/*
 * DTO MAPPING ÖRNEKLERİ:
 * ======================
 * 
 * 1. Entity'den DTO'ya mapping (AutoMapper kullanılabilir):
 * 
 * var categoryDto = new CategoryDto
 * {
 *     Id = category.Id,
 *     Name = category.Name,
 *     Description = category.Description,
 *     ColorCode = category.ColorCode,
 *     Icon = category.Icon,
 *     IsActive = category.IsActive,
 *     IsDefault = category.IsDefault,
 *     TotalTaskCount = category.TotalTaskCount,
 *     CompletedTaskCount = category.CompletedTaskCount,
 *     PendingTaskCount = category.PendingTaskCount,
 *     CompletionPercentage = category.CompletionPercentage,
 *     CreatedAt = category.CreatedAt,
 *     UpdatedAt = category.UpdatedAt
 * };
 * 
 * 2. CreateCategoryDto'dan Entity'ye mapping:
 * 
 * var category = new Category
 * {
 *     UserId = currentUserId, // Authentication'dan gelir
 *     Name = createDto.Name,
 *     Description = createDto.Description,
 *     ColorCode = createDto.ColorCode ?? "#3498DB",
 *     Icon = createDto.Icon,
 *     IsDefault = createDto.IsDefault,
 *     IsActive = true,
 *     CreatedAt = DateTime.UtcNow,
 *     UpdatedAt = DateTime.UtcNow
 * };
 * 
 * VALIDATION KULLANIMI:
 * ====================
 * 
 * Controller'da otomatik validation:
 * 
 * [HttpPost]
 * public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto createDto)
 * {
 *     if (!ModelState.IsValid)
 *     {
 *         return BadRequest(ApiResponse<CategoryDto>.ValidationError(ModelState));
 *     }
 *     
 *     // Business logic...
 * }
 * 
 * FRONTEND KULLANIMI:
 * ==================
 * 
 * // TypeScript interface'leri
 * interface CategoryDto {
 *     id: number;
 *     name: string;
 *     description?: string;
 *     colorCode: string;
 *     icon?: string;
 *     isActive: boolean;
 *     isDefault: boolean;
 *     totalTaskCount: number;
 *     completedTaskCount: number;
 *     pendingTaskCount: number;
 *     completionPercentage: number;
 *     createdAt: string;
 *     updatedAt: string;
 * }
 * 
 * interface CreateCategoryDto {
 *     name: string;
 *     description?: string;
 *     colorCode?: string;
 *     icon?: string;
 *     isDefault?: boolean;
 * }
 */ 