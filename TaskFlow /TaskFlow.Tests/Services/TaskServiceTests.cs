using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Services;
using TaskFlow.Tests.Helpers;
using Xunit;

namespace TaskFlow.Tests.Services;

/// <summary>
/// TaskService unit testleri
/// </summary>
public class TaskServiceTests : IDisposable
{
    private readonly TaskFlowDbContext _context;
    private readonly Mock<ILogger<TaskService>> _mockLogger;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly TaskService _taskService;

    public TaskServiceTests()
    {
        _context = TestDbContextFactory.CreateContextWithTestData();
        _mockLogger = new Mock<ILogger<TaskService>>();
        
        _mockConfiguration = new Mock<IConfiguration>();
        
        // MaxTasksPerUser configuration
        var mockMaxTasksSection = new Mock<IConfigurationSection>();
        mockMaxTasksSection.Setup(x => x.Value).Returns("50");
        _mockConfiguration.Setup(x => x.GetSection("ApplicationSettings:BusinessRules:MaxTasksPerUser"))
            .Returns(mockMaxTasksSection.Object);
            
        // MaxTaskDepth configuration
        var mockMaxDepthSection = new Mock<IConfigurationSection>();
        mockMaxDepthSection.Setup(x => x.Value).Returns("5");
        _mockConfiguration.Setup(x => x.GetSection("ApplicationSettings:BusinessRules:MaxTaskDepth"))
            .Returns(mockMaxDepthSection.Object);
        
        _taskService = new TaskService(_context, _mockLogger.Object, _mockConfiguration.Object);
    }

    #region GetTaskByIdAsync Tests

