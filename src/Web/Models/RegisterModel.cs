using System.ComponentModel.DataAnnotations;

namespace Web.Models;

// Поля форми реєстрації
public sealed class RegisterModel
{
    [Required(ErrorMessage = "Введіть email")]
    [EmailAddress(ErrorMessage = "Неправильний формат email")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Введіть пароль")]
    [MinLength(6, ErrorMessage = "Пароль має містити щонайменше 6 символів")]
    public string Password { get; set; } = "";

    [Required(ErrorMessage = "Повторіть пароль")]
    [Compare(nameof(Password), ErrorMessage = "Паролі не збігаються")]
    public string ConfirmPassword { get; set; } = "";
}
