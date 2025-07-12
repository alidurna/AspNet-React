/**
 * ICategoryService Interface
 * 
 * Bu dosya, TaskFlow API'sinde kategori yönetimi işlemlerini tanımlayan
 * interface'i içerir. Kategori CRUD operasyonları, istatistikler ve
 * business rule validation'larını kapsayan kapsamlı bir servis sağlar.
 * 
 * Ana İşlevler:
 * - CRUD operasyonları (Create, Read, Update, Delete)
 * - Kategori istatistikleri
 * - Business rule validation
 * - Default kategori oluşturma
 * - Kategori özet bilgileri
 * 
 * CRUD Operations:
 * - CreateCategoryAsync: Yeni kategori oluşturma
 * - GetCategoriesAsync: Filtrelenmiş kategori listesi
 * - GetCategoryByIdAsync: Belirli kategori detayı
 * - UpdateCategoryAsync: Kategori güncelleme
 * - DeleteCategoryAsync: Kategori silme (soft delete)
 * 
 * Validation & Business Rules:
 * - IsCategoryNameUniqueAsync: Benzersiz isim kontrolü
 * - CanCategoryBeDeletedAsync: Silme izni kontrolü
 * - CheckCategoryLimitAsync: Kategori limit kontrolü
 * - Default kategori koruması
 * 
 * Category Statistics:
 * - GetCategoryStatsAsync: Detaylı kategori istatistikleri
 * - GetCategorySummaryAsync: Özet kategori bilgileri
 * - Task count tracking
 * - Completion rate calculation
 * - Priority distribution
 * 
 * Helper Methods:
 * - MapToDto: Entity to DTO mapping
 * - CreateDefaultCategoriesAsync: Default kategoriler
 * - Data transformation
 * - Business logic encapsulation
 * 
 * Default Categories:
 * - İş (Work)
 * - Kişisel (Personal)
 * - Sağlık (Health)
 * - Eğitim (Education)
 * - Projeler (Projects)
 * 
 * Performance:
 * - Efficient queries
 * - Caching support
 * - Pagination
 * - Optimized filtering
 * 
 * Security:
 * - User-based access control
 * - Data isolation
 * - Input validation
 * - SQL injection protection
 * 
 * Error Handling:
 * - Validation errors
 * - Business rule violations
 * - Database errors
 * - Graceful degradation
 * 
 * Monitoring:
 * - Category usage metrics
 * - Performance tracking
 * - Error monitoring
 * - Usage analytics
 * 
 * Sürdürülebilirlik:
 * - SOLID principles
 * - Dependency injection ready
 * - Testable design
 * - Clear separation of concerns
 * 
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// Category yönetimi işlemleri için service interface
    /// Business logic'i controller'dan ayırmak ve test edilebilirlik sağlamak için kullanılır
    /// </summary>
    public interface ICategoryService
    {
        #region CRUD Operations

        /// <summary>
        /// Yeni kategori oluşturur
        /// </summary>
        /// <param name="userId">Kategoriyi oluşturan kullanıcı ID</param>
        /// <param name="createDto">Kategori oluşturma bilgileri</param>
        /// <returns>Oluşturulan CategoryDto</returns>
        Task<CategoryDto> CreateCategoryAsync(int userId, CreateCategoryDto createDto);

        /// <summary>
        /// Kullanıcının kategorilerini listeler (filtreleme ile)
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="filter">Filtreleme parametreleri</param>
        /// <returns>Filtrelenmiş kategori listesi</returns>
        Task<List<CategoryDto>> GetCategoriesAsync(int userId, CategoryFilterDto filter);

        /// <summary>
        /// Belirli bir kategoriyi ID'sine göre getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="categoryId">Kategori ID</param>
        /// <returns>CategoryDto veya null</returns>
        Task<CategoryDto?> GetCategoryByIdAsync(int userId, int categoryId);

        /// <summary>
        /// Kategoriyi günceller
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="categoryId">Güncellenecek kategori ID</param>
        /// <param name="updateDto">Güncelleme bilgileri</param>
        /// <returns>Güncellenmiş CategoryDto</returns>
        Task<CategoryDto> UpdateCategoryAsync(int userId, int categoryId, UpdateCategoryDto updateDto);

        /// <summary>
        /// Kategoriyi siler (soft delete)
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="categoryId">Silinecek kategori ID</param>
        /// <returns>Silme işlemi başarılı mı</returns>
        Task<bool> DeleteCategoryAsync(int userId, int categoryId);

        #endregion

        #region Validation & Business Rules

        /// <summary>
        /// Kategori adının kullanıcı için benzersiz olup olmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="categoryName">Kontrol edilecek kategori adı</param>
        /// <param name="excludeCategoryId">Güncelleme sırasında hariç tutulacak kategori ID (opsiyonel)</param>
        /// <returns>True: kategori adı müsait, False: kategori adı zaten var</returns>
        Task<bool> IsCategoryNameUniqueAsync(int userId, string categoryName, int? excludeCategoryId = null);

        /// <summary>
        /// Kategorinin silinip silinemeyeceğini kontrol eder (default kategoriler silinemez)
        /// </summary>
        /// <param name="categoryId">Kategori ID</param>
        /// <returns>True: silinebilir, False: silinemez</returns>
        Task<bool> CanCategoryBeDeletedAsync(int categoryId);

        /// <summary>
        /// Kullanıcının kategori oluşturma limitini aşıp aşmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>True: limit aşılmamış, False: limit aşılmış</returns>
        Task<bool> CheckCategoryLimitAsync(int userId);

        #endregion

        #region Category Statistics

        /// <summary>
        /// Kategorinin task istatistiklerini getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="categoryId">Kategori ID</param>
        /// <returns>Kategori istatistikleri</returns>
        Task<CategoryStatsDto> GetCategoryStatsAsync(int userId, int categoryId);

        /// <summary>
        /// Kullanıcının tüm kategorilerinin özet istatistiklerini getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Kategori özet istatistikleri</returns>
        Task<List<CategorySummaryDto>> GetCategorySummaryAsync(int userId);

        #endregion

        #region Helper Methods

        /// <summary>
        /// Category entity'sini CategoryDto'ya çevirir
        /// </summary>
        /// <param name="category">Category entity</param>
        /// <returns>CategoryDto</returns>
        CategoryDto MapToDto(Category category);

        /// <summary>
        /// Kullanıcının default kategorilerini oluşturur (ilk kayıt sonrası)
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Oluşturulan default kategoriler</returns>
        Task<List<CategoryDto>> CreateDefaultCategoriesAsync(int userId);

        #endregion
    }

    /// <summary>
    /// Kategori istatistikleri DTO'su
    /// </summary>
    public class CategoryStatsDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public int OverdueTasks { get; set; }
        public decimal CompletionPercentage { get; set; }
        public DateTime? LastTaskDate { get; set; }
        public Priority? MostUsedPriority { get; set; }
    }

    /// <summary>
    /// Kategori özet bilgileri DTO'su
    /// </summary>
    public class CategorySummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ColorCode { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public int TaskCount { get; set; }
        public decimal CompletionRate { get; set; }
    }
} 