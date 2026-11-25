using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;

namespace Web.Services;

// Вхід поточного користувача; зберігається в браузері в зашифрованому вигляді
public sealed class AuthSession(ProtectedLocalStorage storage)
{
    private const string StorageKey = "auth";

    public string? Token { get; private set; }
    public string? Email { get; private set; }

    public bool IsLoggedIn => Token is not null;

    // Чи вже прочитано сховище браузера
    public bool IsLoaded { get; private set; }

    // Сповіщення інтерфейсу про вхід і вихід
    public event Action? Changed;

    // Читання збереженого входу (після першого рендеру)
    public async Task LoadAsync()
    {
        if (IsLoaded) return;

        try
        {
            var saved = await storage.GetAsync<SavedLogin>(StorageKey);
            if (saved.Success && saved.Value is not null)
            {
                Token = saved.Value.Token;
                Email = saved.Value.Email;
            }
        }
        catch (Exception)
        {
            // Пошкоджені або старі дані: вважаємо, що входу немає
            Token = null;
            Email = null;
        }

        IsLoaded = true;
        Changed?.Invoke();
    }

    public async Task SignInAsync(string token, string email)
    {
        Token = token;
        Email = email;
        await storage.SetAsync(StorageKey, new SavedLogin { Token = token, Email = email });
        Changed?.Invoke();
    }

    public async Task SignOutAsync()
    {
        Token = null;
        Email = null;
        await storage.DeleteAsync(StorageKey);
        Changed?.Invoke();
    }
}

// Те, що зберігається в браузері
public sealed class SavedLogin
{
    public string Token { get; set; } = "";
    public string Email { get; set; } = "";
}