    [Fact]
    public async Task GetTaskByIdAsync_ValidTaskAndUser_ReturnsTask()
    {
        // Arrange
        var userId = 1;
        var taskId = 1;

        // Act
        var result = await _taskService.GetTaskByIdAsync(userId, taskId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(taskId, result.Id);
        Assert.Equal("API Dokümantasyonu", result.Title);
    }

    [Fact]
    public async Task GetTaskByIdAsync_InvalidTaskId_ReturnsNull()
    {
        // Arrange
        var userId = 1;
        var nonExistentTaskId = 999;

        // Act
        var result = await _taskService.GetTaskByIdAsync(userId, nonExistentTaskId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetTaskByIdAsync_TaskBelongsToAnotherUser_ReturnsNull()
    {
        // Arrange
        var userId = 1;
        var taskIdOfAnotherUser = 4; // Bu görev User 2'ye ait

        // Act
        var result = await _taskService.GetTaskByIdAsync(userId, taskIdOfAnotherUser);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetTaskByIdAsync_WithSubTasks_ReturnsTaskWithSubTasks()
    {
        // Arrange
        var userId = 1;
        var parentTaskId = 1; // Bu görevin alt görevi var

        // Act
        var result = await _taskService.GetTaskByIdAsync(userId, parentTaskId, includeSubTasks: true);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.SubTasks);
        Assert.True(result.SubTasks.Count > 0);
    }

    #endregion

    #region GetTasksAsync Tests

    [Fact]
    public async Task GetTasksAsync_ValidUserId_ReturnsUserTasks()
    {
        // Arrange
        var userId = 1;
        var filter = new TodoTaskFilterDto();

        // Act
        var (tasks, pagination) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.True(tasks.Count >= 3); // User 1'in en az 3 görevi var
        Assert.All(tasks, t => Assert.True(t.IsActive));
        Assert.NotNull(pagination);
    }

    [Fact]
    public async Task GetTasksAsync_CompletedFilter_ReturnsOnlyCompletedTasks()
    {
        // Arrange
        var userId = 1;
        var filter = new TodoTaskFilterDto { IsCompleted = true };

        // Act
        var (tasks, _) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.All(tasks, t => Assert.True(t.IsCompleted));
    }

    [Fact]
    public async Task GetTasksAsync_PriorityFilter_ReturnsFilteredTasks()
    {
        // Arrange
        var userId = 1;
        var filter = new TodoTaskFilterDto { Priority = Priority.High.ToString() };

        // Act
        var (tasks, _) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.All(tasks, t => Assert.Equal(Priority.High, t.Priority));
    }

    [Fact]
    public async Task GetTasksAsync_CategoryFilter_ReturnsTasksFromCategory()
    {
        // Arrange
        var userId = 1;
        var categoryId = 1;
        var filter = new TodoTaskFilterDto { CategoryId = categoryId };

        // Act
        var (tasks, _) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.All(tasks, t => Assert.Equal(categoryId, t.CategoryId));
    }

    [Fact]
    public async Task GetTasksAsync_SearchTextFilter_ReturnsMatchingTasks()
    {
        // Arrange
        var userId = 1;
        var filter = new TodoTaskFilterDto { SearchText = "API" };

        // Act
        var (tasks, _) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.All(tasks, t => 
            Assert.True(t.Title.Contains("API", StringComparison.OrdinalIgnoreCase) ||
                       (t.Description != null && t.Description.Contains("API", StringComparison.OrdinalIgnoreCase))));
    }

    [Fact]
    public async Task GetTasksAsync_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
        var userId = 1;
        var filter = new TodoTaskFilterDto { Page = 1, PageSize = 2 };

        // Act
        var (tasks, pagination) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.True(tasks.Count <= 2);
        Assert.Equal(1, pagination.Page);
        Assert.Equal(2, pagination.PageSize);
    }

    [Fact]
    public async Task GetTasksAsync_OnlyParentTasks_ReturnsParentTasksOnly()
    {
        // Arrange
        var userId = 1;
        var filter = new TodoTaskFilterDto { OnlyParentTasks = true };

        // Act
        var (tasks, _) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.All(tasks, t => Assert.Null(t.ParentTaskId));
    }

    #endregion

    #region CreateTaskAsync Tests

    [Fact]
    public async Task CreateTaskAsync_ValidData_CreatesAndReturnsTask()
    {
        // Arrange
        var userId = 1;
        var createDto = new CreateTodoTaskDto
        {
            Title = "Yeni Test Görevi",
            Description = "Test açıklaması",
            CategoryId = 1,
            Priority = Priority.Normal.ToString(),
            DueDate = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var result = await _taskService.CreateTaskAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createDto.Title, result.Title);
        Assert.Equal(createDto.Description, result.Description);
        Assert.Equal(createDto.CategoryId, result.CategoryId);
        Assert.Equal(createDto.Priority, result.Priority.ToString());
        Assert.False(result.IsCompleted);
        Assert.True(result.IsActive);

        // Database'de de var mı kontrol et
        var savedTask = await _context.TodoTasks.FindAsync(result.Id);
        Assert.NotNull(savedTask);
        Assert.Equal(createDto.Title, savedTask.Title);
    }

    [Fact]
    public async Task CreateTaskAsync_WithParentTask_CreatesSubTask()
    {
        // Arrange
        var userId = 1;
        var parentTaskId = 1;
        var createDto = new CreateTodoTaskDto
        {
            Title = "Alt Görev",
            Description = "Ana görevin alt görevi",
            CategoryId = 1,
            Priority = Priority.Low.ToString(),
            ParentTaskId = parentTaskId
        };

        // Act
        var result = await _taskService.CreateTaskAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(parentTaskId, result.ParentTaskId);
    }

    [Fact]
    public async Task CreateTaskAsync_InvalidCategory_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var createDto = new CreateTodoTaskDto
        {
            Title = "Test Görevi",
            CategoryId = 999, // Geçersiz kategori
            Priority = Priority.Normal.ToString()
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.CreateTaskAsync(userId, createDto));
        
        Assert.Contains("Geçersiz kategori", exception.Message);
    }

    [Fact]
    public async Task CreateTaskAsync_InvalidPriority_UsesDefaultPriority()
    {
        // Arrange
        var userId = 1;
        var createDto = new CreateTodoTaskDto
        {
            Title = "Test Görevi",
            CategoryId = 1,
            Priority = "InvalidPriority"
        };

        // Act
        var result = await _taskService.CreateTaskAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(Priority.Normal.ToString(), result.Priority.ToString()); // Default priority
    }

    [Fact]
    public async Task CreateTaskAsync_EmptyTitle_TrimsWhitespace()
    {
        // Arrange
        var userId = 1;
        var createDto = new CreateTodoTaskDto
        {
            Title = "  Test Görevi  ",
            CategoryId = 1,
            Priority = Priority.Normal.ToString()
        };

        // Act
        var result = await _taskService.CreateTaskAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Görevi", result.Title);
    }

    #endregion

    #region UpdateTaskAsync Tests

    [Fact]
    public async Task UpdateTaskAsync_ValidData_UpdatesAndReturnsTask()
    {
        // Arrange
        var userId = 1;
        var taskId = 1;
        var updateDto = new UpdateTodoTaskDto
        {
            Title = "Güncellenmiş API Dokümantasyonu",
            Description = "Güncellenmiş açıklama",
            Priority = Priority.Critical.ToString(),
            CompletionPercentage = 90
        };

        // Act
        var result = await _taskService.UpdateTaskAsync(userId, taskId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(updateDto.Title, result.Title);
        Assert.Equal(updateDto.Description, result.Description);
        Assert.Equal(updateDto.Priority, result.Priority.ToString());
        Assert.Equal(updateDto.CompletionPercentage, result.CompletionPercentage);

        // Database'de de güncellenmiş mi kontrol et
        var updatedTask = await _context.TodoTasks.FindAsync(taskId);
        Assert.Equal(updateDto.Title, updatedTask!.Title);
    }

    [Fact]
    public async Task UpdateTaskAsync_NonExistentTask_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var nonExistentTaskId = 999;
        var updateDto = new UpdateTodoTaskDto { Title = "Test" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.UpdateTaskAsync(userId, nonExistentTaskId, updateDto));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    [Fact]
    public async Task UpdateTaskAsync_TaskBelongsToAnotherUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var taskIdOfAnotherUser = 4;
        var updateDto = new UpdateTodoTaskDto { Title = "Test" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.UpdateTaskAsync(userId, taskIdOfAnotherUser, updateDto));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    [Fact]
    public async Task UpdateTaskAsync_InvalidCategory_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var taskId = 1;
        var updateDto = new UpdateTodoTaskDto 
        { 
            Title = "Test",
            CategoryId = 999 // Geçersiz kategori
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.UpdateTaskAsync(userId, taskId, updateDto));
        
        Assert.Contains("kategori", exception.Message);
    }

    #endregion

    #region DeleteTaskAsync Tests

    [Fact]
    public async Task DeleteTaskAsync_ValidTask_SoftDeletesTask()
    {
        // Arrange
        var userId = 1;
        var taskId = 3; // "Alışveriş Listesi" görevi

        // Act
        var result = await _taskService.DeleteTaskAsync(userId, taskId);

        // Assert
        Assert.True(result);

        // Soft delete yapılmış mı kontrol et
        var deletedTask = await _context.TodoTasks.FindAsync(taskId);
        Assert.NotNull(deletedTask);
        Assert.False(deletedTask.IsActive);
    }

    [Fact]
    public async Task DeleteTaskAsync_NonExistentTask_ReturnsFalse()
    {
        // Arrange
        var userId = 1;
        var nonExistentTaskId = 999;

        // Act
        var result = await _taskService.DeleteTaskAsync(userId, nonExistentTaskId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteTaskAsync_TaskBelongsToAnotherUser_ReturnsFalse()
    {
        // Arrange
        var userId = 1;
        var taskIdOfAnotherUser = 4;

        // Act
        var result = await _taskService.DeleteTaskAsync(userId, taskIdOfAnotherUser);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteTaskAsync_TaskWithSubTasks_DeletesAllSubTasks()
    {
        // Arrange
        var userId = 1;
        var parentTaskId = 1; // Bu görevin alt görevi var

        // Act
        var result = await _taskService.DeleteTaskAsync(userId, parentTaskId);

        // Assert
        Assert.True(result);

        // Ana görev silinmiş mi kontrol et
        var deletedParentTask = await _context.TodoTasks.FindAsync(parentTaskId);
        Assert.False(deletedParentTask!.IsActive);

        // Alt görevler de silinmiş mi kontrol et
        var subTasks = await _context.TodoTasks
            .Where(t => t.ParentTaskId == parentTaskId)
            .ToListAsync();
        Assert.All(subTasks, t => Assert.False(t.IsActive));
    }

    #endregion

    #region CompleteTaskAsync Tests

    [Fact]
    public async Task CompleteTaskAsync_ValidTask_MarksAsCompleted()
    {
        // Arrange
        var userId = 1;
        var taskId = 3; // Tamamlanmamış görev
        var completeDto = new CompleteTaskDto { IsCompleted = true };

        // Act
        var result = await _taskService.CompleteTaskAsync(userId, taskId, completeDto);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsCompleted);
        Assert.Equal(100, result.CompletionPercentage);
        Assert.NotNull(result.CompletedAt);

        // Database'de de güncellenmiş mi kontrol et
        var completedTask = await _context.TodoTasks.FindAsync(taskId);
        Assert.True(completedTask!.IsCompleted);
    }

    [Fact]
    public async Task CompleteTaskAsync_AlreadyCompletedTask_ReturnsExistingTask()
    {
        // Arrange
        var userId = 1;
        var taskId = 2; // Zaten tamamlanmış görev
        var completeDto = new CompleteTaskDto { IsCompleted = true };

        // Act
        var result = await _taskService.CompleteTaskAsync(userId, taskId, completeDto);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsCompleted);
    }

    [Fact]
    public async Task CompleteTaskAsync_UncompleteTask_MarksAsIncomplete()
    {
        // Arrange
        var userId = 1;
        var taskId = 2; // Zaten tamamlanmış görev
        var completeDto = new CompleteTaskDto { IsCompleted = false };

        // Act
        var result = await _taskService.CompleteTaskAsync(userId, taskId, completeDto);

        // Assert
        Assert.NotNull(result);
        Assert.False(result.IsCompleted);
        Assert.Null(result.CompletedAt);
    }

    [Fact]
    public async Task CompleteTaskAsync_NonExistentTask_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var nonExistentTaskId = 999;
        var completeDto = new CompleteTaskDto { IsCompleted = true };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.CompleteTaskAsync(userId, nonExistentTaskId, completeDto));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    #endregion

    #region UpdateTaskProgressAsync Tests

    [Fact]
    public async Task UpdateTaskProgressAsync_ValidData_UpdatesProgress()
    {
        // Arrange
        var userId = 1;
        var taskId = 1;
        var progressPercentage = 85;

        // Act
        var result = await _taskService.UpdateTaskProgressAsync(userId, taskId, progressPercentage);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(85, result.CompletionPercentage);
        Assert.False(result.IsCompleted); // 100% değil, tamamlanmış sayılmaz

        // Database'de de güncellenmiş mi kontrol et
        var updatedTask = await _context.TodoTasks.FindAsync(taskId);
        Assert.Equal(85, updatedTask!.CompletionPercentage);
    }

    [Fact]
    public async Task UpdateTaskProgressAsync_HundredPercent_MarksAsCompleted()
    {
        // Arrange
        var userId = 1;
        var taskId = 3; // Tamamlanmamış görev
        var progressPercentage = 100;

        // Act
        var result = await _taskService.UpdateTaskProgressAsync(userId, taskId, progressPercentage);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(100, result.CompletionPercentage);
        Assert.True(result.IsCompleted);
        Assert.NotNull(result.CompletedAt);
    }

    [Fact]
    public async Task UpdateTaskProgressAsync_InvalidPercentage_ThrowsArgumentException()
    {
        // Arrange
        var userId = 1;
        var taskId = 1;
        var invalidPercentage = 150; // 100'den büyük

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _taskService.UpdateTaskProgressAsync(userId, taskId, invalidPercentage));
        
        Assert.Contains("0-100", exception.Message);
    }

