export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const GO_API_BASE_URL = import.meta.env.VITE_GO_API_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
  durationMs: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
  baseUrl: string = API_BASE_URL
): Promise<ApiResponse<T>> {
  const startTime = performance.now();
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const durationMs = Math.round(performance.now() - startTime);
    const text = await res.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!res.ok) {
      const errorMessage =
        body?.message || body?.error || `HTTP ${res.status}: ${res.statusText}`;
      return {
        error: errorMessage,
        statusCode: res.status,
        durationMs,
      };
    }

    return {
      data: body as T,
      statusCode: res.status,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      error: err.message || 'Network request failed. Is the backend running on port 3000?',
      statusCode: 0,
      durationMs,
    };
  }
}
