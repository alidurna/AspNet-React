using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Kullanıcı arama sonucu DTO'su
    /// </summary>
    public class UserSearchResult
    {
        
        public int Id { get; set; }

        [SwaggerSchema("Adı")]
        public string FirstName { get; set; } = string.Empty;

        [SwaggerSchema("Soyadı")]
        public string LastName { get; set; } = string.Empty;

        [SwaggerSchema("E-posta adresi")]
        public string Email { get; set; } = string.Empty;

        [SwaggerSchema("Profil resmi URL'si")]
        public string? ProfileImageUrl { get; set; }
    }
} 