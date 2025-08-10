using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Services;
using TaskFlow.API.Interfaces;
using TaskFlow.Tests.Helpers;
using AutoMapper;
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
    private readonly IConfiguration _configuration;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<ICacheService> _mockCacheService;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _context = TestDbContextFactory.CreateContextWithTestData();
        _mockLogger = new Mock<ILogger<UserService>>();
        _mockPasswordService = new Mock<IPasswordService>();
        _mockJwtService = new Mock<IJwtService>();
        
        // Create real configuration for JWT settings
        var configurationBuilder = new ConfigurationBuilder();
        configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
        {
            {"JwtSettings:ExpiryInMinutes", "60"},
            {"Jwt:AccessTokenExpirationMinutes", "60"},
            {"Cache:UsersCache:ExpirationMinutes", "60"},
            {"Cache:StatisticsCache:ExpirationMinutes", "5"}
        });
        _configuration = configurationBuilder.Build();
        
        // Mock setups
        _mockPasswordService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashedPassword");
        _mockPasswordService.Setup(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(true);
        
        // Password validation mocks
        _mockPasswordService.Setup(x => x.ValidatePassword(It.IsAny<string>()))
            .Returns(new PasswordValidationResult { IsValid = true, Errors = new List<string>() });
        _mockPasswordService.Setup(x => x.ValidatePasswordConfirmation(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(true);

        // JWT Service mock
        _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("mock-jwt-token");
        
        // AutoMapper mock setup
        _mockMapper = new Mock<IMapper>();
        _mockMapper.Setup(x => x.Map<UserDto>(It.IsAny<User>()))
            .Returns((User user) => new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            });
        
        // Cache service mock setup
        _mockCacheService = new Mock<ICacheService>();
        _mockCacheService.Setup(x => x.GetAsync<UserDto>(It.IsAny<string>()))
            .ReturnsAsync((UserDto?)null); // Cache'te veri yok, database'ten alacak
        _mockCacheService.Setup(x => x.SetAsync(It.IsAny<string>(), It.IsAny<UserDto>(), It.IsAny<TimeSpan>()))
            .Returns(Task.CompletedTask);
        _mockCacheService.Setup(x => x.RemoveAsync(It.IsAny<string>()))
            .Returns(Task.CompletedTask);
        _mockCacheService.Setup(x => x.GetOrCreateAsync<UserStatsDto>(It.IsAny<string>(), It.IsAny<Func<Task<UserStatsDto>>>(), It.IsAny<TimeSpan>()))
            .Returns(async (string key, Func<Task<UserStatsDto>> factory, TimeSpan expiration) => await factory());
        
        var mockMailService = new Mock<MailService>(_configuration);
        
        _userService = new UserService(
            _context,
            _mockPasswordService.Object,
            _mockJwtService.Object,
            _mockLogger.Object,
            _configuration,
            _mockMapper.Object,
            _mockCacheService.Object,
            mockMailService.Object
        );
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
        
        Assert.Contains("Bu email adresi zaten kayıtlı", exception.Message);
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
        
        Assert.Contains("Geçersiz email veya şifre", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "WrongPassword"
        };

        // Password verify mock'unu false döndürecek şekilde ayarla
        _mockPasswordService.Setup(x => x.VerifyPassword("WrongPassword", It.IsAny<string>()))
            .Returns(false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _userService.LoginAsync(loginDto));
        
        Assert.Contains("Geçersiz email veya şifre", exception.Message);
    }

    #endregion

    #region Profile Management Tests

    [Fact]
    public async Task UpdateUserProfileAsync_ValidData_UpdatesUser()
    {
        // Arrange
        var userId = 1;
        var updateDto = new UpdateProfileDto
        {
            FirstName = "Updated",
            LastName = "User",
            PhoneNumber = "1234567890"
        };

        // Act
        var result = await _userService.UpdateUserProfileAsync(userId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(updateDto.FirstName, result.FirstName);
        Assert.Equal(updateDto.LastName, result.LastName);
        Assert.Equal(updateDto.PhoneNumber, result.PhoneNumber);
    }

    [Fact]
    public async Task UpdateUserProfileAsync_NonExistentUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 999;
        var updateDto = new UpdateProfileDto
        {
            FirstName = "Updated",
            LastName = "User"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.UpdateUserProfileAsync(userId, updateDto));
        
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
        Assert.True(result.PendingTasks >= 0);
    }

    [Fact]
    public async Task GetUserStatsAsync_NonExistentUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 999;

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.GetUserStatsAsync(userId));
        
        Assert.Contains("Kullanıcı bulunamadı", exception.Message);
    }

    #endregion

    public void Dispose()
    {
        _context.Dispose();
    }
}
