using TaskFlow.API.Models;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// JWT (JSON Web Token) işlemleri için servis interface'i
    /// Authentication ve authorization süreçlerinde kullanılır
    /// </summary>
    /// <remarks>
    /// Bu interface, JWT token'ların oluşturulması, doğrulanması ve yönetimi için
    /// gerekli olan tüm metodları tanımlar. Dependency Injection pattern'ı ile
    /// concrete implementation'dan bağımsız çalışmayı sağlar.
    /// </remarks>
    public interface IJwtService
    {
        /// <summary>
        /// Verilen kullanıcı için JWT access token oluşturur
        /// Token içinde kullanıcı ID, email ve diğer claim bilgileri bulunur
        /// </summary>
        /// <param name="user">Token oluşturulacak kullanıcı entity'si</param>
        /// <returns>Oluşturulan JWT token string'i</returns>
        /// <exception cref="ArgumentNullException">User null ise fırlatılır</exception>
        /// <exception cref="InvalidOperationException">Token oluşturma başarısız ise fırlatılır</exception>
        /// <example>
        /// var token = jwtService.GenerateToken(user);
        /// // Dönen token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        /// </example>
        /// <remarks>
        /// Token içeriği:
        /// - sub (Subject): Kullanıcı ID'si
        /// - email: Kullanıcı email adresi
        /// - given_name: Ad
        /// - family_name: Soyad
        /// - jti: Token benzersiz ID'si
        /// - iat: Token oluşturulma zamanı
        /// - exp: Token son geçerlilik zamanı
        /// </remarks>
        string GenerateToken(User user);

        /// <summary>
        /// Verilen kullanıcı için refresh token oluşturur
        /// Access token'ın yenilenmesi için kullanılır
        /// </summary>
        /// <param name="user">Refresh token oluşturulacak kullanıcı entity'si</param>
        /// <returns>Oluşturulan refresh token string'i</returns>
        /// <exception cref="ArgumentNullException">User null ise fırlatılır</exception>
        /// <remarks>
        /// Refresh token'lar daha uzun ömürlüdür ve güvenli şekilde saklanmalıdır.
        /// Client-side'da access token süresi dolduğunda yeni token almak için kullanılır.
        /// </remarks>
        string GenerateRefreshToken(User user);

        /// <summary>
        /// JWT token'dan kullanıcı ID'sini çıkarır
        /// Token validation'ı yaparak claim'leri okur
        /// </summary>
        /// <param name="token">Decode edilecek JWT token</param>
        /// <returns>Token'da bulunan kullanıcı ID'si, geçersiz token ise null</returns>
        /// <exception cref="ArgumentException">Token boş veya null ise fırlatılır</exception>
        /// <example>
        /// var userId = jwtService.GetUserIdFromToken("eyJhbGciOiJIUzI1NiIs...");
        /// if (userId.HasValue) 
        /// {
        ///     // Token geçerli, kullanıcı ID'si kullanılabilir
        /// }
        /// </example>
        /// <remarks>
        /// Bu method token'ın format ve signature validation'ını da yapar.
        /// Sadece geçerli ve henüz expire olmamış token'lar için değer döndürür.
        /// </remarks>
        int? GetUserIdFromToken(string token);

        /// <summary>
        /// JWT token'ın geçerli olup olmadığını kontrol eder
        /// Signature, expiration ve format kontrolü yapar
        /// </summary>
        /// <param name="token">Doğrulanacak JWT token</param>
        /// <returns>Token geçerli ise true, değilse false</returns>
        /// <example>
        /// if (jwtService.IsTokenValid(token))
        /// {
        ///     // Token geçerli, işleme devam et
        /// }
        /// else
        /// {
        ///     // Token geçersiz, authentication gerekli
        /// }
        /// </example>
        /// <remarks>
        /// Kontrol edilen faktörler:
        /// - Token format doğruluğu
        /// - Digital signature geçerliliği  
        /// - Expiration time kontrolü
        /// - Issuer ve audience claim'leri
        /// </remarks>
        bool IsTokenValid(string token);

        /// <summary>
        /// JWT token'dan tüm claim'leri çıkarır ve Dictionary olarak döndürür
        /// Debug ve advanced scenario'lar için kullanılır
        /// </summary>
        /// <param name="token">Claim'leri çıkarılacak JWT token</param>
        /// <returns>Token'daki tüm claim'ler key-value pair olarak</returns>
        /// <exception cref="ArgumentException">Token geçersiz format ise fırlatılır</exception>
        /// <example>
        /// var claims = jwtService.GetTokenClaims(token);
        /// var email = claims["email"];
        /// var userId = claims["sub"];
        /// </example>
        /// <remarks>
        /// Bu method debugging ve logging için kullanışlıdır.
        /// Production code'da genellikle GetUserIdFromToken kullanımı yeterlidir.
        /// </remarks>
        Dictionary<string, string> GetTokenClaims(string token);

        /// <summary>
        /// Token'ın kalan geçerlilik süresini hesaplar
        /// Client-side'da token yenileme zamanlaması için kullanılır
        /// </summary>
        /// <param name="token">Kontrol edilecek JWT token</param>
        /// <returns>Token'ın kalan geçerlilik süresi, geçersiz token ise null</returns>
        /// <example>
        /// var remaining = jwtService.GetTokenRemainingTime(token);
        /// if (remaining?.TotalMinutes < 5)
        /// {
        ///     // Token 5 dakikadan az süre kaldı, yenile
        /// }
        /// </example>
        /// <remarks>
        /// Client-side'da proactive token renewal için kullanılır.
        /// Token expire olmadan önce yeni token alınması önerilir.
        /// </remarks>
        TimeSpan? GetTokenRemainingTime(string token);
    }
} 