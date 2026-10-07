import axios from "axios";

type BackendErrorResponse = {
    message?: string;
};

export const getBackendErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (!axios.isAxiosError<BackendErrorResponse>(error)) {
        return fallbackMessage;
    }

    return error.response?.data.message ?? fallbackMessage;
};
