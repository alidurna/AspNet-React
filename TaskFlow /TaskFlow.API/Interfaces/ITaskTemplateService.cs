using TaskFlow.API.DTOs;

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// Görev şablonları yönetimi için service interface
    /// </summary>
    public interface ITaskTemplateService
    {
        // CRUD Operations
        Task<TaskTemplateDto> CreateTemplateAsync(int userId, CreateTaskTemplateDto createDto);
        Task<TaskTemplateDto?> GetTemplateByIdAsync(int userId, int templateId);
        Task<(List<TaskTemplateDto> Templates, PaginationInfo Pagination)> GetTemplatesAsync(int userId, TaskTemplateFilterDto filter);
        Task<TaskTemplateDto> UpdateTemplateAsync(int userId, int templateId, UpdateTaskTemplateDto updateDto);
        Task<bool> DeleteTemplateAsync(int userId, int templateId);

        // Template Usage
        Task<TodoTaskDto> CreateTaskFromTemplateAsync(int userId, CreateTaskFromTemplateDto createDto);
        Task<int> IncrementUsageCountAsync(int templateId);

        // Analysis
        Task<List<TaskTemplateDto>> GetMostUsedTemplatesAsync(int userId, int count = 5);
        Task<List<TaskTemplateDto>> GetTemplatesByCategoryAsync(int userId, int categoryId);
    }
} 