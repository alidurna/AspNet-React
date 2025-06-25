using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using TaskFlow.API.Controllers;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using Xunit;

namespace TaskFlow.Tests.Controllers;

/// <summary>
/// TodoTasksController unit testleri
/// </summary>
public class TodoTasksControllerTests
{
    private readonly Mock<ITaskService> _mockTaskService;
    private readonly Mock<ILogger<TodoTasksController>> _mockLogger;
    private readonly TodoTasksController _controller;

    public TodoTasksControllerTests()
    {
        _mockTaskService = new Mock<ITaskService>();
        _mockLogger = new Mock<ILogger<TodoTasksController>>();
        
        _controller = new TodoTasksController(_mockTaskService.Object, _mockLogger.Object);
        
        // Mock user authentication
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "1"),
            new(ClaimTypes.Email, "test@example.com")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    #region GetTasks Tests

    [Fact]
    public async Task GetTasks_ValidRequest_ReturnsOkWithTasks()
    {
        // Arrange
        var filter = new TodoTaskFilterDto();
        var tasks = new List<TodoTaskDto>
        {
            new() { Id = 1, Title = "Test Task 1", UserId = 1 },
            new() { Id = 2, Title = "Test Task 2", UserId = 1 }
        };
        var pagination = new PaginationInfo { Page = 1, PageSize = 10, TotalCount = 2 };

        _mockTaskService.Setup(x => x.GetTasksAsync(1, filter))
            .ReturnsAsync((tasks, pagination));

        // Act
        var result = await _controller.GetTasks(filter);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<object>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
    }

