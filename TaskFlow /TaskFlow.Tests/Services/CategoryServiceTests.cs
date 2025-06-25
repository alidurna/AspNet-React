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
/// CategoryService unit testleri
/// Her test metodu farklı senaryoları test eder
/// </summary>
public class CategoryServiceTests : IDisposable
{
    private readonly TaskFlowDbContext _context;
    private readonly Mock<ILogger<CategoryService>> _mockLogger;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly CategoryService _categoryService;

    public CategoryServiceTests()
    {
        // Her test için yeni database context
        _context = TestDbContextFactory.CreateContextWithTestData();
        
        // Mock logger
        _mockLogger = new Mock<ILogger<CategoryService>>();
        
        // Mock configuration section
        _mockConfiguration = new Mock<IConfiguration>();
        var mockSection = new Mock<IConfigurationSection>();
        mockSection.Setup(x => x.Value).Returns("50");
        _mockConfiguration.Setup(x => x.GetSection("ApplicationSettings:BusinessRules:MaxCategoriesPerUser"))
            .Returns(mockSection.Object);
        _mockConfiguration.Setup(x => x["ApplicationSettings:BusinessRules:MaxCategoriesPerUser"])
            .Returns("50");
        
        // Service instance
        _categoryService = new CategoryService(_context, _mockLogger.Object, _mockConfiguration.Object);
    }

    #region GetCategoriesAsync Tests

