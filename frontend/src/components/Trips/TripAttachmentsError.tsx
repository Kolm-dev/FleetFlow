import axios from "axios";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

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
            <ErrorMessage messages={clientValidationError} />
            <ErrorMessage messages={backendValidationErrors} />
            <ErrorMessage messages={uploadErrorMessage} />
            <ErrorMessage
                messages={queryError ? "Could not load attachments. Please refresh the page." : null}
            />
            <ErrorMessage messages={previewError} />
            <ErrorMessage messages={actionErrorMessage} />
            <ErrorMessage messages={renameErrorMessage} />
        </>
    );
};
