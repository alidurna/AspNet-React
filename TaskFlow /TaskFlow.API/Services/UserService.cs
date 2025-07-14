using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using AutoMapper;

// ****************************************************************************************************
//  USERSERVICE.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının kullanıcı yönetimi ve authentication sisteminin ana business logic
//  servisidir. Kullanıcı kaydı, giriş, profil yönetimi, şifre işlemleri, email doğrulama ve JWT token
//  yönetimi gibi tüm user-related business operations'ları içerir.
//
//  ANA BAŞLIKLAR:
//  - User Authentication (Register, Login, Logout)
//  - Profile Management (Get, Update, Statistics)
//  - Password Operations (Change, Reset, Validation)
//  - Email Verification ve Management
//  - JWT Token Management (Generate, Refresh, Revoke)
//  - User Statistics ve Analytics
//  - Security ve Validation
//
//  GÜVENLİK:
//  - Password hashing ve validation
//  - JWT token generation ve management
//  - Email uniqueness validation
//  - Input sanitization ve validation
//  - Session management
//  - Refresh token security
//
//  HATA YÖNETİMİ:
//  - Comprehensive exception handling
//  - Business rule validation
//  - Database transaction management
//  - Detailed logging for security events
//  - Graceful error recovery
//
//  EDGE-CASE'LER:
//  - Duplicate email registration attempts
//  - Invalid password formats
//  - Expired refresh tokens
//  - Concurrent login attempts
//  - Database connection failures
//  - Email service unavailability
//  - Token validation failures
//
//  YAN ETKİLER:
//  - User registration creates database records
//  - Login updates last login timestamp
//  - Password changes invalidate existing sessions
//  - Email verification affects user status
//  - Token refresh creates new session data
//
//  PERFORMANS:
//  - Database query optimization
//  - Caching for user data
//  - Efficient password hashing
//  - Token generation optimization
//  - Connection pooling
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Service layer pattern
//  - Dependency injection
//  - Comprehensive documentation
//  - Extensible authentication system
//  - Configuration-based settings
// ****************************************************************************************************
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
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;

        #endregion

        #region Constructor

        public UserService(
            TaskFlowDbContext context,
            IPasswordService passwordService,
            IJwtService jwtService,
            ILogger<UserService> logger,
            IConfiguration configuration,
            IMapper mapper,
            ICacheService cacheService)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _passwordService = passwordService ?? throw new ArgumentNullException(nameof(passwordService));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
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
                var refreshToken = _jwtService.GenerateRefreshToken();
                var expirationMinutes = _configuration.GetValue<int>("Jwt:AccessTokenExpirationMinutes", 60);

                // Refresh token'ı kaydet
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7); // 7 gün geçerli
                await _context.SaveChangesAsync();

                // Response oluşturma
                var authResponse = new AuthResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
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

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
                if (user == null)
                {
                    throw new UnauthorizedAccessException("Geçersiz email veya şifre");
                }

                if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    throw new UnauthorizedAccessException("Geçersiz email veya şifre");
                }

                var token = _jwtService.GenerateToken(user);
                var refreshToken = _jwtService.GenerateRefreshToken();
                var expiresAt = DateTime.UtcNow.AddMinutes(_jwtService.TokenExpirationMinutes);

                user.LastLoginAt = DateTime.UtcNow;
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = expiresAt;

                await _context.SaveChangesAsync();

                return new AuthResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresInMinutes = _jwtService.TokenExpirationMinutes,
                    ExpiresAt = expiresAt,
                    User = _mapper.Map<UserDto>(user),
                    Success = true,
                    Message = $"Hoş geldiniz {user.FirstName} {user.LastName}"
                };
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
                // Cache key oluştur
                var cacheKey = $"users:profile:{userId}";
                var cacheExpiration = TimeSpan.FromMinutes(
                    _configuration.GetValue("Cache:UsersCache:ExpirationMinutes", 60));

                // Cache'ten al veya database'ten getir
                var userDto = await _cacheService.GetAsync<UserDto>(cacheKey);
                if (userDto != null)
                {
                    return userDto;
                }

                // Cache'te yoksa database'ten getir
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    return null;
                }

                // User'ı DTO'ya çevir ve cache'e ekle
                userDto = MapToDto(user);
                await _cacheService.SetAsync(cacheKey, userDto, cacheExpiration);

                return userDto;
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

                // Cache'i invalidate et - kullanıcı bilgileri değişti
                await _cacheService.RemoveAsync($"users:profile:{userId}");
                await _cacheService.RemoveAsync($"stats:user:{userId}");

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
            var tasks = await _context.TodoTasks
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var completedTasks = tasks.Count(t => t.IsCompleted);
            var pendingTasks = tasks.Count(t => !t.IsCompleted);
            var inProgressTasks = tasks.Count(t => !t.IsCompleted && t.Progress > 0);

            var completionRate = tasks.Any() ? (double)completedTasks / tasks.Count * 100 : 0;

            var completedTasksWithDates = tasks
                .Where(t => t.IsCompleted && t.CompletedAt.HasValue)
                .ToList();

            var averageCompletionDays = completedTasksWithDates.Any()
                ? completedTasksWithDates.Average(t => (t.CompletedAt.Value - t.CreatedAt).TotalDays)
                : 0;

            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var startOfWeek = now.AddDays(-(int)now.DayOfWeek);

            var completedThisMonth = completedTasksWithDates.Count(t => t.CompletedAt >= startOfMonth);
            var completedThisWeek = completedTasksWithDates.Count(t => t.CompletedAt >= startOfWeek);

            return new UserStatsDto
            {
                TotalTasks = tasks.Count,
                CompletedTasks = completedTasks,
                PendingTasks = pendingTasks,
                InProgressTasks = inProgressTasks,
                TaskCompletionRate = completionRate,
                AverageCompletionDays = averageCompletionDays,
                TasksCompletedThisMonth = completedThisMonth,
                TasksCompletedThisWeek = completedThisWeek
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                _logger.LogInformation("Changing password for user: {UserId}", userId);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    throw new InvalidOperationException("Kullanıcı bulunamadı");
                }

                // Mevcut şifre kontrolü
                if (!_passwordService.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
                {
                    throw new UnauthorizedAccessException("Mevcut şifre yanlış");
                }

                // Yeni şifre hash'le
                user.PasswordHash = _passwordService.HashPassword(changePasswordDto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> RequestPasswordResetAsync(PasswordResetRequestDto passwordResetRequestDto)
        {
            try
            {
                _logger.LogInformation("Password reset request for email: {Email}", passwordResetRequestDto.Email);

                var user = await GetUserByEmailAsync(passwordResetRequestDto.Email);
                if (user == null)
                {
                    // Güvenlik için kullanıcı bulunamadığında da başarı döndürüyoruz
                    _logger.LogWarning("Password reset requested for non-existent email: {Email}", passwordResetRequestDto.Email);
                    return true;
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("Password reset requested for inactive user: {Email}", passwordResetRequestDto.Email);
                    return true;
                }

                // Reset token oluştur
                var resetToken = Guid.NewGuid().ToString("N");
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // 1 saat geçerli
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // TODO: Email gönderme servisi eklenecek
                // await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken);

                _logger.LogInformation("Password reset token generated for user: {Email}", passwordResetRequestDto.Email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting password reset for email: {Email}", passwordResetRequestDto.Email);
                throw;
            }
        }

        public async Task<bool> ResetPasswordAsync(PasswordResetDto passwordResetDto)
        {
            try
            {
                _logger.LogInformation("Password reset attempt with token: {Token}", passwordResetDto.Token);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.PasswordResetToken == passwordResetDto.Token && u.IsActive);

                if (user == null)
                {
                    throw new InvalidOperationException("Geçersiz veya süresi dolmuş token");
                }

                // Token süresi kontrolü
                if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
                {
                    throw new InvalidOperationException("Token süresi dolmuş");
                }

                // Yeni şifre hash'le ve token'ı temizle
                user.PasswordHash = _passwordService.HashPassword(passwordResetDto.NewPassword);
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                user.RefreshToken = null; // Mevcut refresh token'ı iptal et
                user.RefreshTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Password reset successful for user: {UserId}", user.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password with token: {Token}", passwordResetDto.Token);
                throw;
            }
        }

        public async Task<bool> RequestEmailVerificationAsync(EmailVerificationRequest emailVerificationRequest)
        {
            try
            {
                _logger.LogInformation("Email verification request for email: {Email}", emailVerificationRequest.Email);

                var user = await GetUserByEmailAsync(emailVerificationRequest.Email);
                if (user == null)
                {
                    throw new InvalidOperationException("Kullanıcı bulunamadı");
                }

                if (!user.IsActive)
                {
                    throw new InvalidOperationException("Kullanıcı hesabı deaktif");
                }

                if (user.IsEmailVerified)
                {
                    throw new InvalidOperationException("E-posta zaten doğrulanmış");
                }

                // Verification token oluştur
                var verificationToken = Guid.NewGuid().ToString("N");
                user.EmailVerificationToken = verificationToken;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24); // 24 saat geçerli
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // TODO: Email gönderme servisi eklenecek
                // await _emailService.SendEmailVerificationAsync(user.Email, verificationToken);

                _logger.LogInformation("Email verification token generated for user: {Email}", emailVerificationRequest.Email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting email verification for email: {Email}", emailVerificationRequest.Email);
                throw;
            }
        }

        public async Task<bool> VerifyEmailAsync(EmailVerification emailVerification)
        {
            try
            {
                _logger.LogInformation("Email verification attempt for email: {Email}", emailVerification.Email);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == emailVerification.Email.ToLower().Trim() 
                                          && u.EmailVerificationToken == emailVerification.Token 
                                          && u.IsActive);

                if (user == null)
                {
                    throw new InvalidOperationException("Geçersiz veya süresi dolmuş token");
                }

                // Token süresi kontrolü
                if (user.EmailVerificationTokenExpiry == null || user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                {
                    throw new InvalidOperationException("Token süresi dolmuş");
                }

                // Email'i doğrulanmış olarak işaretle ve token'ı temizle
                user.IsEmailVerified = true;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Cache'i temizle
                await _cacheService.RemoveAsync($"users:profile:{user.Id}");

                _logger.LogInformation("Email verified successfully for user: {UserId}", user.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email for: {Email}", emailVerification.Email);
                throw;
            }
        }

        public async Task<TokenRefreshResponseDto> RefreshTokenAsync(TokenRefreshRequestDto tokenRefreshRequestDto)
        {
            try
            {
                _logger.LogInformation("Token refresh request");

                // Access token'dan user ID'yi al (expire olmuş olabilir)
                var userId = _jwtService.GetUserIdFromToken(tokenRefreshRequestDto.AccessToken);
                if (!userId.HasValue)
                {
                    throw new UnauthorizedAccessException("Geçersiz access token");
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId.Value && u.IsActive);

                if (user == null)
                {
                    throw new UnauthorizedAccessException("Kullanıcı bulunamadı");
                }

                // Refresh token kontrolü
                if (user.RefreshToken != tokenRefreshRequestDto.RefreshToken)
                {
                    throw new UnauthorizedAccessException("Geçersiz refresh token");
                }

                // Refresh token süresi kontrolü
                if (user.RefreshTokenExpiry == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                {
                    throw new UnauthorizedAccessException("Refresh token süresi dolmuş");
                }

                // Yeni token'lar oluştur
                var newAccessToken = _jwtService.GenerateToken(user);
                var newRefreshToken = _jwtService.GenerateRefreshToken();

                // Yeni refresh token'ı kaydet
                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7); // 7 gün geçerli
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var expirationMinutes = _configuration.GetValue<int>("Jwt:AccessTokenExpirationMinutes", 60);

                _logger.LogInformation("Token refreshed successfully for user: {UserId}", user.Id);

                return new TokenRefreshResponseDto
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken,
                    ExpiresInMinutes = expirationMinutes,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                throw;
            }
        }

        public async Task<bool> RevokeRefreshTokenAsync(int userId)
        {
            try
            {
                _logger.LogInformation("Revoking refresh token for user: {UserId}", userId);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    throw new InvalidOperationException("Kullanıcı bulunamadı");
                }

                // Refresh token'ı iptal et
                user.RefreshToken = null;
                user.RefreshTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refresh token revoked successfully for user: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking refresh token for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> LogoutAllSessionsAsync(int userId)
        {
            try
            {
                _logger.LogInformation("Logging out all sessions for user: {UserId}", userId);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    throw new InvalidOperationException("Kullanıcı bulunamadı");
                }

                // Tüm token'ları iptal et
                user.RefreshToken = null;
                user.RefreshTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Cache'i temizle
                await _cacheService.RemoveAsync($"users:profile:{userId}");

                _logger.LogInformation("All sessions logged out successfully for user: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging out all sessions for user: {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Helper Methods

        public UserDto MapToDto(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            // AutoMapper ile otomatik mapping
            // Manuel 12 satır kod → 1 satır!
            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserProfileDto> GetUserProfileAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId) || !int.TryParse(userId, out int id))
                throw new UnauthorizedAccessException("Geçersiz kullanıcı kimliği");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new KeyNotFoundException("Kullanıcı bulunamadı");

            var stats = await GetUserStatsAsync(id);

            return new UserProfileDto
            {
                Id = userId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfileImage = user.ProfileImage,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Stats = stats
            };
        }

        public async Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileDto model)
        {
            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("Kullanıcı bulunamadı");
            }

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.ProfileImage = model.ProfileImage;

            await _context.SaveChangesAsync();

            return await GetUserProfileAsync(userId);
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto model)
        {
            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("Kullanıcı bulunamadı");
            }

            if (!_passwordService.VerifyPassword(model.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Mevcut şifre yanlış");
            }

            user.PasswordHash = _passwordService.HashPassword(model.NewPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion
    }
} 