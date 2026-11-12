using System.ComponentModel.DataAnnotations;

namespace Web.Models;

// Поля форми входу і реєстрації
public sealed class LoginModel
{
    [Required(ErrorMessage = "Введіть email")]
    [EmailAddress(ErrorMessage = "Неправильний формат email")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Введіть пароль")]
    [MinLength(6, ErrorMessage = "Пароль має містити щонайменше 6 символів")]
    public string Password { get; set; } = "";
}
