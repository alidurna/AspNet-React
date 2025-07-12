using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    public class EmailVerificationRequestDto
    {
        [Required(ErrorMessage = "Email adresi gereklidir")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; }
    }

    public class EmailVerificationDto
    {
        [Required(ErrorMessage = "Verification token gereklidir")]
        public string Token { get; set; }

        [Required(ErrorMessage = "Email adresi gereklidir")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; }
    }
} 