using System.Net;
using System.Text;

namespace Core.Tests;

// Підробний сервер: повертає задану відповідь і запам'ятовує запит
internal sealed class FakeHandler(HttpStatusCode status, string body) : HttpMessageHandler
{
    public string? LastUrl { get; private set; }
    public string? LastAuth { get; private set; }
    public string? LastBody { get; private set; }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        LastUrl = request.RequestUri?.ToString();
        LastAuth = request.Headers.Authorization?.ToString();
        LastBody = request.Content is null ? null : await request.Content.ReadAsStringAsync(ct);

        return new HttpResponseMessage(status)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
    }
}

// Підробний сервер, який не відповідає
internal sealed class DownHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
        throw new HttpRequestException("Connection refused");
}
