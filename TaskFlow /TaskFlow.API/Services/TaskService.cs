using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Task yönetimi işlemleri implementation  
    /// CRUD, completion, hierarchy, search/filtering ve statistics işlemlerini yönetir
    /// </summary>
    public class TaskService : ITaskService
    {
        #region Private Fields

        private readonly TaskFlowDbContext _context;
        private readonly ILogger<TaskService> _logger;
        private readonly IConfiguration _configuration;

        #endregion

        #region Constructor

        public TaskService(
            TaskFlowDbContext context,
            ILogger<TaskService> logger,
            IConfiguration configuration)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        #endregion

        #region CRUD Operations

        public async Task<TodoTaskDto> CreateTaskAsync(int userId, CreateTodoTaskDto createDto)
        {
            try
            {
                _logger.LogInformation("Creating task for user {UserId}: {TaskTitle}", userId, createDto.Title);

                // Task limit kontrolü
                if (!await CheckTaskLimitAsync(userId))
                {
                    var maxTasks = int.Parse(_configuration.GetSection("ApplicationSettings:BusinessRules:MaxTasksPerUser").Value ?? "1000");
                    throw new InvalidOperationException($"Maksimum görev sayısı limitine ulaştınız ({maxTasks})");
                }

                // Category kontrolü
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == createDto.CategoryId && c.UserId == userId && c.IsActive);

                if (category == null)
                {
                    throw new InvalidOperationException("Geçersiz kategori");
                }

                // Priority enum parsing
                if (!Enum.TryParse<Priority>(createDto.Priority, out var priority))
                {
                    priority = Priority.Normal; // Default priority
                }

                // TodoTask entity oluştur
                var task = new TodoTask
                {
                    UserId = userId,
                    CategoryId = createDto.CategoryId,
                    ParentTaskId = createDto.ParentTaskId,
                    Title = createDto.Title.Trim(),
                    Description = createDto.Description?.Trim(),
                    Priority = priority,
                    DueDate = createDto.DueDate,
                    ReminderDate = createDto.ReminderDate,
                    Tags = createDto.Tags?.Trim(),
                    IsCompleted = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.TodoTasks.Add(task);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Task created successfully: {TaskId} for user {UserId}", task.Id, userId);

                // Task'ı relations ile beraber yeniden yükle
                var createdTask = await GetTaskByIdInternalAsync(task.Id, userId);
                return await MapToDtoAsync(createdTask!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task for user {UserId}", userId);
                throw;
            }
        }

        public async Task<(List<TodoTaskDto> Tasks, PaginationInfo Pagination)> GetTasksAsync(int userId, TodoTaskFilterDto filter)
        {
            try
            {
                _logger.LogDebug("Getting tasks for user {UserId} with filter", userId);

                var pagination = new PaginationInfo
                {
                    Page = filter.Page > 0 ? filter.Page : 1,
                    PageSize = filter.PageSize > 0 ? filter.PageSize : 20
                };

                var query = _context.TodoTasks
                    .Include(t => t.Category)
                    .Include(t => t.ParentTask)
                    .Where(t => t.UserId == userId && t.IsActive);

                // Filtreleme
                if (filter.IsCompleted.HasValue)
                {
                    query = query.Where(t => t.IsCompleted == filter.IsCompleted.Value);
                }

                if (filter.CategoryId.HasValue)
                {
                    query = query.Where(t => t.CategoryId == filter.CategoryId.Value);
                }

                if (!string.IsNullOrWhiteSpace(filter.Priority))
                {
                    if (Enum.TryParse<Priority>(filter.Priority, out var priority))
                    {
                        query = query.Where(t => t.Priority == priority);
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter.SearchText))
                {
                    var searchLower = filter.SearchText.ToLower();
                    query = query.Where(t => t.Title.ToLower().Contains(searchLower) ||
                                             (t.Description != null && t.Description.ToLower().Contains(searchLower)));
                }

                // Tarih filtreleri
                if (filter.DueDateFrom.HasValue)
                {
                    query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value >= filter.DueDateFrom.Value);
                }

                if (filter.DueDateTo.HasValue)
                {
                    query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value <= filter.DueDateTo.Value);
                }

                // Hierarchy filtering
                if (filter.OnlyParentTasks)
                {
                    query = query.Where(t => t.ParentTaskId == null);
                }

                // Total count for pagination
                var totalCount = await query.CountAsync();
                pagination.TotalCount = totalCount;
                pagination.HasNextPage = pagination.Page * pagination.PageSize < totalCount;
                pagination.HasPreviousPage = pagination.Page > 1;

                // Sıralama
                query = filter.SortBy?.ToLower() switch
                {
                    "priority" => filter.SortAscending
                        ? query.OrderBy(t => t.Priority)
                        : query.OrderByDescending(t => t.Priority),
                    "duedate" => filter.SortAscending
                        ? query.OrderBy(t => t.DueDate)
                        : query.OrderByDescending(t => t.DueDate),
                    "title" => filter.SortAscending
                        ? query.OrderBy(t => t.Title)
                        : query.OrderByDescending(t => t.Title),
                    _ => filter.SortAscending
                        ? query.OrderBy(t => t.CreatedAt)
                        : query.OrderByDescending(t => t.CreatedAt)
                };

                // Pagination
                if (pagination.Page > 0 && pagination.PageSize > 0)
                {
                    query = query.Skip((pagination.Page - 1) * pagination.PageSize)
                                 .Take(pagination.PageSize);
                }

                var tasks = await query.ToListAsync();
                var taskDtos = new List<TodoTaskDto>();

                foreach (var task in tasks)
                {
                    taskDtos.Add(await MapToDtoAsync(task));
                }

                return (taskDtos, pagination);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks for user {UserId}", userId);
                throw;
            }
        }

        public async Task<TodoTaskDto?> GetTaskByIdAsync(int userId, int taskId, bool includeSubTasks = false)
        {
            try
            {
                var task = await GetTaskByIdInternalAsync(taskId, userId);
                return task != null ? await MapToDtoAsync(task, includeSubTasks) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task {TaskId} for user {UserId}", taskId, userId);
                throw;
            }
        }

        public async Task<TodoTaskDto> UpdateTaskAsync(int userId, int taskId, UpdateTodoTaskDto updateDto)
        {
            try
            {
                _logger.LogInformation("Updating task {TaskId} for user {UserId}", taskId, userId);

                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId && t.IsActive);

                if (task == null)
                {
                    throw new InvalidOperationException("Görev bulunamadı");
                }

                // Güncelleme işlemleri
                if (!string.IsNullOrWhiteSpace(updateDto.Title))
                {
                    task.Title = updateDto.Title.Trim();
                }

                if (updateDto.Description != null)
                {
                    task.Description = string.IsNullOrWhiteSpace(updateDto.Description) 
                        ? null 
                        : updateDto.Description.Trim();
                }

                if (!string.IsNullOrWhiteSpace(updateDto.Priority))
                {
                    if (Enum.TryParse<Priority>(updateDto.Priority, out var priority))
                    {
                        task.Priority = priority;
                    }
                }

                if (updateDto.DueDate.HasValue)
                {
                    task.DueDate = updateDto.DueDate.Value;
                }

                if (updateDto.ReminderDate.HasValue)
                {
                    task.ReminderDate = updateDto.ReminderDate.Value;
                }

                if (updateDto.Tags != null)
                {
                    task.Tags = string.IsNullOrWhiteSpace(updateDto.Tags) 
                        ? null 
                        : updateDto.Tags.Trim();
                }

                if (updateDto.CategoryId.HasValue)
                {
                    // Category validation
                    var categoryExists = await _context.Categories
                        .AnyAsync(c => c.Id == updateDto.CategoryId.Value && c.UserId == userId && c.IsActive);
                    
                    if (!categoryExists)
                    {
                        throw new InvalidOperationException("Geçersiz kategori");
                    }
                    
                    task.CategoryId = updateDto.CategoryId.Value;
                }

                if (updateDto.CompletionPercentage.HasValue)
                {
                    task.CompletionPercentage = updateDto.CompletionPercentage.Value;
                    
                    if (updateDto.CompletionPercentage.Value == 100)
                    {
                        task.IsCompleted = true;
                        task.CompletedAt = DateTime.UtcNow;
                    }
                    else if (updateDto.CompletionPercentage.Value == 0)
                    {
                        task.IsCompleted = false;
                        task.CompletedAt = null;
                    }
                }

                task.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Task updated successfully: {TaskId}", taskId);

                var updatedTask = await GetTaskByIdInternalAsync(taskId, userId);
                return await MapToDtoAsync(updatedTask!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {TaskId} for user {UserId}", taskId, userId);
                throw;
            }
        }

        public async Task<bool> DeleteTaskAsync(int userId, int taskId)
        {
            try
            {
                _logger.LogInformation("Deleting task {TaskId} for user {UserId}", taskId, userId);

                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId && t.IsActive);

                if (task == null)
                {
                    return false;
                }

                // Soft delete the main task
                task.IsActive = false;
                task.UpdatedAt = DateTime.UtcNow;
                
                // Also soft delete all sub-tasks recursively
                await DeleteSubTasksRecursivelyAsync(userId, taskId);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Task and all sub-tasks deleted successfully: {TaskId}", taskId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId} for user {UserId}", taskId, userId);
                throw;
            }
        }
        
        private async Task DeleteSubTasksRecursivelyAsync(int userId, int parentTaskId)
        {
            var subTasks = await _context.TodoTasks
                .Where(t => t.UserId == userId && t.ParentTaskId == parentTaskId && t.IsActive)
                .ToListAsync();

            foreach (var subTask in subTasks)
            {
                subTask.IsActive = false;
                subTask.UpdatedAt = DateTime.UtcNow;
                
                // Recursively delete sub-tasks of this sub-task
                await DeleteSubTasksRecursivelyAsync(userId, subTask.Id);
            }
        }

        #endregion

        #region Task Completion Operations

        public async Task<TodoTaskDto> CompleteTaskAsync(int userId, int taskId, CompleteTaskDto completeDto)
        {
            try
            {
                _logger.LogInformation("Updating task completion status {TaskId} for user {UserId}", taskId, userId);

                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId && t.IsActive);

                if (task == null)
                {
                    throw new InvalidOperationException("Görev bulunamadı");
                }

                task.IsCompleted = completeDto.IsCompleted;
                task.CompletedAt = completeDto.IsCompleted ? DateTime.UtcNow : null;
                task.CompletionPercentage = completeDto.IsCompleted ? 100 : 0;
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Task completion status updated successfully: {TaskId}", taskId);

                var updatedTask = await GetTaskByIdInternalAsync(taskId, userId);
                return await MapToDtoAsync(updatedTask!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating completion status for task {TaskId} for user {UserId}", taskId, userId);
                throw;
            }
        }

        public async Task<TodoTaskDto> UpdateTaskProgressAsync(int userId, int taskId, int completionPercentage)
        {
            try
            {
                _logger.LogInformation("Updating task progress {TaskId} to {Percentage}% for user {UserId}", taskId, completionPercentage, userId);

                if (completionPercentage < 0 || completionPercentage > 100)
                {
                    throw new ArgumentException("Tamamlanma yüzdesi 0-100 arasında olmalıdır");
                }

                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId && t.IsActive);

                if (task == null)
                {
                    throw new InvalidOperationException("Görev bulunamadı");
                }

                // Progress update based on percentage
                task.CompletionPercentage = completionPercentage;
                
                if (completionPercentage == 100)
                {
                    task.IsCompleted = true;
                    task.CompletedAt = DateTime.UtcNow;
                }
                else if (completionPercentage == 0)
                {
                    task.IsCompleted = false;
                    task.CompletedAt = null;
                }

                task.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Task progress updated successfully: {TaskId}", taskId);

                var updatedTask = await GetTaskByIdInternalAsync(taskId, userId);
                return await MapToDtoAsync(updatedTask!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task progress {TaskId} for user {UserId}", taskId, userId);
                throw;
            }
        }

        #endregion

        #region Hierarchy Operations

        public async Task<List<TodoTaskDto>> GetSubTasksAsync(int userId, int parentTaskId)
        {
            try
            {
                var subTasks = await _context.TodoTasks
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && t.ParentTaskId == parentTaskId && t.IsActive)
                    .OrderBy(t => t.CreatedAt)
                    .ToListAsync();

                var subTaskDtos = new List<TodoTaskDto>();
                foreach (var subTask in subTasks)
                {
                    subTaskDtos.Add(await MapToDtoAsync(subTask));
                }

                return subTaskDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sub-tasks for parent task {ParentTaskId}", parentTaskId);
                throw;
            }
        }

        public async Task<TodoTaskDto> SetParentTaskAsync(int userId, int taskId, int parentTaskId)
        {
            try
            {
                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId && t.IsActive);

                var parentTask = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == parentTaskId && t.UserId == userId && t.IsActive);

                if (task == null || parentTask == null)
                {
                    throw new InvalidOperationException("Görev veya parent görev bulunamadı");
                }

                // Check for circular reference
                if (!await CheckCircularReferenceAsync(taskId, parentTaskId))
                {
                    throw new InvalidOperationException("Circular reference oluşacağı için bu işlem yapılamaz");
                }

                task.ParentTaskId = parentTaskId;
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedTask = await GetTaskByIdInternalAsync(taskId, userId);
                return await MapToDtoAsync(updatedTask!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting parent task {ParentTaskId} for task {TaskId}", parentTaskId, taskId);
                throw;
            }
        }

        public async Task<TodoTaskDto> RemoveParentTaskAsync(int userId, int taskId)
        {
            try
            {
                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId && t.IsActive);

                if (task == null)
                {
                    throw new InvalidOperationException("Görev bulunamadı");
                }

                task.ParentTaskId = null;
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedTask = await GetTaskByIdInternalAsync(taskId, userId);
                return await MapToDtoAsync(updatedTask!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing parent task for task {TaskId}", taskId);
                throw;
            }
        }

        #endregion

        #region Search & Filter Operations

        public async Task<List<TodoTaskDto>> SearchTasksAsync(int userId, string searchText, int maxResults = 50)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchText))
                {
                    return new List<TodoTaskDto>();
                }

                var searchLower = searchText.ToLower();
                var tasks = await _context.TodoTasks
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && 
                                t.IsActive &&
                                (t.Title.ToLower().Contains(searchLower) ||
                                 (t.Description != null && t.Description.ToLower().Contains(searchLower))))
                    .OrderByDescending(t => t.UpdatedAt)
                    .Take(maxResults)
                    .ToListAsync();

                var taskDtos = new List<TodoTaskDto>();
                foreach (var task in tasks)
                {
                    taskDtos.Add(await MapToDtoAsync(task));
                }

                return taskDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching tasks for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<TodoTaskDto>> GetOverdueTasksAsync(int userId)
        {
            try
            {
                var tasks = await _context.TodoTasks
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && 
                                t.IsActive &&
                                !t.IsCompleted &&
                                t.DueDate.HasValue &&
                                t.DueDate.Value < DateTime.UtcNow)
                    .OrderBy(t => t.DueDate)
                    .ToListAsync();

                var taskDtos = new List<TodoTaskDto>();
                foreach (var task in tasks)
                {
                    taskDtos.Add(await MapToDtoAsync(task));
                }

                return taskDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting overdue tasks for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<TodoTaskDto>> GetTasksDueTodayAsync(int userId)
        {
            try
            {
                var today = DateTime.Today;
                var tomorrow = today.AddDays(1);

                var tasks = await _context.TodoTasks
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && 
                                t.IsActive &&
                                t.DueDate.HasValue &&
                                t.DueDate.Value >= today &&
                                t.DueDate.Value < tomorrow)
                    .OrderBy(t => t.DueDate)
                    .ToListAsync();

                var taskDtos = new List<TodoTaskDto>();
                foreach (var task in tasks)
                {
                    taskDtos.Add(await MapToDtoAsync(task));
                }

                return taskDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks due today for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<TodoTaskDto>> GetTasksDueThisWeekAsync(int userId)
        {
            try
            {
                var today = DateTime.Today;
                var endOfWeek = today.AddDays(7);

                var tasks = await _context.TodoTasks
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && 
                                t.IsActive &&
                                t.DueDate.HasValue &&
                                t.DueDate.Value >= today &&
                                t.DueDate.Value < endOfWeek)
                    .OrderBy(t => t.DueDate)
                    .ToListAsync();

                var taskDtos = new List<TodoTaskDto>();
                foreach (var task in tasks)
                {
                    taskDtos.Add(await MapToDtoAsync(task));
                }

                return taskDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks due this week for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Validation & Business Rules

        public async Task<bool> CheckTaskDepthLimitAsync(int parentTaskId)
        {
            try
            {
                var maxDepth = int.Parse(_configuration.GetSection("ApplicationSettings:BusinessRules:MaxTaskDepth").Value ?? "3");
                var currentDepth = await CalculateTaskDepthAsync(parentTaskId);
                
                return currentDepth < maxDepth;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking task depth limit for parent {ParentTaskId}", parentTaskId);
                throw;
            }
        }

        public async Task<bool> CheckCircularReferenceAsync(int taskId, int newParentId)
        {
            try
            {
                if (taskId == newParentId)
                {
                    return false;
                }

                var currentParentId = newParentId;
                var checkedIds = new HashSet<int> { taskId };

                while (currentParentId > 0)
                {
                    if (checkedIds.Contains(currentParentId))
                    {
                        return false;
                    }

                    checkedIds.Add(currentParentId);

                    var parentTask = await _context.TodoTasks
                        .FirstOrDefaultAsync(t => t.Id == currentParentId);

                    if (parentTask?.ParentTaskId == null)
                    {
                        break;
                    }

                    currentParentId = parentTask.ParentTaskId.Value;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking circular reference for task {TaskId}", taskId);
                throw;
            }
        }

        public async Task<bool> CheckTaskLimitAsync(int userId)
        {
            try
            {
                var maxTasks = int.Parse(_configuration.GetSection("ApplicationSettings:BusinessRules:MaxTasksPerUser").Value ?? "1000");
                var currentCount = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive);

                return currentCount < maxTasks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking task limit for user {UserId}", userId);
                throw;
            }
        }

        public async Task<TaskDeletionCheckDto> CheckTaskDeletionAsync(int taskId)
        {
            try
            {
                var subTaskCount = await _context.TodoTasks
                    .CountAsync(t => t.ParentTaskId == taskId && t.IsActive);

                var result = new TaskDeletionCheckDto
                {
                    CanDelete = true,
                    SubTaskCount = subTaskCount,
                    Warnings = new List<string>()
                };

                if (subTaskCount > 0)
                {
                    result.Warnings.Add($"Bu görevin {subTaskCount} alt görevi var. Silme işlemi tüm alt görevleri de silecek.");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if task {TaskId} can be deleted", taskId);
                throw;
            }
        }

        #endregion

        #region Statistics Operations

        public async Task<TaskStatsDto> GetTaskStatsAsync(int userId)
        {
            try
            {
                var totalTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive);

                var completedTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive && t.IsCompleted);

                var overdueTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive && !t.IsCompleted && 
                                     t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow);

                var todayTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive && 
                                     t.DueDate.HasValue && t.DueDate.Value.Date == DateTime.Today);

                var thisWeekTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive && 
                                     t.DueDate.HasValue && t.DueDate.Value >= DateTime.Today && 
                                     t.DueDate.Value < DateTime.Today.AddDays(7));

                var stats = new TaskStatsDto
                {
                    TotalTasks = totalTasks,
                    CompletedTasks = completedTasks,
                    PendingTasks = totalTasks - completedTasks,
                    OverdueTasks = overdueTasks,
                    TasksDueToday = todayTasks,
                    TasksDueThisWeek = thisWeekTasks,
                    CompletionRate = totalTasks > 0 ? (decimal)completedTasks / totalTasks * 100 : 0
                };

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task statistics for user {UserId}", userId);
                throw;
            }
        }

        public async Task<TaskStatsDto> GetTaskStatsByCategoryAsync(int userId, int categoryId)
        {
            try
            {
                var totalTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.CategoryId == categoryId && t.IsActive);

                var completedTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.CategoryId == categoryId && t.IsActive && t.IsCompleted);

                var stats = new TaskStatsDto
                {
                    TotalTasks = totalTasks,
                    CompletedTasks = completedTasks,
                    PendingTasks = totalTasks - completedTasks,
                    CompletionRate = totalTasks > 0 ? (decimal)completedTasks / totalTasks * 100 : 0
                };

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task statistics by category {CategoryId} for user {UserId}", categoryId, userId);
                throw;
            }
        }

        public async Task<List<TaskPriorityStatsDto>> GetTaskPriorityStatsAsync(int userId)
        {
            try
            {
                var stats = await _context.TodoTasks
                    .Where(t => t.UserId == userId && t.IsActive)
                    .GroupBy(t => t.Priority)
                    .Select(g => new TaskPriorityStatsDto
                    {
                        Priority = g.Key,
                        TaskCount = g.Count(),
                        CompletedCount = g.Count(t => t.IsCompleted),
                        CompletionRate = g.Count() > 0 ? (decimal)g.Count(t => t.IsCompleted) / g.Count() * 100 : 0
                    })
                    .ToListAsync();

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task priority statistics for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Helper Methods

        private async Task<TodoTask?> GetTaskByIdInternalAsync(int taskId, int userId)
        {
            return await _context.TodoTasks
                .Include(t => t.Category)
                .Include(t => t.ParentTask)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId && t.IsActive);
        }

        public async Task<TodoTaskDto> MapToDtoAsync(TodoTask task, bool includeSubTasks = false)
        {
            if (task == null)
                throw new ArgumentNullException(nameof(task));

            var dto = new TodoTaskDto
            {
                Id = task.Id,
                UserId = task.UserId,
                CategoryId = task.CategoryId,
                ParentTaskId = task.ParentTaskId,
                Title = task.Title,
                Description = task.Description,
                Priority = task.Priority.ToString(),
                CompletionPercentage = task.CompletionPercentage,
                DueDate = task.DueDate,
                ReminderDate = task.ReminderDate,
                StartDate = task.StartDate,
                Tags = task.Tags,
                Notes = task.Notes,
                IsCompleted = task.IsCompleted,
                CompletedAt = task.CompletedAt,
                IsActive = task.IsActive,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };

            // Category bilgisini ekle
            if (task.Category != null)
            {
                dto.Category = new CategoryDto
                {
                    Id = task.Category.Id,
                    Name = task.Category.Name,
                    Description = task.Category.Description,
                    ColorCode = task.Category.ColorCode,
                    Icon = task.Category.Icon,
                    IsActive = task.Category.IsActive,
                    CreatedAt = task.Category.CreatedAt,
                    UpdatedAt = task.Category.UpdatedAt
                };
            }

            // Parent task bilgisini ekle
            if (task.ParentTask != null)
            {
                dto.ParentTask = new TodoTaskDto
                {
                    Id = task.ParentTask.Id,
                    UserId = task.ParentTask.UserId,
                    CategoryId = task.ParentTask.CategoryId,
                    Title = task.ParentTask.Title,
                    Priority = task.ParentTask.Priority.ToString(),
                    CompletionPercentage = task.ParentTask.CompletionPercentage,
                    IsCompleted = task.ParentTask.IsCompleted,
                    CreatedAt = task.ParentTask.CreatedAt,
                    UpdatedAt = task.ParentTask.UpdatedAt
                };
            }

            // Sub-tasks ekle (eğer isteniyorsa)
            if (includeSubTasks)
            {
                var subTasks = await _context.TodoTasks
                    .Where(t => t.ParentTaskId == task.Id && t.IsActive)
                    .ToListAsync();

                if (subTasks.Any())
                {
                    dto.SubTasks = new List<TodoTaskDto>();
                    foreach (var subTask in subTasks)
                    {
                        dto.SubTasks.Add(await MapToDtoAsync(subTask, false)); // Infinite recursion engellemek için
                    }
                }
            }

            return dto;
        }

        public async Task<int> CalculateTaskDepthAsync(int taskId)
        {
            try
            {
                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == taskId);

                if (task?.ParentTaskId == null)
                {
                    return 0;
                }

                return 1 + await CalculateTaskDepthAsync(task.ParentTaskId.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating task depth for task {TaskId}", taskId);
                throw;
            }
        }

        #endregion
    }
} 