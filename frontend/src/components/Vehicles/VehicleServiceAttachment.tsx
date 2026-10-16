import {
    deleteVehicleServiceAttachment,
    downloadVehicleServiceAttachment,
    getVehicleServiceAttachmentPreviewUrl,
    getVehicleServiceAttachments,
    uploadVehicleServiceAttachments,
} from "@/api/vehicleServiceAttachment";
import { AttachmentFileRow } from "@/components/shared/AttachmentFileRow";
import { AttachmentPreviewDialog } from "@/components/shared/AttachmentPreviewDialog";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBackendErrorMessages } from "@/libs/errors";
import { validateFiles } from "@/libs/utils";
import type { VehicleServiceAttachment as Attachment } from "@/types/vehicleServicesTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Paperclip } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

export interface ComponentProps {
    vehicleId: number;
    serviceId: number;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "txt", "pdf"]);

const validateServiceFiles = (files: File[]) => {
    const commonValidationError = validateFiles(files);
    if (commonValidationError) return commonValidationError;

    const unsupportedFile = files.find(file => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        return !extension || !ACCEPTED_EXTENSIONS.has(extension);
    });

    return unsupportedFile ? `"${unsupportedFile.name}" has an unsupported file type. Choose PNG, JPEG, TXT, or PDF.` : null;
};

