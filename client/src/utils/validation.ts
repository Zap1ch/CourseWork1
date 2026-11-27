// Перевірка полів форм, такі самі повідомлення, як у Blazor-клієнті
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailError(email: string) {
  if (!email.trim()) return "Введіть email";
  if (!EMAIL_PATTERN.test(email.trim())) return "Неправильний формат email";
  return "";
}

export function getPasswordError(password: string) {
  if (!password) return "Введіть пароль";
  if (password.length < 6) return "Пароль має містити щонайменше 6 символів";
  return "";
}

export function getConfirmError(password: string, confirmPassword: string) {
  if (!confirmPassword) return "Повторіть пароль";
  if (password !== confirmPassword) return "Паролі не збігаються";
  return "";
}
