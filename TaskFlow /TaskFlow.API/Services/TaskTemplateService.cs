using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using Microsoft.AspNetCore.SignalR;
using TaskFlow.API.Hubs;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Görev şablonları yönetimi için service implementasyonu
    /// </summary>
    public class TaskTemplateService : ITaskTemplateService
    {
        private readonly TaskFlowDbContext _context;
        private readonly ILogger<TaskTemplateService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<TaskFlowHub> _hubContext;

        public TaskTemplateService(
            TaskFlowDbContext context,
            ILogger<TaskTemplateService> logger,
            IConfiguration configuration,
            IHubContext<TaskFlowHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _hubContext = hubContext;
        }

        #region CRUD Operations

        /// <summary>
        /// Yeni bir şablon oluşturur
        /// </summary>
        public async Task<TaskTemplateDto> CreateTemplateAsync(int userId, CreateTaskTemplateDto createDto)
        {
            try
            {
                _logger.LogInformation("Creating template for user {UserId}: {Title}", userId, createDto.Title);

                // Aynı isimde şablon var mı kontrol et
                var existingTemplate = await _context.TaskTemplates
                    .FirstOrDefaultAsync(t => t.UserId == userId && t.Title == createDto.Title && t.IsActive);

                if (existingTemplate != null)
                {
                    throw new InvalidOperationException("Bu isimde bir şablon zaten mevcut");
                }

                // Şablon oluştur
                var template = new TaskTemplate
                {
                    Title = createDto.Title,
                    Description = createDto.Description,
                    Priority = createDto.Priority,
                    CategoryId = createDto.CategoryId,
                    Tags = createDto.Tags,
                    Notes = createDto.Notes,
                    EstimatedHours = createDto.EstimatedHours,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.TaskTemplates.Add(template);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Template created successfully: {TemplateId}", template.Id);

                // SignalR ile real-time bildirim
                await _hubContext.Clients.User(userId.ToString()).SendAsync("TemplateCreated", template.Id);

                return await MapToDtoAsync(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating template for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Belirli bir şablonu getirir
        /// </summary>
        public async Task<TaskTemplateDto?> GetTemplateByIdAsync(int userId, int templateId)
        {
            try
            {
                var template = await _context.TaskTemplates
                    .Include(t => t.Category)
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == templateId && t.UserId == userId && t.IsActive);

                return template != null ? await MapToDtoAsync(template) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template {TemplateId} for user {UserId}", templateId, userId);
                throw;
            }
        }

        /// <summary>
        /// Kullanıcının şablonlarını filtreli olarak getirir
        /// </summary>
        public async Task<(List<TaskTemplateDto> Templates, PaginationInfo Pagination)> GetTemplatesAsync(int userId, TaskTemplateFilterDto filter)
        {
            try
            {
                var pagination = new PaginationInfo
                {
                    Page = filter.Page > 0 ? filter.Page.Value : 1,
                    PageSize = filter.PageSize > 0 ? filter.PageSize.Value : 20
                };

                var query = _context.TaskTemplates
                    .Include(t => t.Category)
                    .Include(t => t.User)
                    .Where(t => t.UserId == userId && t.IsActive);

                // Filtreleme
                if (!string.IsNullOrEmpty(filter.SearchText))
                {
                    query = query.Where(t => t.Title.Contains(filter.SearchText) || 
                                           t.Description!.Contains(filter.SearchText) ||
                                           t.Tags!.Contains(filter.SearchText));
                }

                if (filter.CategoryId.HasValue)
                {
                    query = query.Where(t => t.CategoryId == filter.CategoryId.Value);
                }

                if (filter.Priority.HasValue)
                {
                    query = query.Where(t => t.Priority == filter.Priority.Value);
                }

                if (filter.IsActive.HasValue)
                {
                    query = query.Where(t => t.IsActive == filter.IsActive.Value);
                }

                // Total count for pagination
                var totalCount = await query.CountAsync();
                pagination.TotalCount = totalCount;
                pagination.HasNextPage = pagination.Page * pagination.PageSize < totalCount;
                pagination.HasPreviousPage = pagination.Page > 1;

                // Sıralama
                query = filter.SortBy?.ToLower() switch
                {
                    "title" => filter.SortAscending == true
                        ? query.OrderBy(t => t.Title)
                        : query.OrderByDescending(t => t.Title),
                    "priority" => filter.SortAscending == true
                        ? query.OrderBy(t => t.Priority)
                        : query.OrderByDescending(t => t.Priority),
                    "createdat" => filter.SortAscending == true
                        ? query.OrderBy(t => t.CreatedAt)
                        : query.OrderByDescending(t => t.CreatedAt),
                    _ => filter.SortAscending == true
                        ? query.OrderBy(t => t.CreatedAt)
                        : query.OrderByDescending(t => t.CreatedAt)
                };

                // Pagination
                if (pagination.Page > 0 && pagination.PageSize > 0)
                {
                    query = query.Skip((pagination.Page - 1) * pagination.PageSize)
                                 .Take(pagination.PageSize);
                }

                var templates = await query.ToListAsync();
                var templateDtos = new List<TaskTemplateDto>();

                foreach (var template in templates)
                {
                    templateDtos.Add(await MapToDtoAsync(template));
                }

                return (templateDtos, pagination);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting templates for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Şablonu günceller
        /// </summary>
        public async Task<TaskTemplateDto> UpdateTemplateAsync(int userId, int templateId, UpdateTaskTemplateDto updateDto)
        {
            try
            {
                var template = await _context.TaskTemplates
                    .FirstOrDefaultAsync(t => t.Id == templateId && t.UserId == userId && t.IsActive);

                if (template == null)
                {
                    throw new InvalidOperationException("Şablon bulunamadı");
                }

                // Güncelleme
                if (!string.IsNullOrEmpty(updateDto.Title))
                {
                    template.Title = updateDto.Title;
                }

                if (updateDto.Description != null)
                {
                    template.Description = updateDto.Description;
                }

                if (updateDto.Priority.HasValue)
                {
                    template.Priority = updateDto.Priority.Value;
                }

                if (updateDto.CategoryId.HasValue)
                {
                    template.CategoryId = updateDto.CategoryId.Value;
                }

                if (updateDto.Tags != null)
                {
                    template.Tags = updateDto.Tags;
                }

                if (updateDto.Notes != null)
                {
                    template.Notes = updateDto.Notes;
                }

                if (updateDto.EstimatedHours.HasValue)
                {
                    template.EstimatedHours = updateDto.EstimatedHours.Value;
                }

                if (updateDto.IsActive.HasValue)
                {
                    template.IsActive = updateDto.IsActive.Value;
                }

                template.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Template updated successfully: {TemplateId}", templateId);

                // SignalR ile real-time bildirim
                await _hubContext.Clients.User(userId.ToString()).SendAsync("TemplateUpdated", templateId);

                return await MapToDtoAsync(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating template {TemplateId} for user {UserId}", templateId, userId);
                throw;
            }
        }

        /// <summary>
        /// Şablonu siler (soft delete)
        /// </summary>
        public async Task<bool> DeleteTemplateAsync(int userId, int templateId)
        {
            try
            {
                var template = await _context.TaskTemplates
                    .FirstOrDefaultAsync(t => t.Id == templateId && t.UserId == userId && t.IsActive);

                if (template == null)
                {
                    return false;
                }

                template.IsActive = false;
                template.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Template deleted successfully: {TemplateId}", templateId);

                // SignalR ile real-time bildirim
                await _hubContext.Clients.User(userId.ToString()).SendAsync("TemplateDeleted", templateId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting template {TemplateId} for user {UserId}", templateId, userId);
                throw;
            }
        }

        #endregion

        #region Template Usage

        /// <summary>
        /// Şablondan görev oluşturur
        /// </summary>
        public async Task<TodoTaskDto> CreateTaskFromTemplateAsync(int userId, CreateTaskFromTemplateDto createDto)
        {
            try
            {
                var template = await _context.TaskTemplates
                    .Include(t => t.Category)
                    .FirstOrDefaultAsync(t => t.Id == createDto.TemplateId && t.UserId == userId && t.IsActive);

                if (template == null)
                {
                    throw new InvalidOperationException("Şablon bulunamadı");
                }

                // User'ı getir
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new InvalidOperationException("Kullanıcı bulunamadı");
                }

                // Görev oluştur
                var task = new TodoTask
                {
                    Title = createDto.CustomTitle ?? template.Title,
                    Description = createDto.CustomDescription ?? template.Description,
                    Priority = (Priority)(createDto.CustomPriority ?? template.Priority),
                    CategoryId = createDto.CustomCategoryId ?? template.CategoryId,
                    DueDate = createDto.DueDate,
                    Tags = template.Tags,
                    Notes = template.Notes,
                    UserId = userId,
                    User = user,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true,
                    IsCompleted = false,
                    Progress = 0
                };

                _context.TodoTasks.Add(task);
                await _context.SaveChangesAsync();

                // Kullanım sayısını artır
                await IncrementUsageCountAsync(template.Id);

                _logger.LogInformation("Task created from template: {TaskId} from template {TemplateId}", task.Id, template.Id);

                // SignalR ile real-time bildirim
                await _hubContext.Clients.User(userId.ToString()).SendAsync("TaskCreatedFromTemplate", task.Id);

                return await MapTaskToDtoAsync(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task from template for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Şablon kullanım sayısını artırır
        /// </summary>
        public async Task<int> IncrementUsageCountAsync(int templateId)
        {
            try
            {
                var template = await _context.TaskTemplates.FindAsync(templateId);
                if (template != null)
                {
                    // UsageCount field'ı yoksa şimdilik sadece log atıyoruz
                    _logger.LogInformation("Template usage incremented: {TemplateId}", templateId);
                }
                return 0; // Gelecekte UsageCount field'ı eklenecek
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing usage count for template {TemplateId}", templateId);
                throw;
            }
        }

        #endregion

        #region Analysis

        /// <summary>
        /// En çok kullanılan şablonları getirir
        /// </summary>
        public async Task<List<TaskTemplateDto>> GetMostUsedTemplatesAsync(int userId, int count = 5)
        {
            try
            {
                var templates = await _context.TaskTemplates
                    .Include(t => t.Category)
                    .Include(t => t.User)
                    .Where(t => t.UserId == userId && t.IsActive)
                    .OrderByDescending(t => t.CreatedAt) // Şimdilik creation date'e göre sıralıyoruz
                    .Take(count)
                    .ToListAsync();

                var templateDtos = new List<TaskTemplateDto>();
                foreach (var template in templates)
                {
                    templateDtos.Add(await MapToDtoAsync(template));
                }

                return templateDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting most used templates for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Kategoriye göre şablonları getirir
        /// </summary>
        public async Task<List<TaskTemplateDto>> GetTemplatesByCategoryAsync(int userId, int categoryId)
        {
            try
            {
                var templates = await _context.TaskTemplates
                    .Include(t => t.Category)
                    .Include(t => t.User)
                    .Where(t => t.UserId == userId && t.CategoryId == categoryId && t.IsActive)
                    .ToListAsync();

                var templateDtos = new List<TaskTemplateDto>();
                foreach (var template in templates)
                {
                    templateDtos.Add(await MapToDtoAsync(template));
                }

                return templateDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting templates by category for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// TaskTemplate entity'sini DTO'ya dönüştürür
        /// </summary>
        private async Task<TaskTemplateDto> MapToDtoAsync(TaskTemplate template)
        {
            return new TaskTemplateDto
            {
                Id = template.Id,
                Title = template.Title,
                Description = template.Description,
                Priority = template.Priority,
                CategoryId = template.CategoryId,
                CategoryName = template.Category?.Name,
                Tags = template.Tags,
                Notes = template.Notes,
                EstimatedHours = template.EstimatedHours,
                IsActive = template.IsActive,
                CreatedAt = template.CreatedAt,
                UpdatedAt = template.UpdatedAt,
                UserId = template.UserId,
                UserName = $"{template.User?.FirstName} {template.User?.LastName}".Trim(),
                UsageCount = 0 // Gelecekte UsageCount field'ı eklenecek
            };
        }

        /// <summary>
        /// TodoTask entity'sini DTO'ya dönüştürür
        /// </summary>
        private async Task<TodoTaskDto> MapTaskToDtoAsync(TodoTask task)
        {
            return new TodoTaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Priority = task.Priority,
                IsCompleted = task.IsCompleted,
                Progress = task.Progress,
                CategoryId = task.CategoryId,
                CategoryName = task.Category?.Name,
                UserId = task.UserId,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                ParentTaskId = task.ParentTaskId,
                SubTasks = new List<TodoTaskDto>()
            };
        }

        #endregion
    }
} 