using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class BulkDeleteTaskDto
    {
        [Required]
        [SwaggerSchema("Silinecek görevlerin ID listesi", Example = new[] { 4, 5, 6 })]
        public List<int> TaskIds { get; set; } = new();
    }
} 