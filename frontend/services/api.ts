const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://shahid-vontobel-api.azurewebsites.net";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "content-type": "application/json",
      "x-tenant-id": "tenant-dev",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? payload.error ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body: unknown) {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) });
  },
  delete<T>(path: string, body?: unknown) {
    return request<T>(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined });
  },
  upload<T>(path: string, formData: FormData) {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "x-tenant-id": "tenant-dev"
      },
      body: formData
    }).then(async (response) => {
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? payload.error ?? `Request failed with ${response.status}`);
      }

      return response.json() as Promise<T>;
    });
  }
};
