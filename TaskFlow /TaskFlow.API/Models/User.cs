// ****************************************************************************************************
//  USER.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının kullanıcı yönetimi sisteminin ana entity modelidir. Kullanıcı
//  bilgileri, authentication verileri, profil yönetimi ve ilişkili varlıklar için gerekli tüm
//  property'leri içerir. Entity Framework Core ile veritabanı mapping'i sağlar.
//
//  ANA BAŞLIKLAR:
//  - User Identity ve Authentication
//  - Profile Management
//  - Email Verification ve Password Reset
//  - JWT Token Management
//  - Navigation Properties (Tasks, Categories)
//  - Computed Properties
//
//  GÜVENLİK:
//  - Password hash storage
//  - Email verification tokens
//  - Password reset tokens
//  - Refresh token management
//  - Account status tracking
//
//  HATA YÖNETİMİ:
//  - Required field validation
//  - Email format validation
//  - Token expiration handling
//  - Account status validation
//  - Relationship integrity
//
//  EDGE-CASE'LER:
//  - Null or empty required fields
//  - Invalid email formats
//  - Expired tokens
//  - Deactivated accounts
//  - Unicode characters in names
//  - Large profile images
//  - Concurrent login attempts
//
//  YAN ETKİLER:
//  - User creation affects related entities
//  - Account deactivation affects access
//  - Token expiration affects sessions
//  - Profile updates affect display
//  - Email verification affects permissions
//
//  PERFORMANS:
//  - Efficient database queries
//  - Optimized relationship loading
//  - Minimal memory usage
//  - Fast serialization
//  - Indexed field optimization
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear entity design
//  - Comprehensive documentation
//  - Extensible model structure
//  - Backward compatibility
//  - Migration-friendly design
// ****************************************************************************************************
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        public string? ProfileImage { get; set; }
        
        public string? PhoneNumber { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        public DateTime? LastLoginAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public bool IsEmailVerified { get; set; }
        
        public string? EmailVerificationToken { get; set; }
        
        public DateTime? EmailVerificationTokenExpiry { get; set; }
        
        public string? PasswordResetToken { get; set; }
        
        public DateTime? PasswordResetTokenExpiry { get; set; }
        
        public string? RefreshToken { get; set; }
        
        public DateTime? RefreshTokenExpiry { get; set; }
        
        public virtual ICollection<TodoTask> Tasks { get; set; } = new List<TodoTask>();
        
        // Yeni eklenen alanlar: Atanan görevler ve yüklenen ekler
        public virtual ICollection<TodoTask> AssignedTasks { get; set; } = new List<TodoTask>();
        public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        
        public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
        
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
} 