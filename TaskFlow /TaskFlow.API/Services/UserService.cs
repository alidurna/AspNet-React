using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// User yönetimi ve authentication işlemleri implementation
    /// Authentication, profile management ve user statistics işlemlerini yönetir
    /// </summary>
    public class UserService : IUserService
    {
        #region Private Fields

        private readonly TaskFlowDbContext _context;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly ILogger<UserService> _logger;
        private readonly IConfiguration _configuration;

        #endregion

        #region Constructor

        public UserService(
            TaskFlowDbContext context,
            IPasswordService passwordService,
            IJwtService jwtService,
            ILogger<UserService> logger,
            IConfiguration configuration)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _passwordService = passwordService ?? throw new ArgumentNullException(nameof(passwordService));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        #endregion

        #region Authentication Operations

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                _logger.LogInformation("User registration attempt for email: {Email}", registerDto.Email);

                // Email benzersizlik kontrolü
                if (await IsEmailExistsAsync(registerDto.Email))
                {
                    throw new InvalidOperationException("Bu email adresi zaten kayıtlı");
                }

                // Şifre validation
                var passwordValidation = _passwordService.ValidatePassword(registerDto.Password);
                if (!passwordValidation.IsValid)
                {
                    throw new ArgumentException($"Şifre güvenlik gereksinimlerini karşılamıyor: {string.Join(", ", passwordValidation.Errors)}");
                }

                // Şifre confirmation kontrolü
                if (!_passwordService.ValidatePasswordConfirmation(registerDto.Password, registerDto.ConfirmPassword))
                {
                    throw new ArgumentException("Şifre ve şifre tekrarı eşleşmiyor");
                }

                // Şifre hash'leme
                var passwordHash = _passwordService.HashPassword(registerDto.Password);

                // User entity oluşturma
                var user = new User
                {
                    Email = registerDto.Email.ToLower().Trim(),
                    PasswordHash = passwordHash,
                    FirstName = registerDto.FirstName.Trim(),
                    LastName = registerDto.LastName.Trim(),
                    PhoneNumber = string.IsNullOrWhiteSpace(registerDto.PhoneNumber) 
                        ? null 
                        : registerDto.PhoneNumber.Trim(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Database'e kaydetme
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User registered successfully: {Email} (ID: {UserId})", user.Email, user.Id);

                // JWT token oluşturma
                var token = _jwtService.GenerateToken(user);
                var expirationMinutes = _configuration.GetValue<int>("Jwt:AccessTokenExpirationMinutes", 60);

                // Response oluşturma
                var authResponse = new AuthResponseDto
                {
                    Token = token,
                    ExpiresInMinutes = expirationMinutes,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
                    User = MapToDto(user),
                    Success = true,
                    Message = $"Hoş geldiniz {user.FullName}! Hesabınız başarıyla oluşturuldu."
                };

                return authResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration for email: {Email}", registerDto.Email);
                throw;
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);

                // Kullanıcıyı email ile bul
                var user = await GetUserByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    _logger.LogWarning("Login failed - user not found: {Email}", loginDto.Email);
                    throw new UnauthorizedAccessException("Email veya şifre hatalı");
                }

                // Kullanıcı aktif mi kontrol et
                if (!user.IsActive)
                {
                    _logger.LogWarning("Login failed - user inactive: {Email}", loginDto.Email);
                    throw new UnauthorizedAccessException("Hesabınız deaktif edilmiş");
                }

                // Şifre kontrolü
                if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Login failed - invalid password: {Email}", loginDto.Email);
                    throw new UnauthorizedAccessException("Email veya şifre hatalı");
                }

                // LastLoginDate güncelle (User model'inde bu property yoksa eklenecek)
                // user.LastLoginDate = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // JWT token oluştur
                var token = _jwtService.GenerateToken(user);
                var expirationMinutes = _configuration.GetValue<int>("Jwt:AccessTokenExpirationMinutes", 60);

                _logger.LogInformation("Login successful for user: {Email} (ID: {UserId})", user.Email, user.Id);

                // Response oluştur
                var authResponse = new AuthResponseDto
                {
                    Token = token,
                    ExpiresInMinutes = expirationMinutes,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
                    User = MapToDto(user),
                    Success = true,
                    Message = $"Hoş geldiniz {user.FullName}!"
                };

                return authResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
                throw;
            }
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    return false;

                var normalizedEmail = email.ToLower().Trim();
                return await _context.Users
                    .AnyAsync(u => u.Email == normalizedEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email existence: {Email}", email);
                throw;
            }
        }

        #endregion

        #region User Profile Operations

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                return user != null ? MapToDto(user) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    return null;

                var normalizedEmail = email.ToLower().Trim();
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email: {Email}", email);
                throw;
            }
        }

        public async Task<UserDto> UpdateUserProfileAsync(int userId, UpdateProfileDto updateDto)
        {
            try
            {
                _logger.LogInformation("Updating user profile: {UserId}", userId);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    throw new InvalidOperationException("Kullanıcı bulunamadı");
                }

                // Güncelleme işlemleri
                if (!string.IsNullOrWhiteSpace(updateDto.FirstName))
                {
                    user.FirstName = updateDto.FirstName.Trim();
                }

                if (!string.IsNullOrWhiteSpace(updateDto.LastName))
                {
                    user.LastName = updateDto.LastName.Trim();
                }

                if (!string.IsNullOrWhiteSpace(updateDto.PhoneNumber))
                {
                    user.PhoneNumber = updateDto.PhoneNumber.Trim();
                }

                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("User profile updated successfully: {UserId}", userId);

                return MapToDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> IsUserActiveAsync(int userId)
        {
            try
            {
                return await _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.IsActive)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking user active status: {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region User Statistics

        public async Task<UserStatsDto> GetUserStatsAsync(int userId)
        {
            try
            {
                _logger.LogDebug("Getting user statistics: {UserId}", userId);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    throw new InvalidOperationException("Kullanıcı bulunamadı");
                }

                // Task ve category sayılarını ayrı sorgularla al
                var totalTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive);
                var completedTasks = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId && t.IsActive && t.IsCompleted);
                var totalCategories = await _context.Categories
                    .CountAsync(c => c.UserId == userId && c.IsActive);
                
                var pendingTasks = totalTasks - completedTasks;

                var stats = new UserStatsDto
                {
                    TotalTasks = totalTasks,
                    CompletedTasks = completedTasks,
                    PendingTasks = pendingTasks,
                    TotalCategories = totalCategories,
                    LastLoginDate = user.CreatedAt, // LastLoginDate property'si yoksa CreatedAt kullan
                    RegistrationDate = user.CreatedAt,
                    TaskCompletionRate = totalTasks > 0 ? (decimal)completedTasks / totalTasks * 100 : 0
                };

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user statistics: {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Helper Methods

        public UserDto MapToDto(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                IsActive = user.IsActive
            };
        }

        #endregion
    }
} 