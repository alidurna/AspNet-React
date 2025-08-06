// ****************************************************************************************************
//  ITASKDEPENDENCYSERVICE.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının görev bağımlılıkları yönetimi için service interface'ini içerir.
//  Bağımlılık oluşturma, güncelleme, silme ve sorgulama işlemlerini tanımlar.
//
//  ANA BAŞLIKLAR:
//  - CRUD Operations (Create, Read, Update, Delete)
//  - Dependency Validation ve Business Rules
//  - Circular Dependency Detection
//  - Dependency Chain Analysis
//  - Task Scheduling Impact
//
//  GÜVENLİK:
//  - User isolation (kullanıcı sadece kendi bağımlılıklarını yönetir)
//  - Input validation ve sanitization
//  - Business rule enforcement
//  - Data integrity protection
//  - Circular dependency prevention
//
//  HATA YÖNETİMİ:
//  - Comprehensive exception handling
//  - Business rule validation
//  - Database transaction management
//  - Detailed logging for debugging
//  - Graceful error recovery
//
//  EDGE-CASE'LER:
//  - Circular dependencies
//  - Self-dependencies
//  - Deep dependency chains
//  - Concurrent modifications
//  - Deleted dependent tasks
//  - Invalid task references
//
//  YAN ETKİLER:
//  - Dependency creation affects task scheduling
//  - Task completion affects dependent tasks
//  - Dependency deletion affects task chains
//  - Progress updates affect dependencies
//
//  PERFORMANS:
//  - Efficient dependency queries
//  - Optimized relationship loading
//  - Caching strategies
//  - Batch operations support
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear interface design
//  - Comprehensive documentation
//  - Extensible service structure
//  - Backward compatibility
//  - Configuration-based rules
// ****************************************************************************************************

using TaskFlow.API.DTOs;

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// Görev bağımlılıkları yönetimi için service interface'i
    /// </summary>
    public interface ITaskDependencyService
    {
        #region CRUD Operations

        /// <summary>
        /// Yeni bir bağımlılık oluşturur
        /// </summary>
        /// <param name="userId">Bağımlılığı oluşturan kullanıcının ID'si</param>
        /// <param name="createDto">Oluşturulacak bağımlılık bilgileri</param>
        /// <returns>Oluşturulan bağımlılık DTO'su</returns>
        Task<TaskDependencyDto> CreateDependencyAsync(int userId, CreateTaskDependencyDto createDto);

        /// <summary>
        /// Belirli bir bağımlılığı getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="dependencyId">Bağımlılık ID'si</param>
        /// <returns>Bağımlılık DTO'su</returns>
        Task<TaskDependencyDto?> GetDependencyByIdAsync(int userId, int dependencyId);

        /// <summary>
        /// Kullanıcının bağımlılıklarını filtreli olarak getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="filter">Filtreleme kriterleri</param>
        /// <returns>Bağımlılık listesi ve sayfalama bilgisi</returns>
        Task<(List<TaskDependencyDto> Dependencies, PaginationInfo Pagination)> GetDependenciesAsync(int userId, TaskDependencyFilterDto filter);

        /// <summary>
        /// Bağımlılığı günceller
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="dependencyId">Bağımlılık ID'si</param>
        /// <param name="updateDto">Güncelleme bilgileri</param>
        /// <returns>Güncellenmiş bağımlılık DTO'su</returns>
        Task<TaskDependencyDto> UpdateDependencyAsync(int userId, int dependencyId, UpdateTaskDependencyDto updateDto);

        /// <summary>
        /// Bağımlılığı siler (soft delete)
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="dependencyId">Bağımlılık ID'si</param>
        /// <returns>Silme işlemi başarılı mı</returns>
        Task<bool> DeleteDependencyAsync(int userId, int dependencyId);

        #endregion

        #region Dependency Analysis

        /// <summary>
        /// Belirli bir görevin bağımlılıklarını getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görevin bağımlılık listesi</returns>
        Task<List<TaskDependencyDto>> GetTaskDependenciesAsync(int userId, int taskId);

        /// <summary>
        /// Belirli bir görevin ön koşullarını getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görevin ön koşul listesi</returns>
        Task<List<TaskDependencyDto>> GetTaskPrerequisitesAsync(int userId, int taskId);

        /// <summary>
        /// Görevin bağımlılık nedeniyle bloke olup olmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görev bloke mi</returns>
        Task<bool> IsTaskBlockedByDependenciesAsync(int userId, int taskId);

        /// <summary>
        /// Görevin başlayabilir olup olmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görev başlayabilir mi</returns>
        Task<bool> CanTaskStartAsync(int userId, int taskId);

        #endregion

        #region Validation & Business Rules

        /// <summary>
        /// Döngüsel bağımlılık kontrolü yapar
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="dependentTaskId">Bağımlı görev ID'si</param>
        /// <param name="prerequisiteTaskId">Ön koşul görev ID'si</param>
        /// <returns>Döngüsel bağımlılık var mı</returns>
        Task<bool> CheckCircularDependencyAsync(int userId, int dependentTaskId, int prerequisiteTaskId);

        /// <summary>
        /// Kendi kendine bağımlılık kontrolü yapar
        /// </summary>
        /// <param name="dependentTaskId">Bağımlı görev ID'si</param>
        /// <param name="prerequisiteTaskId">Ön koşul görev ID'si</param>
        /// <returns>Kendi kendine bağımlılık var mı</returns>
        bool CheckSelfDependency(int dependentTaskId, int prerequisiteTaskId);

        /// <summary>
        /// Bağımlılık derinlik limitini kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="dependentTaskId">Bağımlı görev ID'si</param>
        /// <param name="prerequisiteTaskId">Ön koşul görev ID'si</param>
        /// <returns>Derinlik limiti aşılmış mı</returns>
        Task<bool> CheckDependencyDepthLimitAsync(int userId, int dependentTaskId, int prerequisiteTaskId);

        #endregion

        #region Bulk Operations

        /// <summary>
        /// Toplu bağımlılık oluşturur
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="dependencies">Oluşturulacak bağımlılık listesi</param>
        /// <returns>Oluşturulan bağımlılık listesi</returns>
        Task<List<TaskDependencyDto>> CreateDependenciesAsync(int userId, List<CreateTaskDependencyDto> dependencies);

        /// <summary>
        /// Toplu bağımlılık siler
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="dependencyIds">Silinecek bağımlılık ID'leri</param>
        /// <returns>Silinen bağımlılık sayısı</returns>
        Task<int> DeleteDependenciesAsync(int userId, List<int> dependencyIds);

        #endregion
    }
} 