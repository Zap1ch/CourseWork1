namespace Core.Services;

// Результат виклику API: або дані, або текст помилки
public sealed class ApiResult<T>
{
    public bool Ok { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }

    // Токена немає або він прострочений
    public bool Unauthorized { get; init; }

    public static ApiResult<T> Success(T data) => new() { Ok = true, Data = data };

    public static ApiResult<T> Fail(string error) => new() { Ok = false, Error = error };

    public static ApiResult<T> SessionExpired() =>
        new() { Ok = false, Unauthorized = true, Error = "Сесія завершилась. Увійдіть знову." };
}
