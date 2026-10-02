import axios from "axios";

type ValidationErrorResponse = {
    message: string;
    errors: Record<string, string[]>;
};

type TripAttachmentsErrorProps = {
    actionError: Error | null;
    clientValidationError: string | null;
    previewError: string | null;
    queryError: Error | null;
    renameError: Error | null;
    uploadError: Error | null;
};

export const TripAttachmentsError = ({
    actionError,
    clientValidationError,
    previewError,
    queryError,
    renameError,
    uploadError,
}: TripAttachmentsErrorProps) => {
    const backendValidationErrors =
        axios.isAxiosError<ValidationErrorResponse>(uploadError) && uploadError.response?.status === 422
            ? Object.values(uploadError.response.data.errors).flat()
            : [];

    const uploadErrorMessage =
        uploadError && backendValidationErrors.length === 0 ? "Could not upload files. Please try again." : null;

    const actionErrorMessage = actionError ? "Could not process the attachment. Please try again." : null;
    const renameErrorMessage = renameError ? "Could not rename the attachment. Please try again." : null;

    return (
        <>
            {clientValidationError && (
                <p
                    className="error-message"
                    role="alert"
                >
                    {clientValidationError}
                </p>
            )}

            {backendValidationErrors.length > 0 && (
                <ul
                    className="error-message"
                    role="alert"
                >
                    {backendValidationErrors.map((message, index) => (
                        <li key={`${message}-${index}`}>{message}</li>
                    ))}
                </ul>
            )}

            {uploadErrorMessage && (
                <p
                    className="error-message"
                    role="alert"
                >
                    {uploadErrorMessage}
                </p>
            )}

            {queryError && (
                <p
                    className="error-message"
                    role="alert"
                >
                    Could not load attachments. Please refresh the page.
                </p>
            )}

            {previewError && (
                <p
                    className="error-message"
                    role="alert"
                >
                    {previewError}
                </p>
            )}

            {actionErrorMessage && (
                <p
                    className="error-message"
                    role="alert"
                >
                    {actionErrorMessage}
                </p>
            )}

            {renameErrorMessage && (
                <p
                    className="error-message"
                    role="alert"
                >
                    {renameErrorMessage}
                </p>
            )}
        </>
    );
};
