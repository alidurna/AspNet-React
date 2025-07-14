using System.Collections.Generic;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class SearchSuggestionsResponse
    {
        [SwaggerSchema("Arama terimi")]
        public string Query { get; set; } = string.Empty;

        [SwaggerSchema("Önerilen anahtar kelimeler")]
        public List<string> Suggestions { get; set; } = new();
    }
} 