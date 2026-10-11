import axios from "axios";

type BackendErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

export const getBackendErrorMessages = (error: unknown, fallbackMessage: string): string[] => {
    if (error == null) {
        return [];
    }

    if (!axios.isAxiosError<BackendErrorResponse>(error)) {
        return [fallbackMessage];
    }

    const errors = error.response?.data.errors;
    const validationMessages = errors ? Object.values(errors).flat() : [];

    if (validationMessages.length > 0) {
        return validationMessages;
    }

    return [error.response?.data.message ?? fallbackMessage];
};

export const getBackendErrorMessage = (error: unknown, fallbackMessage: string) =>
    getBackendErrorMessages(error, fallbackMessage).join(" ") || fallbackMessage;
