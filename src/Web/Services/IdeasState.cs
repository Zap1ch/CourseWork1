namespace Web.Services;

// Сповіщення про зміну списку ідей (для бічної панелі)
public sealed class IdeasState
{
    public event Action? Changed;

    public void NotifyChanged() => Changed?.Invoke();
}