using System.Text.Json.Serialization;

namespace Core.Contracts;

// Тіло запиту на /api/analyze
public sealed class AnalyzeRequest
{
    [JsonPropertyName("idea_text")]
    public string IdeaText { get; init; } = "";
}

// Рядок історії: GET /api/ideas
public sealed class IdeaSummary
{
    public int Id { get; init; }

    [JsonPropertyName("idea_text")]
    public string IdeaText { get; init; } = "";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; init; }
}

// Ідея з повним аналізом: GET /api/idea/{id}
public sealed class IdeaDetails
{
    public int Id { get; init; }

    [JsonPropertyName("idea_text")]
    public string IdeaText { get; init; } = "";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; init; }

    public string? Need { get; init; }
    public string? Approach { get; init; }
    public string? Benefit { get; init; }
    public string? Competition { get; init; }
}

// Результат аналізу: POST /api/analyze
public sealed class AnalysisResult
{
    public int Id { get; init; }
    public string Need { get; init; } = "";
    public string Approach { get; init; } = "";
    public string Benefit { get; init; } = "";
    public string Competition { get; init; } = "";
}

// Помилка сервера: поле error (ідеї) або message (авторизація)
public sealed class ErrorResponse
{
    public string? Error { get; init; }
    public string? Message { get; init; }
}