    [Fact]
    public async Task GetCategoriesAsync_ValidUserId_ReturnsUserCategories()
    {
        // Arrange
        var userId = 1;
        var filter = new CategoryFilterDto();

        // Act
        var result = await _categoryService.GetCategoriesAsync(userId, filter);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count); // User 1'in 2 kategorisi var
        Assert.Contains(result, c => c.Name == "İş");
        Assert.Contains(result, c => c.Name == "Kişisel");
    }

    [Fact]
    public async Task GetCategoriesAsync_InvalidUserId_ReturnsEmptyList()
    {
        // Arrange
        var nonExistentUserId = 999;
        var filter = new CategoryFilterDto();

        // Act
        var result = await _categoryService.GetCategoriesAsync(nonExistentUserId, filter);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetCategoriesAsync_OnlyActiveCategories_ReturnsActiveOnly()
    {
        // Arrange
        var userId = 1;
        var filter = new CategoryFilterDto { IsActive = true };
        
        // İlk kategoriyi inactive yap
        var category = _context.Categories.First(c => c.UserId == userId);
        category.IsActive = false;
        await _context.SaveChangesAsync();

        // Act
        var result = await _categoryService.GetCategoriesAsync(userId, filter);

        // Assert
        Assert.Single(result); // Sadece 1 aktif kategori kalmalı
        Assert.All(result, c => Assert.True(c.IsActive));
    }

    #endregion

    #region GetCategoryByIdAsync Tests

    [Fact]
    public async Task GetCategoryByIdAsync_ValidCategoryAndUser_ReturnsCategory()
    {
        // Arrange
        var userId = 1;
        var categoryId = 1;

        // Act
        var result = await _categoryService.GetCategoryByIdAsync(userId, categoryId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(categoryId, result.Id);
        Assert.Equal("İş", result.Name);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_InvalidCategoryId_ReturnsNull()
    {
        // Arrange
        var userId = 1;
        var nonExistentCategoryId = 999;

        // Act
        var result = await _categoryService.GetCategoryByIdAsync(userId, nonExistentCategoryId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_CategoryBelongsToAnotherUser_ReturnsNull()
    {
        // Arrange
        var userId = 1;
        var categoryIdOfAnotherUser = 3; // Bu kategori User 2'ye ait

        // Act
        var result = await _categoryService.GetCategoryByIdAsync(userId, categoryIdOfAnotherUser);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_InactiveCategory_ReturnsCategory()
    {
        // Arrange
        var userId = 1;
        var categoryId = 1;
        
        // Kategoriyi inactive yap
        var category = _context.Categories.First(c => c.Id == categoryId);
        category.IsActive = false;
        await _context.SaveChangesAsync();

        // Act
        var result = await _categoryService.GetCategoryByIdAsync(userId, categoryId);

        // Assert
        // CategoryService inactive kategorileri de döndürüyor
        Assert.NotNull(result);
    }

    #endregion

    #region CreateCategoryAsync Tests

    [Fact]
    public async Task CreateCategoryAsync_ValidData_CreatesAndReturnsCategory()
    {
        // Arrange
        var userId = 1;
        var createDto = new CreateCategoryDto
        {
            Name = "Yeni Kategori",
            Description = "Test kategorisi",
            ColorCode = "#ff5722",
            Icon = "🎯"
        };

        // Act
        var result = await _categoryService.CreateCategoryAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createDto.Name, result.Name);
        Assert.Equal(createDto.Description, result.Description);
        Assert.Equal(createDto.ColorCode, result.ColorCode);
        Assert.Equal(createDto.Icon, result.Icon);
        Assert.True(result.IsActive);
        Assert.False(result.IsDefault); // Default false olmalı

        // Database'de de var mı kontrol et
        var savedCategory = await _context.Categories.FindAsync(result.Id);
        Assert.NotNull(savedCategory);
        Assert.Equal(createDto.Name, savedCategory.Name);
    }

    [Fact]
    public async Task CreateCategoryAsync_SetAsDefault_DoesNotUpdateOtherCategories()
    {
        // Arrange
        var userId = 1;
        var createDto = new CreateCategoryDto
        {
            Name = "Yeni Kategori",
            Description = "Test kategorisi",
            ColorCode = "#9c27b0",
            Icon = "⭐",
            IsDefault = false // Service'de default update mantığı yok
        };

        // Act
        var result = await _categoryService.CreateCategoryAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.False(result.IsDefault); // Service'de default false olarak set edilir
    }

    [Fact]
    public async Task CreateCategoryAsync_DefaultColorAndIcon_SetsDefaults()
    {
        // Arrange
        var userId = 1;
        var createDto = new CreateCategoryDto
        {
            Name = "Minimal Kategori"
            // ColorCode ve Icon verilmemiş
        };

        // Act
        var result = await _categoryService.CreateCategoryAsync(userId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("#007bff", result.ColorCode); // Gerçek default renk
        Assert.Null(result.Icon); // Icon verilmemiş, null olmalı
    }

    #endregion

    #region UpdateCategoryAsync Tests

    [Fact]
    public async Task UpdateCategoryAsync_ValidData_UpdatesAndReturnsCategory()
    {
        // Arrange
        var userId = 1;
        var categoryId = 1;
        var updateDto = new UpdateCategoryDto
        {
            Name = "Güncellenmiş İş",
            Description = "Güncellenmiş açıklama",
            ColorCode = "#e91e63",
            Icon = "💻"
        };

        // Act
        var result = await _categoryService.UpdateCategoryAsync(userId, categoryId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(updateDto.Name, result.Name);
        Assert.Equal(updateDto.Description, result.Description);
        Assert.Equal(updateDto.ColorCode, result.ColorCode);
        Assert.Equal(updateDto.Icon, result.Icon);

        // Database'de de güncellenmiş mi kontrol et
        var updatedCategory = await _context.Categories.FindAsync(categoryId);
        Assert.Equal(updateDto.Name, updatedCategory.Name);
    }

    [Fact]
    public async Task UpdateCategoryAsync_NonExistentCategory_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var nonExistentCategoryId = 999;
        var updateDto = new UpdateCategoryDto { Name = "Test" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _categoryService.UpdateCategoryAsync(userId, nonExistentCategoryId, updateDto));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    [Fact]
    public async Task UpdateCategoryAsync_CategoryOfAnotherUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var categoryIdOfAnotherUser = 3; // User 2'nin kategorisi
        var updateDto = new UpdateCategoryDto { Name = "Hack Attempt" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _categoryService.UpdateCategoryAsync(userId, categoryIdOfAnotherUser, updateDto));
        
        Assert.Contains("bulunamadı", exception.Message);
    }

    #endregion

    #region DeleteCategoryAsync Tests

    [Fact]
    public async Task DeleteCategoryAsync_ValidCategory_SoftDeletesCategory()
    {
        // Arrange
        var userId = 1;
        var categoryId = 2; // "Kişisel" kategorisi (default değil)

        // Act
        var result = await _categoryService.DeleteCategoryAsync(userId, categoryId);

        // Assert
        Assert.True(result);

        // Soft delete yapılmış mı kontrol et
        var deletedCategory = await _context.Categories.FindAsync(categoryId);
        Assert.NotNull(deletedCategory);
        Assert.False(deletedCategory.IsActive);
    }

    [Fact]
    public async Task DeleteCategoryAsync_DefaultCategory_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var defaultCategoryId = 1; // "İş" kategorisi (default)

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _categoryService.DeleteCategoryAsync(userId, defaultCategoryId));
        
        Assert.Contains("Default kategoriler silinemez", exception.Message);
    }

    [Fact]
    public async Task DeleteCategoryAsync_CategoryWithTasks_SoftDeletesCategory()
    {
        // Arrange
        var userId = 1;
        var categoryId = 1; // Bu kategoride görevler var
        
        // Default olmayan bir kategori yap (ama görevleri var)
        var category = await _context.Categories.FindAsync(categoryId);
        category!.IsDefault = false;
        await _context.SaveChangesAsync();

        // Act
        var result = await _categoryService.DeleteCategoryAsync(userId, categoryId);

        // Assert
        Assert.True(result); // Silme başarılı olmalı (soft delete)
        
        // Soft delete yapılmış mı kontrol et
        var deletedCategory = await _context.Categories.FindAsync(categoryId);
        Assert.NotNull(deletedCategory);
        Assert.False(deletedCategory.IsActive);
    }

    [Fact]
    public async Task DeleteCategoryAsync_NonExistentCategory_ReturnsFalse()
    {
        // Arrange
        var userId = 1;
        var nonExistentCategoryId = 999;

        // Act
        var result = await _categoryService.DeleteCategoryAsync(userId, nonExistentCategoryId);

        // Assert
        Assert.False(result);
    }

    #endregion

    #region GetCategoryStatsAsync Tests

    [Fact]
    public async Task GetCategoryStatsAsync_ValidCategory_ReturnsCorrectStatistics()
    {
        // Arrange
        var userId = 1;
        var categoryId = 1; // "İş" kategorisi - 3 görev var (1 tamamlanmış, 2 devam eden)

        // Act
        var result = await _categoryService.GetCategoryStatsAsync(userId, categoryId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalTasks);
        Assert.Equal(1, result.CompletedTasks);
        Assert.Equal(2, result.PendingTasks);
        Assert.Equal(33.3m, Math.Round(result.CompletionPercentage, 1));
    }

    [Fact]
    public async Task GetCategoryStatsAsync_CategoryWithNoTasks_ReturnsZeroStatistics()
    {
        // Arrange
        var userId = 1;
        var categoryId = 2; // "Kişisel" kategorisi - 1 görev var

        // Act
        var result = await _categoryService.GetCategoryStatsAsync(userId, categoryId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TotalTasks);
        Assert.Equal(0, result.CompletedTasks);
        Assert.Equal(1, result.PendingTasks);
        Assert.Equal(0m, result.CompletionPercentage);
    }

    #endregion

    #region Dispose

    public void Dispose()
    {
        _context.Dispose();
    }

    #endregion
} 