// Дата у форматі 27.11.2026 22:25, як у Blazor-клієнті
export function formatDate(value: string, separator = " ") {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");

  const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return `${day}${separator}${time}`;
}
