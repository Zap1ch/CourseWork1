namespace Web.Services;

// Дані входу поточного користувача (одна вкладка браузера)
public sealed class AuthSession
{
    public string? Token { get; private set; }
    public string? Email { get; private set; }

    public bool IsLoggedIn => Token is not null;

    // Сповіщення інтерфейсу про вхід і вихід
    public event Action? Changed;

    public void SignIn(string token, string email)
    {
        Token = token;
        Email = email;
        Changed?.Invoke();
    }

    public void SignOut()
    {
        Token = null;
        Email = null;
        Changed?.Invoke();
    }
}
