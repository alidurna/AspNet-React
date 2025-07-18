using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// İki Faktörlü Kimlik Doğrulama Servisi
    /// TOTP (Time-based One-Time Password) implementasyonu
    /// </summary>
    public class TwoFactorAuthService : ITwoFactorAuthService
    {
        private readonly ILogger<TwoFactorAuthService> _logger;
        private readonly IConfiguration _configuration;

        public TwoFactorAuthService(ILogger<TwoFactorAuthService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Yeni 2FA secret key oluştur
        /// </summary>
        public string GenerateSecretKey()
        {
            var randomBytes = new byte[20];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return ToBase32String(randomBytes);
        }

        /// <summary>
        /// QR kod URL'i oluştur
        /// </summary>
        public string GenerateQrCodeUrl(string secretKey, string email, string issuer = "TaskFlow")
        {
            var encodedIssuer = Uri.EscapeDataString(issuer);
            var encodedEmail = Uri.EscapeDataString(email);
            var encodedSecret = Uri.EscapeDataString(secretKey);
            
            return $"otpauth://totp/{encodedIssuer}:{encodedEmail}?secret={encodedSecret}&issuer={encodedIssuer}&algorithm=SHA1&digits=6&period=30";
        }

        /// <summary>
        /// TOTP kodu oluştur
        /// </summary>
        public string GenerateTotpCode(string secretKey)
        {
            var timeStep = 30; // 30 saniye
            var digits = 6;
            var currentTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var timeStepNumber = currentTime / timeStep;

            var secretBytes = Base32Decode(secretKey);
            var timeStepBytes = BitConverter.GetBytes(timeStepNumber);
            
            if (BitConverter.IsLittleEndian)
                Array.Reverse(timeStepBytes);

            using var hmac = new HMACSHA1(secretBytes);
            var hash = hmac.ComputeHash(timeStepBytes);
            
            var offset = hash[^1] & 0x0F;
            var code = ((hash[offset] & 0x7F) << 24) |
                      ((hash[offset + 1] & 0xFF) << 16) |
                      ((hash[offset + 2] & 0xFF) << 8) |
                      (hash[offset + 3] & 0xFF);

            return (code % (int)Math.Pow(10, digits)).ToString().PadLeft(digits, '0');
        }

        /// <summary>
        /// TOTP kodunu doğrula
        /// </summary>
        public bool VerifyTotpCode(string secretKey, string code, int window = 1)
        {
            if (string.IsNullOrEmpty(code) || code.Length != 6)
                return false;

            var currentTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var timeStep = 30;

            for (int i = -window; i <= window; i++)
            {
                var timeStepNumber = (currentTime / timeStep) + i;
                var expectedCode = GenerateTotpCodeForTimeStep(secretKey, timeStepNumber);
                
                if (expectedCode == code)
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Belirli bir zaman adımı için TOTP kodu oluştur
        /// </summary>
        private string GenerateTotpCodeForTimeStep(string secretKey, long timeStepNumber)
        {
            var digits = 6;
            var secretBytes = Base32Decode(secretKey);
            var timeStepBytes = BitConverter.GetBytes(timeStepNumber);
            
            if (BitConverter.IsLittleEndian)
                Array.Reverse(timeStepBytes);

            using var hmac = new HMACSHA1(secretBytes);
            var hash = hmac.ComputeHash(timeStepBytes);
            
            var offset = hash[^1] & 0x0F;
            var code = ((hash[offset] & 0x7F) << 24) |
                      ((hash[offset + 1] & 0xFF) << 16) |
                      ((hash[offset + 2] & 0xFF) << 8) |
                      (hash[offset + 3] & 0xFF);

            return (code % (int)Math.Pow(10, digits)).ToString().PadLeft(digits, '0');
        }

        /// <summary>
        /// Kurtarma kodları oluştur
        /// </summary>
        public List<string> GenerateRecoveryCodes(int count = 10)
        {
            var codes = new List<string>();
            using var rng = RandomNumberGenerator.Create();
            
            for (int i = 0; i < count; i++)
            {
                var bytes = new byte[4];
                rng.GetBytes(bytes);
                var code = BitConverter.ToUInt32(bytes, 0) % 100000000;
                codes.Add(code.ToString("D8"));
            }
            
            return codes;
        }

        /// <summary>
        /// Kurtarma kodunu doğrula
        /// </summary>
        public bool VerifyRecoveryCode(User user, string code)
        {
            if (string.IsNullOrEmpty(user.TwoFactorRecoveryCodes))
                return false;

            try
            {
                var recoveryCodes = JsonSerializer.Deserialize<List<string>>(user.TwoFactorRecoveryCodes);
                if (recoveryCodes == null || !recoveryCodes.Contains(code))
                    return false;

                // Kullanılan kodu listeden çıkar
                recoveryCodes.Remove(code);
                user.TwoFactorRecoveryCodes = JsonSerializer.Serialize(recoveryCodes);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Recovery code verification failed for user {UserId}", user.Id);
                return false;
            }
        }

        /// <summary>
        /// Base32 encode
        /// </summary>
        private string ToBase32String(byte[] input)
        {
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            var output = new StringBuilder();
            var bits = 0;
            var buffer = 0;

            foreach (var b in input)
            {
                buffer = (buffer << 8) | b;
                bits += 8;

                while (bits >= 5)
                {
                    output.Append(alphabet[(buffer >> (bits - 5)) & 31]);
                    bits -= 5;
                }
            }

            if (bits > 0)
            {
                output.Append(alphabet[(buffer << (5 - bits)) & 31]);
            }

            return output.ToString();
        }

        /// <summary>
        /// Base32 decode
        /// </summary>
        private byte[] Base32Decode(string input)
        {
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            var output = new List<byte>();
            var bits = 0;
            var buffer = 0;

            foreach (var c in input.ToUpper())
            {
                var index = alphabet.IndexOf(c);
                if (index == -1) continue;

                buffer = (buffer << 5) | index;
                bits += 5;

                while (bits >= 8)
                {
                    output.Add((byte)(buffer >> (bits - 8)));
                    bits -= 8;
                }
            }

            return output.ToArray();
        }

        /// <summary>
        /// 2FA durumunu kontrol et
        /// </summary>
        public TwoFactorStatusDto GetTwoFactorStatus(User user)
        {
            var recoveryCodes = new List<string>();
            if (!string.IsNullOrEmpty(user.TwoFactorRecoveryCodes))
            {
                try
                {
                    recoveryCodes = JsonSerializer.Deserialize<List<string>>(user.TwoFactorRecoveryCodes) ?? new List<string>();
                }
                catch
                {
                    recoveryCodes = new List<string>();
                }
            }

            return new TwoFactorStatusDto
            {
                IsEnabled = user.TwoFactorEnabled,
                IsConfigured = !string.IsNullOrEmpty(user.TwoFactorSecret),
                LastUsed = user.TwoFactorLastUsed,
                RecoveryCodesRemaining = recoveryCodes.Count
            };
        }
    }

    /// <summary>
    /// 2FA servis interface'i
    /// </summary>
    public interface ITwoFactorAuthService
    {
        string GenerateSecretKey();
        string GenerateQrCodeUrl(string secretKey, string email, string issuer = "TaskFlow");
        string GenerateTotpCode(string secretKey);
        bool VerifyTotpCode(string secretKey, string code, int window = 1);
        List<string> GenerateRecoveryCodes(int count = 10);
        bool VerifyRecoveryCode(User user, string code);
        TwoFactorStatusDto GetTwoFactorStatus(User user);
    }
} 