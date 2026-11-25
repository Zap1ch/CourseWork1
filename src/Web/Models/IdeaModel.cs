using System.ComponentModel.DataAnnotations;

namespace Web.Models;

// Поле форми аналізу
public sealed class IdeaModel
{
    [Required(ErrorMessage = "Опишіть ідею")]
    [StringLength(2000, MinimumLength = 20, ErrorMessage = "Опис ідеї має містити від 20 до 2000 символів")]
    public string IdeaText { get; set; } = "";
}
