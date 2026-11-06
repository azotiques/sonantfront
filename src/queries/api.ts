import { keycloak } from "#/keycloak";

const API_URL = `${import.meta.env.VITE_API_LINK}/api/v1`;

export type ErrorResponse = {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
};

export class ApiError extends Error {
  status: number;
  error: string;
  path?: string;
  timestamp?: string;

  constructor(status: number, error: string, message: string, path?: string, timestamp?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.error = error;
    this.path = path;
    this.timestamp = timestamp;
  }
}

type ApiInit = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: unknown
}

export async function api<T>(path: string, { method = 'GET', body }: ApiInit = {}): Promise<T> {
  await keycloak.updateToken(30).catch(() => keycloak.login());

  const headers: Record<string, string> = {
    Authorization: `Bearer ${keycloak.token}`
  };

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body)
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const errBody = text ? (JSON.parse(text) as Partial<ErrorResponse>) : undefined;
      if (errBody && (errBody.message || errBody.error)) {
        throw new ApiError(
          errBody.status ?? res.status,
          errBody.error ?? (res.statusText || 'Error'),
          errBody.message ?? errBody.error ?? `${method} ${path} failed: ${res.status}`,
          errBody.path,
          errBody.timestamp
        );
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }

    throw new ApiError(
      res.status,
      res.statusText || 'Error',
      text || `${method} ${path} failed: ${res.status} ${res.statusText}`
    );
  }

  return (text ? JSON.parse(text) : undefined) as T;
}
