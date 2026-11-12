using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Core.Contracts;

namespace Core.Services;

// Клієнт HTTP API бекенду (Node.js)
public sealed class StartupApiClient(HttpClient http)
{
    public Task<ApiResult<AuthResponse>> RegisterAsync(string email, string password, CancellationToken ct = default) =>
        SendAsync<AuthResponse>(HttpMethod.Post, "api/register", null, new AuthRequest(email, password), ct);

    public Task<ApiResult<AuthResponse>> LoginAsync(string email, string password, CancellationToken ct = default) =>
        SendAsync<AuthResponse>(HttpMethod.Post, "api/login", null, new AuthRequest(email, password), ct);

    public Task<ApiResult<List<IdeaSummary>>> GetIdeasAsync(string token, CancellationToken ct = default) =>
        SendAsync<List<IdeaSummary>>(HttpMethod.Get, "api/ideas", token, null, ct);

    public Task<ApiResult<IdeaDetails>> GetIdeaAsync(string token, int id, CancellationToken ct = default) =>
        SendAsync<IdeaDetails>(HttpMethod.Get, $"api/idea/{id}", token, null, ct);

    public Task<ApiResult<AnalysisResult>> AnalyzeAsync(string token, string ideaText, CancellationToken ct = default) =>
        SendAsync<AnalysisResult>(HttpMethod.Post, "api/analyze", token, new AnalyzeRequest { IdeaText = ideaText }, ct);

    // Спільна логіка всіх запитів
    private async Task<ApiResult<T>> SendAsync<T>(HttpMethod method, string url, string? token, object? body, CancellationToken ct)
    {
        try
        {
            using var request = new HttpRequestMessage(method, url);

            if (token is not null)
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            if (body is not null)
                request.Content = JsonContent.Create(body, body.GetType());

            using var response = await http.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadFromJsonAsync<T>(ct);
                return data is null
                    ? ApiResult<T>.Fail("Сервер повернув порожню відповідь.")
                    : ApiResult<T>.Success(data);
            }

            // Токена немає або він прострочений
            if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
                return ApiResult<T>.Fail("Сесія завершилась. Увійдіть знову.");

            return ApiResult<T>.Fail(await ReadErrorAsync(response, ct));
        }
        catch (HttpRequestException)
        {
            // Бекенд не запущений або недоступний по мережі
            return ApiResult<T>.Fail("Сервер недоступний. Перевірте, чи запущено backend.");
        }
        catch (JsonException)
        {
            return ApiResult<T>.Fail("Сервер повернув неочікувану відповідь.");
        }
    }

    // Текст помилки з поля error або message
    private static async Task<string> ReadErrorAsync(HttpResponseMessage response, CancellationToken ct)
    {
        var fallback = $"Сервер повернув помилку {(int)response.StatusCode}.";

        try
        {
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
            return error?.Error ?? error?.Message ?? fallback;
        }
        catch (JsonException)
        {
            return fallback;
        }
    }
}
