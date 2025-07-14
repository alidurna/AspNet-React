using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class BulkCompleteTaskDto
    {
        [Required]
        [SwaggerSchema("Tamamlanacak görevlerin ID listesi", Example = new[] { 1, 2, 3 })]
        public List<int> TaskIds { get; set; } = new();
    }
} 