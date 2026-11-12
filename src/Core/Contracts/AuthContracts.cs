namespace Core.Contracts;

// Тіло запиту на /api/register і /api/login
public sealed record AuthRequest(string Email, string Password);

// Відповідь сервера на реєстрацію і вхід
public sealed class AuthResponse
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public string? Token { get; init; }
}
