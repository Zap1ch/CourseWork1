import type { ApiErrorResponse } from "../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    // fetch падає, коли сервер не відповідає
    throw new Error("Сервер недоступний. Перевірте, чи запущено backend.");
  }

  // Токена немає або він прострочений: виходимо і відкриваємо сторінку входу
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Сесія завершилась. Увійдіть знову.");
  }

  const data = (await parseResponse(response)) as ApiErrorResponse | T | null;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    throw new Error(
      errorData?.error ||
        errorData?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}
