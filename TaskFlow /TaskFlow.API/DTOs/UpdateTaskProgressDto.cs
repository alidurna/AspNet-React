using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Task progress güncelleme DTO'su
    /// Task'ın completion percentage'ini güncellemek için kullanılır
    /// </summary>
    public class UpdateTaskProgressDto
    {
        /// <summary>
        /// Tamamlanma yüzdesi (0-100 arası)
        /// </summary>
        [Required(ErrorMessage = "Tamamlanma yüzdesi gereklidir")]
        [Range(0, 100, ErrorMessage = "Tamamlanma yüzdesi 0-100 arasında olmalıdır")]
        public int CompletionPercentage { get; set; }
    }
} 