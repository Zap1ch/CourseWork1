using System.Net;
using Core.Services;
using Xunit;

namespace Core.Tests;

public class StartupApiClientTests
{
    private static StartupApiClient CreateClient(HttpMessageHandler handler) =>
        new(new HttpClient(handler) { BaseAddress = new Uri("http://localhost:3000/") });

    [Fact]
    public async Task Login_Success_ReturnsToken()
    {
        var handler = new FakeHandler(HttpStatusCode.OK, """{"success":true,"token":"abc"}""");

        var result = await CreateClient(handler).LoginAsync("a@b.com", "123456");

        Assert.True(result.Ok);
        Assert.Equal("abc", result.Data!.Token);
        Assert.Equal("http://localhost:3000/api/login", handler.LastUrl);
        Assert.Contains("a@b.com", handler.LastBody);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsServerMessage()
    {
        var handler = new FakeHandler(HttpStatusCode.BadRequest,
            """{"success":false,"message":"Invalid email or password"}""");

        var result = await CreateClient(handler).LoginAsync("a@b.com", "wrong");

        Assert.False(result.Ok);
        Assert.Equal("Invalid email or password", result.Error);
    }

    [Fact]
    public async Task GetIdeas_ParsesSnakeCaseFields_AndSendsToken()
    {
        var handler = new FakeHandler(HttpStatusCode.OK,
            """[{"id":1,"idea_text":"Test idea","created_at":"2026-10-30T22:02:33.000Z"}]""");

        var result = await CreateClient(handler).GetIdeasAsync("my-token");

        Assert.True(result.Ok);
        Assert.Single(result.Data!);
        Assert.Equal("Test idea", result.Data![0].IdeaText);
        Assert.Equal(2026, result.Data![0].CreatedAt.Year);
        Assert.Equal("Bearer my-token", handler.LastAuth);
    }

    [Fact]
    public async Task Analyze_SendsIdeaText_AndReturnsFourParts()
    {
        var handler = new FakeHandler(HttpStatusCode.OK,
            """{"id":7,"need":"N","approach":"A","benefit":"B","competition":"C"}""");

        var result = await CreateClient(handler).AnalyzeAsync("my-token", "Some startup idea text");

        Assert.True(result.Ok);
        Assert.Equal(7, result.Data!.Id);
        Assert.Equal("C", result.Data!.Competition);
        Assert.Contains("idea_text", handler.LastBody);
    }

    [Fact]
    public async Task Analyze_ValidationError_ReturnsErrorField()
    {
        var handler = new FakeHandler(HttpStatusCode.BadRequest, """{"error":"Idea is too short."}""");

        var result = await CreateClient(handler).AnalyzeAsync("my-token", "short");

        Assert.False(result.Ok);
        Assert.Equal("Idea is too short.", result.Error);
    }

    [Fact]
    public async Task GetIdeas_Unauthorized_AsksToLoginAgain()
    {
        var handler = new FakeHandler(HttpStatusCode.Unauthorized, "Unauthorized");

        var result = await CreateClient(handler).GetIdeasAsync("expired-token");

        Assert.False(result.Ok);
        Assert.Contains("Увійдіть", result.Error);
        Assert.True(result.Unauthorized);
    }

    [Fact]
    public async Task ServerDown_ReturnsFriendlyError()
    {
        var result = await CreateClient(new DownHandler()).GetIdeasAsync("my-token");

        Assert.False(result.Ok);
        Assert.Contains("недоступний", result.Error);
    }
}
