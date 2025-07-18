using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Data;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// WebAuthn (Web Authentication API) Servisi
    /// Biyometrik giriş ve güvenlik anahtarları için kullanılır
    /// </summary>
    public class WebAuthnService : IWebAuthnService
    {
        private readonly ILogger<WebAuthnService> _logger;
        private readonly IConfiguration _configuration;
        private readonly TaskFlowDbContext _context;
        private readonly IUserService _userService;

        public WebAuthnService(
            ILogger<WebAuthnService> logger,
            IConfiguration configuration,
            TaskFlowDbContext context,
            IUserService userService)
        {
            _logger = logger;
            _configuration = configuration;
            _context = context;
            _userService = userService;
        }

        /// <summary>
        /// WebAuthn kayıt başlatma
        /// </summary>
        public async Task<WebAuthnRegistrationResponseDto> StartRegistrationAsync(WebAuthnRegistrationRequestDto request)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(request.Username);
                if (user == null)
                    throw new InvalidOperationException("Kullanıcı bulunamadı");

                // Challenge oluştur
                var challenge = GenerateChallenge();
                var sessionId = Guid.NewGuid().ToString();

                // PublicKeyCredentialCreationOptions oluştur
                var options = new
                {
                    challenge = Convert.ToBase64String(challenge),
                    rp = new
                    {
                        name = "TaskFlow",
                        id = _configuration["WebAuthn:RpId"] ?? "localhost"
                    },
                    user = new
                    {
                        id = Convert.ToBase64String(Encoding.UTF8.GetBytes(user.Id.ToString())),
                        name = user.Email,
                        displayName = request.DisplayName ?? user.FullName
                    },
                    pubKeyCredParams = new[]
                    {
                        new { alg = -7, type = "public-key" }, // ES256
                        new { alg = -257, type = "public-key" } // RS256
                    },
                    timeout = 60000,
                    attestation = "direct",
                    authenticatorSelection = new
                    {
                        authenticatorAttachment = "platform",
                        userVerification = "preferred",
                        requireResidentKey = false
                    }
                };

                // Session'ı cache'le (gerçek uygulamada Redis kullanılabilir)
                // Bu örnekte basitlik için session'ı geçici olarak saklıyoruz

                return new WebAuthnRegistrationResponseDto
                {
                    Challenge = Convert.ToBase64String(challenge),
                    PublicKeyCredentialCreationOptions = JsonSerializer.SerializeToElement(options),
                    SessionId = sessionId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebAuthn registration start failed");
                throw;
            }
        }

        /// <summary>
        /// WebAuthn kayıt tamamlama
        /// </summary>
        public async Task<bool> CompleteRegistrationAsync(WebAuthnRegistrationCompleteDto request)
        {
            try
            {
                // Session'dan kullanıcı bilgilerini al (gerçek uygulamada cache'den)
                // Bu örnekte basitlik için session'ı geçici olarak saklıyoruz

                // Attestation response'u doğrula
                var attestationResponse = request.AttestationResponse;
                
                // Burada gerçek WebAuthn doğrulama işlemleri yapılır
                // Şimdilik basit bir doğrulama yapıyoruz
                if (!attestationResponse.TryGetProperty("id", out var idElement) ||
                    !attestationResponse.TryGetProperty("response", out var responseElement))
                {
                    throw new InvalidOperationException("Geçersiz attestation response");
                }

                var credentialId = idElement.GetString();
                var response = responseElement.GetProperty("attestationObject");

                // Yeni credential oluştur
                var credential = new WebAuthnCredential
                {
                    UserId = 1, // Session'dan alınacak
                    CredentialId = credentialId ?? "",
                    PublicKey = response.ToString(),
                    SignCount = "0",
                    Name = "Biyometrik Giriş",
                    Type = "public-key",
                    Transports = "internal",
                    CreatedAt = DateTime.UtcNow,
                    LastUsedAt = null,
                    IsActive = true
                };

                _context.WebAuthnCredentials.Add(credential);
                await _context.SaveChangesAsync();

                // Kullanıcıyı güncelle
                var user = await _userService.GetUserByEmailAsync("test@example.com"); // Session'dan alınacak
                if (user != null)
                {
                    user.BiometricEnabled = true;
                    user.BiometricEnabledAt = DateTime.UtcNow;
                    user.BiometricCredentialId = credentialId;
                    await _userService.UpdateUserAsync(user);
                }

                _logger.LogInformation("WebAuthn registration completed for user");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebAuthn registration completion failed");
                return false;
            }
        }

        /// <summary>
        /// WebAuthn giriş başlatma
        /// </summary>
        public async Task<WebAuthnAuthenticationResponseDto> StartAuthenticationAsync(WebAuthnAuthenticationRequestDto request)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(request.Username);
                if (user == null)
                    throw new InvalidOperationException("Kullanıcı bulunamadı");

                // Kullanıcının credential'larını al
                var credentials = await _context.WebAuthnCredentials
                    .Where(c => c.UserId == user.Id && c.IsActive)
                    .ToListAsync();

                if (!credentials.Any())
                    throw new InvalidOperationException("Biyometrik giriş kurulmamış");

                // Challenge oluştur
                var challenge = GenerateChallenge();
                var sessionId = Guid.NewGuid().ToString();

                // PublicKeyCredentialRequestOptions oluştur
                var options = new
                {
                    challenge = Convert.ToBase64String(challenge),
                    rpId = _configuration["WebAuthn:RpId"] ?? "localhost",
                    allowCredentials = credentials.Select(c => new
                    {
                        id = c.CredentialId,
                        type = "public-key",
                        transports = new[] { "internal" }
                    }).ToArray(),
                    userVerification = "preferred",
                    timeout = 60000
                };

                return new WebAuthnAuthenticationResponseDto
                {
                    Challenge = Convert.ToBase64String(challenge),
                    PublicKeyCredentialRequestOptions = JsonSerializer.SerializeToElement(options),
                    SessionId = sessionId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebAuthn authentication start failed");
                throw;
            }
        }

        /// <summary>
        /// WebAuthn giriş tamamlama
        /// </summary>
        public async Task<bool> CompleteAuthenticationAsync(WebAuthnAuthenticationCompleteDto request)
        {
            try
            {
                // Session'dan kullanıcı bilgilerini al (gerçek uygulamada cache'den)

                // Assertion response'u doğrula
                var assertionResponse = request.AssertionResponse;
                
                // Burada gerçek WebAuthn doğrulama işlemleri yapılır
                // Şimdilik basit bir doğrulama yapıyoruz
                if (!assertionResponse.TryGetProperty("id", out var idElement) ||
                    !assertionResponse.TryGetProperty("response", out var responseElement))
                {
                    throw new InvalidOperationException("Geçersiz assertion response");
                }

                var credentialId = idElement.GetString();
                var response = responseElement.GetProperty("authenticatorData");

                // Credential'ı bul ve güncelle
                var credential = await _context.WebAuthnCredentials
                    .FirstOrDefaultAsync(c => c.CredentialId == credentialId && c.IsActive);

                if (credential == null)
                    throw new InvalidOperationException("Geçersiz credential");

                // Sign count'u güncelle
                credential.LastUsedAt = DateTime.UtcNow;
                credential.SignCount = (int.Parse(credential.SignCount) + 1).ToString();
                
                await _context.SaveChangesAsync();

                _logger.LogInformation("WebAuthn authentication completed for user");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebAuthn authentication completion failed");
                return false;
            }
        }

        /// <summary>
        /// WebAuthn durumunu getir
        /// </summary>
        public async Task<WebAuthnStatusDto> GetStatusAsync(int userId)
        {
            try
            {
                // Kullanıcının credential'larını al
                var credentials = await _context.WebAuthnCredentials
                    .Where(c => c.UserId == userId && c.IsActive)
                    .ToListAsync();

                // Basit durum kontrolü - credential varsa etkin kabul et
                var isEnabled = credentials.Any();

                _logger.LogInformation("WebAuthn status retrieved for user {UserId}: Enabled={IsEnabled}, Credentials={CredentialCount}", 
                    userId, isEnabled, credentials.Count);

                return new WebAuthnStatusDto
                {
                    IsSupported = true, // Browser desteği kontrol edilebilir
                    IsEnabled = isEnabled,
                    Credentials = credentials.Select(c => new WebAuthnCredentialDto
                    {
                        Id = c.CredentialId,
                        Name = c.Name ?? "Biyometrik Giriş",
                        CreatedAt = c.CreatedAt,
                        LastUsedAt = c.LastUsedAt,
                        Type = c.Type ?? "public-key",
                        Transports = c.Transports ?? "internal"
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebAuthn status retrieval failed for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// WebAuthn credential'ını sil
        /// </summary>
        public async Task<bool> DeleteCredentialAsync(int userId, string credentialId)
        {
            try
            {
                var credential = await _context.WebAuthnCredentials
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.CredentialId == credentialId);

                if (credential == null)
                    return false;

                credential.IsActive = false;
                await _context.SaveChangesAsync();

                // Eğer başka credential yoksa biyometrik girişi devre dışı bırak
                var remainingCredentials = await _context.WebAuthnCredentials
                    .Where(c => c.UserId == userId && c.IsActive)
                    .CountAsync();

                if (remainingCredentials == 0)
                {
                    var user = await _userService.GetUserByEmailAsync("test@example.com"); // Session'dan alınacak
                    if (user != null)
                    {
                        user.BiometricEnabled = false;
                        user.BiometricEnabledAt = null;
                        user.BiometricCredentialId = null;
                        await _userService.UpdateUserAsync(user);
                    }
                }

                _logger.LogInformation("WebAuthn credential deleted for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebAuthn credential deletion failed");
                return false;
            }
        }

        /// <summary>
        /// Challenge oluştur
        /// </summary>
        private byte[] GenerateChallenge()
        {
            var challenge = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(challenge);
            return challenge;
        }
    }


} 