using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class BulkCompleteTaskDto
    {
        [Required]
        
        public List<int> TaskIds { get; set; } = new();
    }
} 