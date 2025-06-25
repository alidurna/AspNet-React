using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Services;
using TaskFlow.API.Interfaces;
using TaskFlow.Tests.Helpers;
using UserStatsDto = TaskFlow.API.DTOs.UserStatsDto;
using Xunit;

namespace TaskFlow.Tests.Services;

/// <summary>
/// UserService unit testleri
/// </summary>
public class UserServiceTests : IDisposable
{
    private readonly TaskFlowDbContext _context;
    private readonly Mock<ILogger<UserService>> _mockLogger;
    private readonly Mock<IPasswordService> _mockPasswordService;
    private readonly Mock<IJwtService> _mockJwtService;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _context = TestDbContextFactory.CreateContextWithTestData();
        _mockLogger = new Mock<ILogger<UserService>>();
        _mockPasswordService = new Mock<IPasswordService>();
        _mockJwtService = new Mock<IJwtService>();
        _mockConfiguration = new Mock<IConfiguration>();
        
        // Mock setups
        _mockPasswordService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashedPassword");
        _mockPasswordService.Setup(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(true);
        
        _userService = new UserService(_context, _mockPasswordService.Object, _mockJwtService.Object, _mockLogger.Object, _mockConfiguration.Object);
    }

    [Fact]
    public async Task GetUserByIdAsync_ValidId_ReturnsUser()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _userService.GetUserByIdAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(userId, result.Id);
        Assert.Equal("test@example.com", result.Email);
    }

    [Fact]
    public async Task GetUserByEmailAsync_ValidEmail_ReturnsUser()
    {
        // Arrange
        var email = "test@example.com";

        // Act
        var result = await _userService.GetUserByEmailAsync(email);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(email, result.Email);
    }

    [Fact]
    public async Task IsEmailExistsAsync_ExistingEmail_ReturnsTrue()
    {
        // Arrange
        var existingEmail = "test@example.com";

        // Act
        var result = await _userService.IsEmailExistsAsync(existingEmail);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsEmailExistsAsync_NewEmail_ReturnsFalse()
    {
        // Arrange
        var newEmail = "newuser@test.com";

        // Act
        var result = await _userService.IsEmailExistsAsync(newEmail);

        // Assert
        Assert.False(result);
    }

    #region Authentication Tests

    [Fact]
    public async Task RegisterAsync_ValidData_CreatesUser()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "testuser@example.com",
            Password = "TestPassword123!",
            ConfirmPassword = "TestPassword123!"
        };

        // Act
        var result = await _userService.RegisterAsync(registerDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(registerDto.FirstName, result.User.FirstName);
        Assert.Equal(registerDto.LastName, result.User.LastName);
        Assert.Equal(registerDto.Email, result.User.Email);
        Assert.NotNull(result.Token);

        // Database'de de var mı kontrol et
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
        Assert.NotNull(user);
        Assert.True(user.IsActive);
    }

    [Fact]
    public async Task RegisterAsync_ExistingEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com", // Bu email zaten var
            Password = "TestPassword123!",
            ConfirmPassword = "TestPassword123!"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.RegisterAsync(registerDto));
        
        Assert.Contains("E-posta adresi zaten kullanımda", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsUserWithToken()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "Test123!"
        };

        // Act
        var result = await _userService.LoginAsync(loginDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(loginDto.Email, result.User.Email);
        Assert.NotNull(result.Token);
    }

    [Fact]
    public async Task LoginAsync_InvalidEmail_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "nonexistent@example.com",
            Password = "Test123!"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _userService.LoginAsync(loginDto));
        
        Assert.Contains("Geçersiz e-posta veya şifre", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "WrongPassword123!"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _userService.LoginAsync(loginDto));
        
        Assert.Contains("Geçersiz e-posta veya şifre", exception.Message);
    }

    #endregion

    #region Profile Update Tests

    [Fact]
    public async Task UpdateUserProfileAsync_ValidData_UpdatesUser()
    {
        // Arrange
        var userId = 1;
        var updateDto = new UpdateProfileDto
        {
            FirstName = "Güncellenmiş",
            LastName = "İsim",
            PhoneNumber = "555-0123"
        };

        // Act
        var result = await _userService.UpdateUserProfileAsync(userId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(updateDto.FirstName, result.FirstName);
        Assert.Equal(updateDto.LastName, result.LastName);
        Assert.Equal(updateDto.PhoneNumber, result.PhoneNumber);

        // Database'de de güncellenmiş mi kontrol et
        var updatedUser = await _context.Users.FindAsync(userId);
        Assert.Equal(updateDto.FirstName, updatedUser!.FirstName);
    }

    [Fact]
    public async Task UpdateUserProfileAsync_NonExistentUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var nonExistentUserId = 999;
        var updateDto = new UpdateProfileDto
        {
            FirstName = "Test",
            LastName = "User",
            PhoneNumber = "555-0123"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.UpdateUserProfileAsync(nonExistentUserId, updateDto));
        
        Assert.Contains("Kullanıcı bulunamadı", exception.Message);
    }

    #endregion

    #region Statistics Tests

    [Fact]
    public async Task GetUserStatsAsync_ValidUser_ReturnsCorrectStats()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _userService.GetUserStatsAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.TotalTasks >= 0);
        Assert.True(result.CompletedTasks >= 0);
        Assert.True(result.InProgressTasks >= 0);
        Assert.True(result.TaskCompletionRate >= 0 && result.TaskCompletionRate <= 100);
    }

    [Fact]
    public async Task GetUserStatsAsync_NonExistentUser_ReturnsEmptyStats()
    {
        // Arrange
        var nonExistentUserId = 999;

        // Act
        var result = await _userService.GetUserStatsAsync(nonExistentUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalTasks);
        Assert.Equal(0, result.CompletedTasks);
        Assert.Equal(0, result.InProgressTasks);
        Assert.Equal(0, result.TaskCompletionRate);
    }

    #endregion

    public void Dispose()
    {
        _context.Dispose();
    }
}