const VehicleServiceAttachment = ({ vehicleId, serviceId }: ComponentProps) => {
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [clientValidationError, setClientValidationError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
    const [preview, setPreview] = useState<{ attachment: Attachment; url: string } | null>(null);
    const queryKey = ["vehicle-service-attachments", vehicleId, serviceId];
    const { data, error, isLoading } = useQuery({
        queryKey,
        queryFn: () => getVehicleServiceAttachments(vehicleId, serviceId),
    });

    const uploadMutation = useMutation({
        mutationFn: () => uploadVehicleServiceAttachments(vehicleId, serviceId, files),
        onMutate: () => setSuccessMessage(null),
        onSuccess: async () => {
            setFiles([]);
            setClientValidationError(null);
            setSuccessMessage("Attachments uploaded successfully.");
            if (inputRef.current) inputRef.current.value = "";
            await queryClient.invalidateQueries({ queryKey });
        },
    });
    const downloadMutation = useMutation({
        mutationFn: (attachment: Attachment) => downloadVehicleServiceAttachment(vehicleId, serviceId, attachment),
        onMutate: () => setSuccessMessage(null),
        onSuccess: () => setSuccessMessage("Attachment downloaded successfully."),
    });
    const deleteMutation = useMutation({
        mutationFn: (attachment: Attachment) =>
            deleteVehicleServiceAttachment(vehicleId, serviceId, attachment.id),
        onMutate: () => setSuccessMessage(null),
        onSuccess: async () => {
            setAttachmentToDelete(null);
            setSuccessMessage("Attachment deleted successfully.");
            await queryClient.invalidateQueries({ queryKey });
        },
    });
    const selectedFilesAreValid = files.length > 0 && validateServiceFiles(files) === null;
    const attachmentGroups = [
        {
            title: "Photos",
            attachments: data?.data.filter(attachment => attachment.mime_type.startsWith("image/")) ?? [],
        },
        {
            title: "Documents",
            attachments: data?.data.filter(attachment => !attachment.mime_type.startsWith("image/")) ?? [],
        },
    ];

    useEffect(
        () => () => {
            if (preview) URL.revokeObjectURL(preview.url);
        },
        [preview]
    );

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.currentTarget.files ?? []);
        uploadMutation.reset();
        setFiles(selectedFiles);
        setClientValidationError(selectedFiles.length > 0 ? validateServiceFiles(selectedFiles) : null);
    };

    const handleUpload = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationError = validateServiceFiles(files);
        setClientValidationError(validationError);
        if (validationError) return;

        uploadMutation.mutate();
    };

    const handlePreview = async (attachment: Attachment) => {
        const url = await getVehicleServiceAttachmentPreviewUrl(vehicleId, serviceId, attachment.id);
        setPreview(current => {
            if (current) URL.revokeObjectURL(current.url);
            return { attachment, url };
        });
    };

    return (
        <Card className="min-w-0 gap-0 py-0">
            <CardHeader className="gap-1 border-b px-4 py-3 sm:px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Paperclip
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                    Attachments
                    <span className="font-normal text-muted-foreground">{data?.data.length ?? 0}</span>
                </CardTitle>
                <CardDescription>Photos and documents for this service record.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:p-5">
                <form
                    className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                    onSubmit={handleUpload}
                >
                    <div className="grid min-w-0 gap-1.5">
                        <label
                            className="sr-only"
                            htmlFor={`service-attachments-${serviceId}`}
                        >
                            Choose service attachments
                        </label>
                        <input
                            ref={inputRef}
                            id={`service-attachments-${serviceId}`}
                            className="block w-full min-w-0 cursor-pointer rounded-md border border-input bg-background text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:border-0 file:border-r file:border-input file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                            type="file"
                            accept=".png,.jpg,.jpeg,.txt,.pdf"
                            multiple
                            onChange={handleFileChange}
                        />
                        <p className="m-0 text-xs text-muted-foreground">
                            PNG, JPEG, TXT or PDF · up to {MAX_FILES} files · {MAX_FILE_SIZE / 1024 / 1024} MB each
                        </p>
                        {files.length > 0 && (
                            <p
                                className="m-0 truncate text-xs text-muted-foreground"
                                title={files.map(file => file.name).join(", ")}
                            >
                                {files.length} selected: {files.map(file => file.name).join(", ")}
                            </p>
                        )}
                    </div>
                    <Button
                        className="w-full sm:w-auto"
                        type="submit"
                        disabled={!selectedFilesAreValid || uploadMutation.isPending}
                    >
                        <FilePlus2 aria-hidden="true" />
                        {uploadMutation.isPending ? "Uploading…" : "Add attachments"}
                    </Button>
                </form>

                <ErrorMessage messages={clientValidationError} />
                <ErrorMessage
                    messages={getBackendErrorMessages(uploadMutation.error, "Could not upload attachments. Please try again.")}
                />
                <ErrorMessage
                    messages={getBackendErrorMessages(
                        downloadMutation.error ?? deleteMutation.error,
                        "Could not process the attachment. Please try again."
                    )}
                />
                {error && (
                    <ErrorMessage
                        messages={getBackendErrorMessages(error, "Could not load attachments. Please refresh the page.")}
                    />
                )}
                {successMessage && (
                    <SuccessMessage
                        tag="attachment"
                        successText={successMessage}
                        onComplete={() => setSuccessMessage(null)}
                    />
                )}

                {isLoading ? (
                    <p className="m-0 text-sm text-muted-foreground" role="status">Loading attachments…</p>
                ) : (data?.data.length ?? 0) > 0 ? (
                    <div className="grid gap-4">
                        {attachmentGroups.map(group =>
                            group.attachments.length > 0 ? (
                                <section
                                    className="grid min-w-0 gap-2"
                                    key={group.title}
                                >
                                    <h4 className="m-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {group.title} <span className="font-normal">({group.attachments.length})</span>
                                    </h4>
                                    <ul className="m-0 grid list-none gap-2 p-0">
                                        {group.attachments.map(attachment => (
                                            <AttachmentFileRow
                                                key={attachment.id}
                                                attachment={attachment}
                                                onPreview={imageAttachment => void handlePreview(imageAttachment)}
                                                onDownload={file => downloadMutation.mutate(file)}
                                                onDelete={file => setAttachmentToDelete(file)}
                                                isDownloading={
                                                    downloadMutation.isPending && downloadMutation.variables?.id === attachment.id
                                                }
                                                isDeleting={
                                                    deleteMutation.isPending && deleteMutation.variables?.id === attachment.id
                                                }
                                            />
                                        ))}
                                    </ul>
                                </section>
                            ) : null
                        )}
                    </div>
                ) : !error ? (
                    <div className="grid justify-items-center gap-1 rounded-lg border border-dashed px-4 py-6 text-center">
                        <Paperclip
                            className="size-5 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <p className="m-0 text-sm font-medium">No attachments yet</p>
                        <p className="m-0 text-xs text-muted-foreground">
                            Choose files above to add them to this service.
                        </p>
                    </div>
                ) : null}
            </CardContent>
            {preview && (
                <AttachmentPreviewDialog
                    attachment={preview.attachment}
                    previewUrl={preview.url}
                    onClose={() => setPreview(null)}
                    onDownload={file => downloadMutation.mutate(file)}
                    isDownloading={
                        downloadMutation.isPending && downloadMutation.variables?.id === preview.attachment.id
                    }
                />
            )}
            <ConfirmModal
                isOpen={attachmentToDelete !== null}
                title="Delete attachment?"
                message={
                    attachmentToDelete
                        ? `${attachmentToDelete.original_name} will be permanently deleted.`
                        : undefined
                }
                confirmText="Delete attachment"
                isConfirming={deleteMutation.isPending}
                onCancel={() => setAttachmentToDelete(null)}
                onConfirm={() => {
                    if (attachmentToDelete) deleteMutation.mutate(attachmentToDelete);
                }}
            />
        </Card>
    );
};

export default VehicleServiceAttachment;
