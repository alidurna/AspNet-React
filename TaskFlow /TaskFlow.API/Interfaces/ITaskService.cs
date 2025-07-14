/**
 * ITaskService Interface
 * 
 * Bu dosya, görev (TodoTask) yönetimi işlemlerini tanımlayan kapsamlı
 * interface'i içerir. CRUD operasyonları, hiyerarşik yapı yönetimi,
 * arama/filtreleme ve istatistik işlemlerini kapsar.
 * 
 * Ana İşlevler:
 * - CRUD operasyonları (Create, Read, Update, Delete)
 * - Hiyerarşik task yapısı (parent-child ilişkileri)
 * - Task tamamlama ve ilerleme takibi
 * - Arama ve filtreleme işlemleri
 * - İstatistik ve raporlama
 * - Business rule validation
 * 
 * CRUD Operations:
 * - CreateTaskAsync: Yeni task oluşturma
 * - GetTasksAsync: Filtrelenmiş task listesi
 * - GetTaskByIdAsync: Belirli task detayı
 * - UpdateTaskAsync: Task güncelleme
 * - DeleteTaskAsync: Task silme (soft delete)
 * 
 * Hierarchy Management:
 * - GetSubTasksAsync: Alt task'ları listeleme
 * - SetParentTaskAsync: Parent-child ilişkisi kurma
 * - RemoveParentTaskAsync: Parent ilişkisini kaldırma
 * - CheckTaskDepthLimitAsync: Derinlik limiti kontrolü
 * - CheckCircularReferenceAsync: Döngüsel referans kontrolü
 * 
 * Task Completion:
 * - CompleteTaskAsync: Task tamamlama/geri alma
 * - UpdateTaskProgressAsync: İlerleme yüzdesi güncelleme
 * 
 * Search & Filter:
 * - SearchTasksAsync: Metin bazlı arama
 * - GetOverdueTasksAsync: Vadesi geçmiş task'lar
 * - GetTasksDueTodayAsync: Bugün vadesi gelenler
 * - GetTasksDueThisWeekAsync: Bu hafta vadesi gelenler
 * 
 * Statistics:
 * - GetTaskStatsAsync: Genel istatistikler
 * - GetTaskStatsByCategoryAsync: Kategori bazlı istatistikler
 * - GetTaskPriorityStatsAsync: Öncelik bazlı dağılım
 * 
 * Business Rules:
 * - Task limit kontrolleri
 * - Derinlik limiti (maksimum 5 seviye)
 * - Döngüsel referans koruması
 * - Silme işlemi güvenliği
 * 
 * Performance:
 * - Async/await pattern
 * - Efficient pagination
 * - Optimized queries
 * - Caching strategies
 * 
 * Security:
 * - User-based access control
 * - Data isolation
 * - Input validation
 * - SQL injection protection
 * 
 * Sürdürülebilirlik:
 * - SOLID principles
 * - Comprehensive documentation
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
    /// TodoTask yönetimi işlemleri için service interface
    /// Business logic'i controller'dan ayırmak ve test edilebilirlik sağlamak için kullanılır
    /// </summary>
    public interface ITaskService
    {
        #region CRUD Operations

        /// <summary>
        /// Yeni task oluşturur
        /// </summary>
        /// <param name="userId">Task'ı oluşturan kullanıcı ID</param>
        /// <param name="createDto">Task oluşturma bilgileri</param>
        /// <returns>Oluşturulan TodoTaskDto</returns>
        Task<TodoTaskDto> CreateTaskAsync(int userId, CreateTodoTaskDto createDto);

        /// <summary>
        /// Kullanıcının task'larını listeler (filtreleme ve pagination ile)
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="filter">Filtreleme ve pagination parametreleri</param>
        /// <returns>Filtrelenmiş task listesi ve pagination bilgileri</returns>
        Task<(List<TodoTaskDto> Tasks, PaginationInfo Pagination)> GetTasksAsync(int userId, TodoTaskFilterDto filter);

        /// <summary>
        /// Belirli bir task'ı ID'sine göre getirir (sub-task'lar dahil)
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="includeSubTasks">Sub-task'ları dahil et</param>
        /// <returns>TodoTaskDto veya null</returns>
        Task<TodoTaskDto?> GetTaskByIdAsync(int userId, int taskId, bool includeSubTasks = false);

        /// <summary>
        /// Task'ı günceller
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="taskId">Güncellenecek task ID</param>
        /// <param name="updateDto">Güncelleme bilgileri</param>
        /// <returns>Güncellenmiş TodoTaskDto</returns>
        Task<TodoTaskDto> UpdateTaskAsync(int userId, int taskId, UpdateTodoTaskDto updateDto);

        /// <summary>
        /// Task'ı siler (soft delete) - sub-task'ları da siler
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="taskId">Silinecek task ID</param>
        /// <returns>Silme işlemi başarılı mı</returns>
        Task<bool> DeleteTaskAsync(int userId, int taskId);

        #endregion

        #region Task Completion Operations

        /// <summary>
        /// Task'ı tamamlar veya tamamlamayı geri alır
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="completeDto">Tamamlama bilgileri</param>
        /// <returns>Güncellenmiş TodoTaskDto</returns>
        Task<TodoTaskDto> CompleteTaskAsync(int userId, int taskId, CompleteTaskDto completeDto);

        /// <summary>
        /// Task'ın tamamlanma yüzdesini günceller
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="completionPercentage">Tamamlanma yüzdesi (0-100)</param>
        /// <returns>Güncellenmiş TodoTaskDto</returns>
        Task<TodoTaskDto> UpdateTaskProgressAsync(int userId, int taskId, int completionPercentage);

        #endregion

        #region Hierarchy Operations

        /// <summary>
        /// Ana task'ın alt task'larını getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="parentTaskId">Ana task ID</param>
        /// <returns>Alt task listesi</returns>
        Task<List<TodoTaskDto>> GetSubTasksAsync(int userId, int parentTaskId);

        /// <summary>
        /// Task'ı başka bir task'ın alt task'ı yapar
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="taskId">Alt task olacak task ID</param>
        /// <param name="parentTaskId">Ana task ID</param>
        /// <returns>Güncellenmiş TodoTaskDto</returns>
        Task<TodoTaskDto> SetParentTaskAsync(int userId, int taskId, int parentTaskId);

        /// <summary>
        /// Task'ın parent ilişkisini kaldırır
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="taskId">Task ID</param>
        /// <returns>Güncellenmiş TodoTaskDto</returns>
        Task<TodoTaskDto> RemoveParentTaskAsync(int userId, int taskId);

        #endregion

        #region Search & Filter Operations

        /// <summary>
        /// Task'ları arama metnine göre arar
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="searchText">Arama metni</param>
        /// <param name="maxResults">Maksimum sonuç sayısı</param>
        /// <returns>Arama sonuçları</returns>
        Task<List<TodoTaskDto>> SearchTasksAsync(int userId, string searchText, int maxResults = 50);

        /// <summary>
        /// Vadesi geçmiş task'ları getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Vadesi geçmiş task listesi</returns>
        Task<List<TodoTaskDto>> GetOverdueTasksAsync(int userId);

        /// <summary>
        /// Bugün vadesi gelen task'ları getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Bugün vadesi gelen task listesi</returns>
        Task<List<TodoTaskDto>> GetTasksDueTodayAsync(int userId);

        /// <summary>
        /// Bu hafta vadesi gelen task'ları getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Bu hafta vadesi gelen task listesi</returns>
        Task<List<TodoTaskDto>> GetTasksDueThisWeekAsync(int userId);

        #endregion

        #region Validation & Business Rules

        /// <summary>
        /// Task'ın maksimum derinlik limitini aşıp aşmadığını kontrol eder
        /// </summary>
        /// <param name="parentTaskId">Ana task ID</param>
        /// <returns>True: limit aşılmamış, False: limit aşılmış</returns>
        Task<bool> CheckTaskDepthLimitAsync(int parentTaskId);

        /// <summary>
        /// Circular reference oluşup oluşmayacağını kontrol eder
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="newParentId">Yeni parent task ID</param>
        /// <returns>True: circular reference yok, False: circular reference var</returns>
        Task<bool> CheckCircularReferenceAsync(int taskId, int newParentId);

        /// <summary>
        /// Kullanıcının task oluşturma limitini aşıp aşmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>True: limit aşılmamış, False: limit aşılmış</returns>
        Task<bool> CheckTaskLimitAsync(int userId);

        /// <summary>
        /// Task'ın silinip silinemeyeceğini kontrol eder (alt task'ları varsa uyarı)
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <returns>Silme durumu bilgileri</returns>
        Task<TaskDeletionCheckDto> CheckTaskDeletionAsync(int taskId);

        #endregion

        #region Statistics Operations

        /// <summary>
        /// Kullanıcının task istatistiklerini getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Task istatistikleri</returns>
        Task<TaskStatsDto> GetTaskStatsAsync(int userId);

        /// <summary>
        /// Kategoriye göre task istatistiklerini getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="categoryId">Kategori ID</param>
        /// <returns>Kategori bazlı task istatistikleri</returns>
        Task<TaskStatsDto> GetTaskStatsByCategoryAsync(int userId, int categoryId);

        /// <summary>
        /// Priority'ye göre task dağılımını getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Priority bazlı task dağılımı</returns>
        Task<List<TaskPriorityStatsDto>> GetTaskPriorityStatsAsync(int userId);

        /// <summary>
        /// Belirtilen görevleri toplu olarak siler.
        /// </summary>
        /// <param name="userId">İşlemi yapan kullanıcının ID'si.</param>
        /// <param name="taskIds">Silinecek görev ID'lerinin listesi.</param>
        /// <returns>Silinen görev sayısı.</returns>
        Task<int> BulkDeleteTasksAsync(int userId, List<int> taskIds);

        /// <summary>
        /// Belirtilen görevleri toplu olarak tamamlar.
        /// </summary>
        /// <param name="userId">İşlemi yapan kullanıcının ID'si.</param>
        /// <param name="taskIds">Tamamlanacak görev ID'lerinin listesi.</param>
        /// <returns>Tamamlanan görev sayısı.</returns>
        Task<int> BulkCompleteTasksAsync(int userId, List<int> taskIds);

        #endregion

        #region Helper Methods

        /// <summary>
        /// TodoTask entity'sini TodoTaskDto'ya çevirir
        /// </summary>
        /// <param name="task">TodoTask entity</param>
        /// <param name="includeSubTasks">Sub-task'ları dahil et</param>
        /// <returns>TodoTaskDto</returns>
        Task<TodoTaskDto> MapToDtoAsync(TodoTask task, bool includeSubTasks = false);

        /// <summary>
        /// Task'ın derinlik seviyesini hesaplar
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <returns>Derinlik seviyesi</returns>
        Task<int> CalculateTaskDepthAsync(int taskId);

        #endregion
    }

    /// <summary>
    /// Pagination bilgileri
    /// </summary>
    public class PaginationInfo
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }

    /// <summary>
    /// Task silme kontrolü DTO'su
    /// </summary>
    public class TaskDeletionCheckDto
    {
        public bool CanDelete { get; set; }
        public int SubTaskCount { get; set; }
        public List<string> Warnings { get; set; } = new();
        public string? Reason { get; set; }
    }

    /// <summary>
    /// Task istatistikleri DTO'su
    /// </summary>
    public class TaskStatsDto
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int TasksDueToday { get; set; }
        public int TasksDueThisWeek { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal AverageCompletionTime { get; set; } // in days
        public DateTime? LastCompletedTaskDate { get; set; }
        public Priority? MostUsedPriority { get; set; }
        public string? MostActiveCategory { get; set; }
    }

    /// <summary>
    /// Priority bazlı task dağılımı DTO'su
    /// </summary>
    public class TaskPriorityStatsDto
    {
        public Priority Priority { get; set; }
        public int TaskCount { get; set; }
        public int CompletedCount { get; set; }
        public decimal CompletionRate { get; set; }
    }
} 