    [Fact]
    public async Task GetTasks_ServiceThrowsException_ReturnsInternalServerError()
    {
        // Arrange
        var filter = new TodoTaskFilterDto();
        _mockTaskService.Setup(x => x.GetTasksAsync(1, filter))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.GetTasks(filter);

        // Assert
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusResult.StatusCode);
        var response = Assert.IsType<ApiResponseModel<object>>(statusResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region GetTaskById Tests

    [Fact]
    public async Task GetTaskById_ExistingTask_ReturnsOkWithTask()
    {
        // Arrange
        var taskId = 1;
        var task = new TodoTaskDto { Id = taskId, Title = "Test Task", UserId = 1 };

        _mockTaskService.Setup(x => x.GetTaskByIdAsync(1, taskId, false))
            .ReturnsAsync(task);

        // Act
        var result = await _controller.GetTask(taskId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<TodoTaskDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(taskId, response.Data.Id);
    }

    [Fact]
    public async Task GetTaskById_NonExistentTask_ReturnsNotFound()
    {
        // Arrange
        var taskId = 999;
        _mockTaskService.Setup(x => x.GetTaskByIdAsync(1, taskId, false))
            .ReturnsAsync((TodoTaskDto?)null);

        // Act
        var result = await _controller.GetTask(taskId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<object>>(notFoundResult.Value);
        Assert.False(response.Success);
        Assert.Contains("Görev bulunamadı", response.Message);
    }

    #endregion

    #region CreateTask Tests

    [Fact]
    public async Task CreateTask_ValidData_ReturnsCreatedWithTask()
    {
        // Arrange
        var createDto = new CreateTodoTaskDto
        {
            Title = "New Task",
            Description = "Task description",
            CategoryId = 1,
            Priority = "Normal"
        };

        var createdTask = new TodoTaskDto
        {
            Id = 1,
            Title = createDto.Title,
            Description = createDto.Description,
            UserId = 1
        };

        _mockTaskService.Setup(x => x.CreateTaskAsync(1, createDto))
            .ReturnsAsync(createdTask);

        // Act
        var result = await _controller.CreateTask(createDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<ApiResponseModel<TodoTaskDto>>(createdResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(createDto.Title, response.Data.Title);
    }

    [Fact]
    public async Task CreateTask_InvalidData_ReturnsBadRequest()
    {
        // Arrange
        var createDto = new CreateTodoTaskDto(); // Boş DTO - validation fail
        _controller.ModelState.AddModelError("Title", "Title is required");

        // Act
        var result = await _controller.CreateTask(createDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<object>>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region UpdateTask Tests

    [Fact]
    public async Task UpdateTask_ValidData_ReturnsOkWithUpdatedTask()
    {
        // Arrange
        var taskId = 1;
        var updateDto = new UpdateTodoTaskDto
        {
            Title = "Updated Task",
            Priority = "High"
        };

        var updatedTask = new TodoTaskDto
        {
            Id = taskId,
            Title = updateDto.Title,
            Priority = updateDto.Priority,
            UserId = 1
        };

        _mockTaskService.Setup(x => x.UpdateTaskAsync(1, taskId, updateDto))
            .ReturnsAsync(updatedTask);

        // Act
        var result = await _controller.UpdateTask(taskId, updateDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<TodoTaskDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(updateDto.Title, response.Data.Title);
    }

    [Fact]
    public async Task UpdateTask_NonExistentTask_ReturnsNotFound()
    {
        // Arrange
        var taskId = 999;
        var updateDto = new UpdateTodoTaskDto { Title = "Updated Task" };

        _mockTaskService.Setup(x => x.UpdateTaskAsync(1, taskId, updateDto))
            .ThrowsAsync(new InvalidOperationException("Görev bulunamadı"));

        // Act
        var result = await _controller.UpdateTask(taskId, updateDto);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<object>>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region DeleteTask Tests

    [Fact]
    public async Task DeleteTask_ExistingTask_ReturnsOk()
    {
        // Arrange
        var taskId = 1;
        _mockTaskService.Setup(x => x.DeleteTaskAsync(1, taskId))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteTask(taskId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<object>>(okResult.Value);
        Assert.True(response.Success);
    }

    [Fact]
    public async Task DeleteTask_NonExistentTask_ReturnsNotFound()
    {
        // Arrange
        var taskId = 999;
        _mockTaskService.Setup(x => x.DeleteTaskAsync(1, taskId))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteTask(taskId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<object>>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region CompleteTask Tests

    [Fact]
    public async Task CompleteTask_ValidRequest_ReturnsOkWithCompletedTask()
    {
        // Arrange
        var taskId = 1;
        var completeDto = new CompleteTaskDto { IsCompleted = true };
        var completedTask = new TodoTaskDto
        {
            Id = taskId,
            IsCompleted = true,
            CompletionPercentage = 100,
            UserId = 1
        };

        _mockTaskService.Setup(x => x.CompleteTaskAsync(1, taskId, completeDto))
            .ReturnsAsync(completedTask);

        // Act
        var result = await _controller.CompleteTask(taskId, completeDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<TodoTaskDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.True(response.Data.IsCompleted);
    }

    #endregion

    #region SearchTasks Tests

    [Fact]
    public async Task SearchTasks_ValidQuery_ReturnsOkWithResults()
    {
        // Arrange
        var searchText = "test";
        var searchResults = new List<TodoTaskDto>
        {
            new() { Id = 1, Title = "Test Task", UserId = 1 }
        };

        _mockTaskService.Setup(x => x.SearchTasksAsync(1, searchText, 50))
            .ReturnsAsync(searchResults);

        // Act
        var result = await _controller.SearchTasks(searchText);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<List<TodoTaskDto>>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Single(response.Data);
    }

    #endregion

    #region GetTaskStats Tests

    [Fact]
    public async Task GetTaskStats_ValidRequest_ReturnsOkWithStats()
    {
        // Arrange
        var stats = new TaskStatsDto
        {
            TotalTasks = 10,
            CompletedTasks = 5,
            PendingTasks = 5,
            CompletionRate = 50
        };

        _mockTaskService.Setup(x => x.GetTaskStatsAsync(1))
            .ReturnsAsync(stats);

        // Act
        var result = await _controller.GetTaskStatistics();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponseModel<TaskStatsDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(10, response.Data.TotalTasks);
    }

    #endregion
} 