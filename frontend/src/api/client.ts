import axios, { type AxiosRequestConfig } from "axios";
const API_URL = import.meta.env.VITE_API_URL as string;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
});
export async function apiClient<T>(
    path: string,
    options?: AxiosRequestConfig,
): Promise<T> {
    const response = await axiosInstance.request<T>({ url: path, ...options });
    return response.data;
}
