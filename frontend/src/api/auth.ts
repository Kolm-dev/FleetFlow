import { apiClient } from "@/api/client";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
export const getCSRFCookie = () => {
    return apiClient<void>("/sanctum/csrf-cookie", {
        baseURL: BACKEND_URL,
    });
};
type LoginCredentials = {
    name: string;
    password: string;
};

type LoginResponse = {
    message: string;
    user_name: string;
};
type LogoutResponse = {
    message: string;
};
export type LoginErrorResponse = {
    message: string;
};
export const login = async (credentials: LoginCredentials) => {
    await getCSRFCookie();
    return apiClient<LoginResponse>("/login", {
        baseURL: BACKEND_URL,
        method: "POST",
        data: credentials,
    });
};

export const logout = async () => {
    return apiClient<LogoutResponse>("/logout", {
        baseURL: BACKEND_URL,
        method: "POST",
    });
};

type User = {
    name: string;
    password: string;
};

export const getCurrentUser = () => {
    return apiClient<User>("/user");
};
