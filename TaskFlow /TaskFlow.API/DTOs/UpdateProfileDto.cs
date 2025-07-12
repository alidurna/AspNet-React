using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Ad alanı zorunludur")]
        [StringLength(50, ErrorMessage = "Ad en fazla 50 karakter olabilir")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Soyad alanı zorunludur")]
        [StringLength(50, ErrorMessage = "Soyad en fazla 50 karakter olabilir")]
        public string LastName { get; set; } = string.Empty;

        public string? ProfileImage { get; set; }

        public string? PhoneNumber { get; set; }
    }
} 