    [Fact]
    public async Task UpdateTaskProgressAsync_NegativePercentage_ThrowsArgumentException()
    {
        // Arrange
        var userId = 1;
        var taskId = 1;
        var negativePercentage = -10;

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _taskService.UpdateTaskProgressAsync(userId, taskId, negativePercentage));
        
        Assert.Contains("0-100", exception.Message);
    }

    [Fact]
    public async Task UpdateTaskProgressAsync_NonExistentTask_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var nonExistentTaskId = 999;
        var progressPercentage = 50;

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.UpdateTaskProgressAsync(userId, nonExistentTaskId, progressPercentage));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    #endregion

    #region Search & Filter Tests

    [Fact]
    public async Task SearchTasksAsync_ValidSearchText_ReturnsMatchingTasks()
    {
        // Arrange
        var userId = 1;
        var searchText = "API";

        // Act
        var result = await _taskService.SearchTasksAsync(userId, searchText);

        // Assert
        Assert.NotNull(result);
        Assert.All(result, t => 
            Assert.True(t.Title.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
                       (t.Description != null && t.Description.Contains(searchText, StringComparison.OrdinalIgnoreCase))));
    }

    [Fact]
    public async Task SearchTasksAsync_EmptySearchText_ReturnsEmptyList()
    {
        // Arrange
        var userId = 1;
        var searchText = "";

        // Act
        var result = await _taskService.SearchTasksAsync(userId, searchText);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task SearchTasksAsync_NoMatchingTasks_ReturnsEmptyList()
    {
        // Arrange
        var userId = 1;
        var searchText = "NonExistentTask";

        // Act
        var result = await _taskService.SearchTasksAsync(userId, searchText);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task SearchTasksAsync_WithMaxResults_ReturnsLimitedResults()
    {
        // Arrange
        var userId = 1;
        var searchText = "a"; // Birçok görevde 'a' harfi var
        var maxResults = 2;

        // Act
        var result = await _taskService.SearchTasksAsync(userId, searchText, maxResults);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count <= maxResults);
    }

    [Fact]
    public async Task GetOverdueTasksAsync_ValidUser_ReturnsOverdueTasks()
    {
        // Arrange
        var userId = 1;

        // Geçmiş tarihli görev ekle
        var overdueTask = new TodoTask
        {
            UserId = userId,
            CategoryId = 1,
            Title = "Gecikmiş Görev",
            Priority = Priority.Normal,
            DueDate = DateTime.UtcNow.AddDays(-5),
            IsCompleted = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        };
        _context.TodoTasks.Add(overdueTask);
        await _context.SaveChangesAsync();

        // Act
        var result = await _taskService.GetOverdueTasksAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count > 0);
        Assert.All(result, t => 
        {
            Assert.True(t.DueDate.HasValue);
            Assert.True(t.DueDate.Value < DateTime.UtcNow);
            Assert.False(t.IsCompleted);
        });
    }

    [Fact]
    public async Task GetOverdueTasksAsync_NoOverdueTasks_ReturnsEmptyList()
    {
        // Arrange
        var userId = 2; // Bu kullanıcının gecikmiş görevi yok

        // Act
        var result = await _taskService.GetOverdueTasksAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetTasksDueTodayAsync_ValidUser_ReturnsTodayTasks()
    {
        // Arrange
        var userId = 1;
        var today = DateTime.Today; // Bugünün tarihini sabit tutuyoruz

        // Bugün vadesi gelen görev ekle
        var todayTask = new TodoTask
        {
            UserId = userId,
            CategoryId = 1,
            Title = "Bugün Vadesi Gelen Görev",
            Priority = Priority.Normal,
            DueDate = today,
            IsCompleted = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };
        _context.TodoTasks.Add(todayTask);
        await _context.SaveChangesAsync();

        // Act
        var result = await _taskService.GetTasksDueTodayAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count > 0);
        Assert.All(result, t => 
        {
            Assert.True(t.DueDate.HasValue);
            Assert.Equal(today, t.DueDate.Value.Date);
        });
    }

    [Fact]
    public async Task GetTasksDueThisWeekAsync_ValidUser_ReturnsWeekTasks()
    {
        // Arrange
        var userId = 1;

        // Bu hafta vadesi gelen görev ekle
        var thisWeekTask = new TodoTask
        {
            UserId = userId,
            CategoryId = 1,
            Title = "Bu Hafta Vadesi Gelen Görev",
            Priority = Priority.Normal,
            DueDate = DateTime.Today.AddDays(3), // Bugünden 3 gün sonra
            IsCompleted = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };
        _context.TodoTasks.Add(thisWeekTask);
        await _context.SaveChangesAsync();

        // Act
        var result = await _taskService.GetTasksDueThisWeekAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count > 0);
        
        // Eklediğimiz görevin döndüğünü kontrol et
        Assert.Contains(result, t => t.Title == "Bu Hafta Vadesi Gelen Görev");
        
        // Metodun bu hafta (bugünden 7 gün sonraya kadar) filtrelediğini kontrol et
        var today = DateTime.Today;
        var endOfWeek = today.AddDays(7);
        
        Assert.All(result, t => 
        {
            Assert.True(t.DueDate.HasValue);
            Assert.True(t.DueDate.Value.Date >= today);
            Assert.True(t.DueDate.Value.Date < endOfWeek);
        });
    }

    #endregion

    #region Hierarchy Operations Tests

    [Fact]
    public async Task GetSubTasksAsync_ValidParentTask_ReturnsSubTasks()
    {
        // Arrange
        var userId = 1;
        var parentTaskId = 1; // Bu görevin alt görevi var

        // Act
        var result = await _taskService.GetSubTasksAsync(userId, parentTaskId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count > 0);
        Assert.All(result, t => Assert.Equal(parentTaskId, t.ParentTaskId));
    }

    [Fact]
    public async Task GetSubTasksAsync_NoSubTasks_ReturnsEmptyList()
    {
        // Arrange
        var userId = 1;
        var taskWithoutSubTasks = 3;

        // Act
        var result = await _taskService.GetSubTasksAsync(userId, taskWithoutSubTasks);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task SetParentTaskAsync_ValidTasks_SetsParentRelation()
    {
        // Arrange
        var userId = 1;
        var taskId = 3; // Alt görev olacak
        var parentTaskId = 1; // Ana görev

        // Act
        var result = await _taskService.SetParentTaskAsync(userId, taskId, parentTaskId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(parentTaskId, result.ParentTaskId);

        // Database'de de güncellenmiş mi kontrol et
        var updatedTask = await _context.TodoTasks.FindAsync(taskId);
        Assert.Equal(parentTaskId, updatedTask!.ParentTaskId);
    }

    [Fact]
    public async Task SetParentTaskAsync_NonExistentTask_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var nonExistentTaskId = 999;
        var parentTaskId = 1;

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.SetParentTaskAsync(userId, nonExistentTaskId, parentTaskId));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    [Fact]
    public async Task SetParentTaskAsync_NonExistentParentTask_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var taskId = 3;
        var nonExistentParentTaskId = 999;

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.SetParentTaskAsync(userId, taskId, nonExistentParentTaskId));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    [Fact]
    public async Task SetParentTaskAsync_CircularReference_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var taskId = 1; // Ana görev
        var parentTaskId = 2; // Alt görev (1'in alt görevi)

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.SetParentTaskAsync(userId, taskId, parentTaskId));
        
        Assert.Contains("Circular reference", exception.Message);
    }

    [Fact]
    public async Task RemoveParentTaskAsync_ValidTask_RemovesParentRelation()
    {
        // Arrange
        var userId = 1;
        var taskId = 2; // Bu görevin parent'ı var

        // Act
        var result = await _taskService.RemoveParentTaskAsync(userId, taskId);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.ParentTaskId);

        // Database'de de güncellenmiş mi kontrol et
        var updatedTask = await _context.TodoTasks.FindAsync(taskId);
        Assert.Null(updatedTask!.ParentTaskId);
    }

    [Fact]
    public async Task RemoveParentTaskAsync_TaskWithoutParent_ReturnsTaskUnchanged()
    {
        // Arrange
        var userId = 1;
        var taskId = 3; // Bu görevin parent'ı yok

        // Act
        var result = await _taskService.RemoveParentTaskAsync(userId, taskId);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.ParentTaskId);
    }

    [Fact]
    public async Task RemoveParentTaskAsync_NonExistentTask_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var nonExistentTaskId = 999;

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _taskService.RemoveParentTaskAsync(userId, nonExistentTaskId));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    #endregion

    #region Business Rules Tests

    [Fact]
    public async Task CheckTaskDepthLimitAsync_ValidDepth_ReturnsTrue()
    {
        // Arrange
        var parentTaskId = 1; // Mevcut bir görev

        // Act
        var result = await _taskService.CheckTaskDepthLimitAsync(parentTaskId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task CheckCircularReferenceAsync_NoCircularReference_ReturnsTrue()
    {
        // Arrange
        var taskId = 3;
        var newParentId = 1;

        // Act
        var result = await _taskService.CheckCircularReferenceAsync(taskId, newParentId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task CheckCircularReferenceAsync_CircularReference_ReturnsFalse()
    {
        // Arrange
        var taskId = 1; // Ana görev
        var newParentId = 2; // Alt görev (1'in alt görevi)

        // Act
        var result = await _taskService.CheckCircularReferenceAsync(taskId, newParentId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CheckTaskLimitAsync_BelowLimit_ReturnsTrue()
    {
        // Arrange
        var userId = 1; // Bu kullanıcının az görevi var

        // Act
        var result = await _taskService.CheckTaskLimitAsync(userId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task CheckTaskDeletionAsync_TaskWithoutSubTasks_AllowsDeletion()
    {
        // Arrange
        var taskId = 3; // Alt görevi olmayan görev

        // Act
        var result = await _taskService.CheckTaskDeletionAsync(taskId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.CanDelete);
        Assert.Equal(0, result.SubTaskCount);
    }

    [Fact]
    public async Task CheckTaskDeletionAsync_TaskWithSubTasks_ShowsWarning()
    {
        // Arrange
        var taskId = 1; // Alt görevi olan görev

        // Act
        var result = await _taskService.CheckTaskDeletionAsync(taskId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.SubTaskCount > 0);
        Assert.True(result.Warnings.Count > 0);
    }

    #endregion

    #region Statistics Tests

    [Fact]
    public async Task GetTaskStatsAsync_ValidUser_ReturnsCorrectStats()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _taskService.GetTaskStatsAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.TotalTasks > 0);
        Assert.True(result.CompletedTasks >= 0);
        Assert.True(result.PendingTasks >= 0);
        Assert.Equal(result.TotalTasks, result.CompletedTasks + result.PendingTasks);
        Assert.True(result.CompletionRate >= 0 && result.CompletionRate <= 100);
    }

    [Fact]
    public async Task GetTaskStatsByCategoryAsync_ValidCategory_ReturnsStats()
    {
        // Arrange
        var userId = 1;
        var categoryId = 1;

        // Act
        var result = await _taskService.GetTaskStatsByCategoryAsync(userId, categoryId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.TotalTasks >= 0);
        Assert.True(result.CompletedTasks >= 0);
        Assert.True(result.PendingTasks >= 0);
    }

    [Fact]
    public async Task GetTaskStatsByCategoryAsync_InvalidCategory_ReturnsZeroStats()
    {
        // Arrange
        var userId = 1;
        var invalidCategoryId = 999;

        // Act
        var result = await _taskService.GetTaskStatsByCategoryAsync(userId, invalidCategoryId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalTasks);
        Assert.Equal(0, result.CompletedTasks);
        Assert.Equal(0, result.PendingTasks);
    }

    [Fact]
    public async Task GetTaskPriorityStatsAsync_ValidUser_ReturnsPriorityStats()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _taskService.GetTaskPriorityStatsAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count > 0);
        Assert.All(result, stat => 
        {
            Assert.True(stat.TaskCount >= 0);
            Assert.True(stat.CompletedCount >= 0);
            Assert.True(stat.CompletionRate >= 0 && stat.CompletionRate <= 100);
        });
    }

    [Fact]
    public async Task GetTaskPriorityStatsAsync_UserWithNoTasks_ReturnsEmptyStats()
    {
        // Arrange
        var userWithNoTasks = 999;

        // Act
        var result = await _taskService.GetTaskPriorityStatsAsync(userWithNoTasks);

        // Assert
        Assert.NotNull(result);
        // Boş kullanıcı için bile priority'ler döndürülür ama count'lar 0 olur
    }

    #endregion

    #region Helper Methods Tests

    [Fact]
    public async Task CalculateTaskDepthAsync_RootTask_ReturnsZero()
    {
        // Arrange
        var rootTaskId = 1; // Parent'ı olmayan görev

        // Act
        var result = await _taskService.CalculateTaskDepthAsync(rootTaskId);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public async Task CalculateTaskDepthAsync_SubTask_ReturnsCorrectDepth()
    {
        // Arrange
        var subTaskId = 2; // Parent'ı olan görev

        // Act
        var result = await _taskService.CalculateTaskDepthAsync(subTaskId);

        // Assert
        Assert.True(result > 0);
    }

    #endregion

    public void Dispose()
    {
        _context.Dispose();
    }
}
