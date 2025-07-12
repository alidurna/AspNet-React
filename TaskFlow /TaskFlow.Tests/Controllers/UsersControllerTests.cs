using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using TaskFlow.API.Controllers;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using Xunit;
using System.Threading.Tasks;

namespace TaskFlow.Tests.Controllers
{
    public class UserProfileControllerTests
    {
        private readonly Mock<IUserService> _mockUserService;
        private readonly Mock<ILogger<UsersController>> _mockLogger;
        private readonly UsersController _controller;

        public UserProfileControllerTests()
        {
            _mockUserService = new Mock<IUserService>();
            _mockLogger = new Mock<ILogger<UsersController>>();
            _controller = new UsersController(_mockUserService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetProfile_ReturnsOkResult_WhenUserExists()
        {
            // Arrange
            var userId = 1;
            var expectedProfile = new UserProfileDto 
            { 
                Id = userId.ToString(),
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User"
            };

            // Mock ClaimsPrincipal
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
            
            _mockUserService.Setup(service => service.GetUserProfileAsync(userId.ToString()))
                .ReturnsAsync(expectedProfile);

            // Act
            var result = await _controller.GetProfile();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseModel<UserProfileDto>>(okResult.Value);
            var returnedProfile = response.Data;
            Assert.Equal(expectedProfile.Email, returnedProfile.Email);
            Assert.Equal(expectedProfile.FirstName, returnedProfile.FirstName);
            Assert.Equal(expectedProfile.LastName, returnedProfile.LastName);
        }

        [Fact]
        public async Task UpdateProfile_ReturnsOkResult_WhenUpdateSuccessful()
        {
            // Arrange
            var userId = 1;
            var updateDto = new UpdateProfileDto
            {
                FirstName = "Updated",
                LastName = "User",
                PhoneNumber = "1234567890"
            };

            // Mock ClaimsPrincipal
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            var expectedProfile = new UserProfileDto
            {
                Id = userId.ToString(),
                FirstName = updateDto.FirstName,
                LastName = updateDto.LastName
            };

            _mockUserService.Setup(service => service.UpdateProfileAsync(userId.ToString(), updateDto))
                .ReturnsAsync(expectedProfile);

            // Act
            var result = await _controller.UpdateProfile(updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseModel<UserProfileDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
        }

        [Fact]
        public async Task ChangePassword_ReturnsOkResult_WhenPasswordChangeSuccessful()
        {
            // Arrange
            var userId = 1;
            var changePasswordDto = new ChangePasswordDto
            {
                CurrentPassword = "oldpass",
                NewPassword = "newpass",
                ConfirmPassword = "newpass"
            };

            // Mock ClaimsPrincipal
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            _mockUserService.Setup(service => service.ChangePasswordAsync(userId.ToString(), changePasswordDto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ChangePassword(changePasswordDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseModel<bool>>(okResult.Value);
            Assert.True(response.Success);
            Assert.True(response.Data);
        }
    }
} 