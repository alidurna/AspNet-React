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
        var mockSection = new Mock<IConfigurationSection>();
        mockSection.Setup(x => x.Value).Returns("50");
        _mockConfiguration.Setup(x => x.GetSection("ApplicationSettings:BusinessRules:MaxTasksPerUser"))
            .Returns(mockSection.Object);
        
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
        var filter = new TodoTaskFilterDto { Priority = "High" };

        // Act
        var (tasks, _) = await _taskService.GetTasksAsync(userId, filter);

        // Assert
        Assert.NotNull(tasks);
        Assert.All(tasks, t => Assert.Equal("High", t.Priority));
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
            Priority = "Normal",
            DueDate = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var result = await _taskService.CreateTaskAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createDto.Title, result.Title);
        Assert.Equal(createDto.Description, result.Description);
        Assert.Equal(createDto.CategoryId, result.CategoryId);
        Assert.Equal(createDto.Priority, result.Priority);
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
            Priority = "Low",
            ParentTaskId = parentTaskId
        };

        // Act
        var result = await _taskService.CreateTaskAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(parentTaskId, result.ParentTaskId);
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
            Priority = "Critical",
            CompletionPercentage = 90
        };

        // Act
        var result = await _taskService.UpdateTaskAsync(userId, taskId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(updateDto.Title, result.Title);
        Assert.Equal(updateDto.Description, result.Description);
        Assert.Equal(updateDto.Priority, result.Priority);
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
                       t.Description.Contains(searchText, StringComparison.OrdinalIgnoreCase)));
    }

    [Fact]
    public async Task GetOverdueTasksAsync_ValidUser_ReturnsOverdueTasks()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _taskService.GetOverdueTasksAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.All(result, t => 
        {
            Assert.True(t.DueDate.HasValue);
            Assert.True(t.DueDate.Value < DateTime.UtcNow);
            Assert.False(t.IsCompleted);
        });
    }

    [Fact]
    public async Task GetTasksDueTodayAsync_ValidUser_ReturnsTodayTasks()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _taskService.GetTasksDueTodayAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.All(result, t => 
        {
            Assert.True(t.DueDate.HasValue);
            Assert.Equal(DateTime.UtcNow.Date, t.DueDate.Value.Date);
        });
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
        Assert.True(result.TotalTasks >= 3); // En az 3 görev var
        Assert.True(result.CompletedTasks >= 1); // En az 1 tamamlanmış
        Assert.True(result.PendingTasks >= 2); // En az 2 beklemede
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
        Assert.True(result.CompletionRate >= 0 && result.CompletionRate <= 100);
    }

    #endregion

    #region SubTask Tests

    [Fact]
    public async Task GetSubTasksAsync_ValidParentTask_ReturnsSubTasks()
    {
        // Arrange
        var userId = 1;
        var parentTaskId = 1; // Bu görevin alt görevleri var

        // Act
        var result = await _taskService.GetSubTasksAsync(userId, parentTaskId);

        // Assert
        Assert.NotNull(result);
        Assert.All(result, t => Assert.Equal(parentTaskId, t.ParentTaskId));
    }

    [Fact]
    public async Task SetParentTaskAsync_ValidTasks_SetsParentRelation()
    {
        // Arrange
        var userId = 1;
        var taskId = 3; // Bağımsız görev
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

    #endregion

    public void Dispose()
    {
        _context.Dispose();
    }
}
