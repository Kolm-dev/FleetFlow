const API_URL = import.meta.env.VITE_API_URL;

export async function apiClient<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const message = await response.text();

        throw new Error(
            message || `API request failed: ${response.status}`,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}
