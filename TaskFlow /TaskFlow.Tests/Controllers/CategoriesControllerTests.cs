using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using TaskFlow.API.Controllers;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using Xunit;

namespace TaskFlow.Tests.Controllers;

/// <summary>
/// CategoriesController unit testleri
/// </summary>
public class CategoriesControllerTests
{
    private readonly Mock<ICategoryService> _mockCategoryService;
    private readonly Mock<ILogger<CategoriesController>> _mockLogger;
    private readonly CategoriesController _controller;

    public CategoriesControllerTests()
    {
        _mockCategoryService = new Mock<ICategoryService>();
        _mockLogger = new Mock<ILogger<CategoriesController>>();
        _controller = new CategoriesController(_mockCategoryService.Object, _mockLogger.Object);
        
        // Mock user identity
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Email, "test@example.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        var principal = new ClaimsPrincipal(identity);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetCategories_ValidRequest_ReturnsOkResult()
    {
        // Arrange
        var expectedCategories = new List<CategoryDto>
        {
            new CategoryDto { Id = 1, Name = "Test Category" }
        };
        _mockCategoryService.Setup(x => x.GetCategoriesAsync(It.IsAny<int>(), It.IsAny<CategoryFilterDto>()))
            .ReturnsAsync(expectedCategories);

        // Act
        var result = await _controller.GetCategories(new CategoryFilterDto());

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseModel<List<CategoryDto>>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(expectedCategories, response.Data);
    }

    [Fact]
    public async Task GetCategory_ValidId_ReturnsOkResult()
    {
        // Arrange
        var expectedCategory = new CategoryDto { Id = 1, Name = "Test Category" };
        _mockCategoryService.Setup(x => x.GetCategoryByIdAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(expectedCategory);

        // Act
        var result = await _controller.GetCategory(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseModel<CategoryDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(expectedCategory, response.Data);
    }

    [Fact]
    public async Task GetCategory_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockCategoryService.Setup(x => x.GetCategoryByIdAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync((CategoryDto?)null);

        // Act
        var result = await _controller.GetCategory(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var response = Assert.IsType<ApiResponseModel<CategoryDto>>(notFoundResult.Value);
        Assert.False(response.Success);
    }
}
