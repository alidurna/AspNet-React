using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using TaskFlow.API.Controllers;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using Xunit;

namespace TaskFlow.Tests.Controllers;

/// <summary>
/// UsersController unit testleri
/// </summary>
public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<ILogger<UsersController>> _mockLogger;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _mockLogger = new Mock<ILogger<UsersController>>();
        
        _controller = new UsersController(_mockUserService.Object, _mockLogger.Object);
        
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

    #region Register Tests

    [Fact]
    public async Task Register_ValidData_ReturnsOkWithAuthResponse()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Password = "Test123!",
            ConfirmPassword = "Test123!"
        };

        var authResponse = new AuthResponseDto
        {
            Token = "jwt-token",
            ExpiresInMinutes = 60,
            User = new UserDto { Id = 1, Email = registerDto.Email }
        };

        _mockUserService.Setup(x => x.RegisterAsync(registerDto))
            .ReturnsAsync(authResponse);

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<AuthResponseDto>>>(result);
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<AuthResponseDto>>(createdResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
    }

    [Fact]
    public async Task Register_InvalidData_ReturnsBadRequest()
    {
        // Arrange
        var registerDto = new RegisterDto(); // Boş DTO
        _controller.ModelState.AddModelError("Email", "Email is required");

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<AuthResponseDto>>>(result);
        var badRequestResult = Assert.IsType<ObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<object>>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "existing@example.com",
            Password = "Test123!"
        };

        _mockUserService.Setup(x => x.RegisterAsync(registerDto))
            .ThrowsAsync(new InvalidOperationException("Email already exists"));

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<AuthResponseDto>>>(result);
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<object>>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region Login Tests

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithAuthResponse()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "Test123!"
        };

        var authResponse = new AuthResponseDto
        {
            Token = "jwt-token",
            ExpiresInMinutes = 60,
            User = new UserDto { Id = 1, Email = loginDto.Email }
        };

        _mockUserService.Setup(x => x.LoginAsync(loginDto))
            .ReturnsAsync(authResponse);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<AuthResponseDto>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<AuthResponseDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        _mockUserService.Setup(x => x.LoginAsync(loginDto))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<AuthResponseDto>>>(result);
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<object>>(unauthorizedResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region GetProfile Tests

    [Fact]
    public async Task GetProfile_ValidUser_ReturnsOkWithUserData()
    {
        // Arrange
        var user = new UserDto
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User"
        };

        _mockUserService.Setup(x => x.GetUserByIdAsync(1))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetProfile();

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<UserDto>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<UserDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(user.Email, response.Data.Email);
    }

    [Fact]
    public async Task GetProfile_UserNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockUserService.Setup(x => x.GetUserByIdAsync(1))
            .ReturnsAsync((UserDto?)null);

        // Act
        var result = await _controller.GetProfile();

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<UserDto>>>(result);
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<object>>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region UpdateProfile Tests

    [Fact]
    public async Task UpdateProfile_ValidData_ReturnsOkWithUpdatedUser()
    {
        // Arrange
        var updateDto = new UpdateProfileDto
        {
            FirstName = "Updated",
            LastName = "Name"
        };

        var updatedUser = new UserDto
        {
            Id = 1,
            Email = "test@example.com",
            FirstName = updateDto.FirstName,
            LastName = updateDto.LastName
        };

        _mockUserService.Setup(x => x.UpdateUserProfileAsync(1, updateDto))
            .ReturnsAsync(updatedUser);

        // Act
        var result = await _controller.UpdateProfile(updateDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<UserDto>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<UserDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(updateDto.FirstName, response.Data.FirstName);
    }

    [Fact]
    public async Task UpdateProfile_InvalidData_ReturnsBadRequest()
    {
        // Arrange
        var updateDto = new UpdateProfileDto
        {
            FirstName = "", // Invalid data
            LastName = ""
        };

        _mockUserService.Setup(x => x.UpdateUserProfileAsync(1, updateDto))
            .ThrowsAsync(new InvalidOperationException("FirstName is required"));

        // Act
        var result = await _controller.UpdateProfile(updateDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<UserDto>>>(result);
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<object>>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region GetUserStats Tests

    [Fact]
    public async Task GetUserStats_ValidUser_ReturnsOkWithStats()
    {
        // Arrange
        var stats = new UserStatsDto
        {
            TotalTasks = 10,
            CompletedTasks = 5,
            InProgressTasks = 2
        };

        _mockUserService.Setup(x => x.GetUserStatsAsync(1))
            .ReturnsAsync(stats);

        // Act
        var result = await _controller.GetUserStatistics();

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<UserStatsDto>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<UserStatsDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(10, response.Data.TotalTasks);
    }

    #endregion

    #region ChangePassword Tests

    [Fact]
    public async Task ChangePassword_ValidData_ReturnsOk()
    {
        // Arrange
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "CurrentPass123!",
            NewPassword = "NewPass123!",
            ConfirmNewPassword = "NewPass123!"
        };

        _mockUserService.Setup(x => x.ChangePasswordAsync(1, changePasswordDto))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<object>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<object>>(okResult.Value);
        Assert.True(response.Success);
    }

    [Fact]
    public async Task ChangePassword_InvalidCurrentPassword_ReturnsBadRequest()
    {
        // Arrange
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "WrongPassword",
            NewPassword = "NewPass123!",
            ConfirmNewPassword = "NewPass123!"
        };

        _mockUserService.Setup(x => x.ChangePasswordAsync(1, changePasswordDto))
            .ThrowsAsync(new InvalidOperationException("Current password is incorrect"));

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        var actionResult = Assert.IsType<ActionResult<ApiResponseModel<object>>>(result);
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        var response = Assert.IsType<ApiResponseModel<object>>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    #endregion
} 