import { keycloak } from "#/keycloak";

const API_URL = `${import.meta.env.VITE_API_LINK}/api/v1`;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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

  if (!res.ok) {
    throw new ApiError(res.status, `${method} ${path} failed: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
