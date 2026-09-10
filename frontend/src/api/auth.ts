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
export type RegisterCredentials = {
    name: string;
    password: string;
    password_confirmation: string;
};

type LoginResponse = {
    message: string;
    user_name: string;
};

export type RegisterResponse = {
    message: string;
    new_user: string;
};

export type RegisterValidationErrors = Partial<
    Record<keyof RegisterCredentials, string[]>
>;

export type ValidationErrorResponse = {
    message: string;
    errors: RegisterValidationErrors;
};
type LogoutResponse = {
    message: string;
};
export type LoginErrorResponse = {
    message: string;
};

type User = {
    name: string;
    password: string;
};

export const login = async (credentials: LoginCredentials) => {
    await getCSRFCookie();
    return apiClient<LoginResponse>("/login", {
        baseURL: BACKEND_URL,
        method: "POST",
        data: credentials,
    });
};

export const register = async (credentials: RegisterCredentials) => {
    await getCSRFCookie();

    return apiClient<RegisterResponse>("/register", {
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

export const getCurrentUser = () => {
    return apiClient<User>("/user");
};
