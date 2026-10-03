import {
    deleteTripAttachment,
    downloadTripAttachment,
    getTripAttachmentPreviewUrl,
    getTripAttachments,
    updateTripAttachmentName,
    uploadTripAttachments,
} from "@/api/tripAttachments";
import deleteIcon from "@/assets/icons/trip-attachment-icons/delete.svg";
import editIcon from "@/assets/icons/trip-attachment-icons/edit.svg";
import saveIcon from "@/assets/icons/trip-attachment-icons/save.svg";
import downloadIcon from "@/assets/icons/trip-attachment-icons/download.svg";
import eyePreviewIcon from "@/assets/icons/trip-attachment-icons/eye-preview.svg";
import viewIcon from "@/assets/icons/trip-attachment-icons/view.svg";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner/Spinner";
import { TripAttachmentsError } from "@/components/Trips/TripAttachmentsError";
import { TripAttachmentPreviewModal } from "@/components/Trips/TripAttachmentPreviewModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { tripEventsQueryKey } from "@/hooks/useTripEvents";
import {
    ACCEPTED_FILE_TYPES,
    formatDateOnly,
    formatFileSize,
    formatMIME,
    getAttachmentIcon,
    MAX_FILE_SIZE,
    MAX_FILES,
    validateFiles,
} from "@/libs/utils";
import type { TripAttachment } from "@/types/tripsTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

export const TripAttachmentsSection = ({ tripId }: { tripId: number }) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingAttachmentId, setEditingAttachmentId] = useState<number | null>(null);
    const [draftName, setDraftName] = useState<string>("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [clientValidationError, setClientValidationError] = useState<string | null>(null);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<number, string>>({});
    const [openingAttachmentId, setOpeningAttachmentId] = useState<number | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState<TripAttachment | null>(null);
    const [previewAttachment, setPreviewAttachment] = useState<TripAttachment | null>(null);
    const [isExpanded, setIsExpanded] = useLocalStorage("trip-attachments-expanded", true);

    const {
        isLoading,
        error,
        data: attachments,
    } = useQuery({
        queryKey: ["trip-attachments", tripId],
        queryFn: () => getTripAttachments(tripId),
        enabled: !!tripId,
    });

    const uploadMutation = useMutation({
        mutationFn: uploadTripAttachments.bind(null, tripId),
        onSuccess: async () => {
            setSelectedFiles([]);
            setClientValidationError(null);

            if (fileInputRef.current) fileInputRef.current.value = "";

            await queryClient.invalidateQueries({
                queryKey: ["trip-attachments", tripId],
            });
            await queryClient.invalidateQueries({
                queryKey: tripEventsQueryKey(tripId),
            });
        },
    });

    const downloadMutation = useMutation({
        mutationFn: downloadTripAttachment.bind(null, tripId),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTripAttachment.bind(null, tripId),
        onSuccess: async () => {
            setAttachmentToDelete(null);

            await queryClient.invalidateQueries({
                queryKey: ["trip-attachments", tripId],
            });
            await queryClient.invalidateQueries({
                queryKey: tripEventsQueryKey(tripId),
            });
        },
    });

    const changeNameMutation = useMutation({
        mutationFn: ({ attachmentId, displayName }: { attachmentId: number; displayName: string }) =>
            updateTripAttachmentName(tripId, attachmentId, displayName),
        onSuccess: async () => {
            setEditingAttachmentId(null);

            await queryClient.invalidateQueries({
                queryKey: ["trip-attachments", tripId],
            });
            await queryClient.invalidateQueries({
                queryKey: tripEventsQueryKey(tripId),
            });
        },
    });

    useEffect(() => {
        const imageAttachments = attachments?.data.filter(attachment => attachment.kind === "image") ?? [];
        const createdUrls: string[] = [];
        let isCancelled = false;

        const loadImagePreviews = async () => {
            const results = await Promise.allSettled(
                imageAttachments.map(async attachment => {
                    const url = await getTripAttachmentPreviewUrl(tripId, attachment.id);
                    createdUrls.push(url);

                    return [attachment.id, url] as const;
                })
            );

            if (isCancelled) {
                createdUrls.forEach(url => URL.revokeObjectURL(url));
                return;
            }

            const loadedPreviews = results.filter(result => result.status === "fulfilled").map(result => result.value);

            setImagePreviewUrls(Object.fromEntries(loadedPreviews));

            if (results.some(result => result.status === "rejected")) {
                setPreviewError("Some image previews could not be loaded.");
            }
        };

        void loadImagePreviews();

        return () => {
            isCancelled = true;

            createdUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [attachments, tripId]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.currentTarget.files ?? []);

        uploadMutation.reset();
        setSelectedFiles(files);

        setClientValidationError(files.length > 0 ? validateFiles(files) : null);
    };

    const handleRemoveFile = (fileIndex: number) => {
        const nextFiles = selectedFiles.filter((_, index) => index !== fileIndex);

        uploadMutation.reset();
        setSelectedFiles(nextFiles);
        setClientValidationError(nextFiles.length > 0 ? validateFiles(nextFiles) : null);

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUpload = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validateFiles(selectedFiles);
        setClientValidationError(validationError);

        if (validationError) return;

        uploadMutation.mutate(selectedFiles);
    };

    const handleOpenPreview = async (attachmentId: number) => {
        const previewWindow = window.open("about:blank", "_blank");

        setOpeningAttachmentId(attachmentId);
        setPreviewError(null);

        try {
            const url = await getTripAttachmentPreviewUrl(tripId, attachmentId);

            if (!previewWindow) {
                URL.revokeObjectURL(url);
                setPreviewError("Allow pop-ups to open the attachment preview.");
                return;
            } // если окно не открывается

            previewWindow.opener = null;
            previewWindow.location.href = url;

            // blob url
            window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch {
            previewWindow?.close();
            setPreviewError("Could not open the attachment preview.");
        } finally {
            setOpeningAttachmentId(null);
        }
    };

    const handlePreview = (attachment: TripAttachment) => {
        if (attachment.kind === "image" && imagePreviewUrls[attachment.id]) {
            setPreviewAttachment(attachment);
            return;
        }

        void handleOpenPreview(attachment.id);
    };

    const handleStartEditName = (attachment: TripAttachment) => {
        setEditingAttachmentId(attachment.id);
        setDraftName(attachment.display_name ?? attachment.original_name);
    };

    const handleSaveName = (attachmentId: number) => {
        changeNameMutation.mutate({ attachmentId, displayName: draftName });
    };

    const attachmentGroups = [
        {
            title: "Images",
            attachments: attachments?.data.filter(attachment => attachment.kind === "image") ?? [],
        },
        {
            title: "Documents",
            attachments: attachments?.data.filter(attachment => attachment.kind !== "image") ?? [],
        },
    ];
    const fileSelectionLabel =
        selectedFiles.length === 0
            ? "No files selected"
            : selectedFiles.length === 1
              ? selectedFiles[0].name
              : `${selectedFiles.length} files selected`;
    const totalAttachments = attachments?.data.length ?? 0;
    const contentId = `trip-attachments-content-${tripId}`;

    return (
        <>
            <header className="trip-attachments__section-header">
                <div>
                    <h2>Attachments</h2>
                    <span>{isLoading ? "Loading..." : `${totalAttachments} files`}</span>
                </div>
                <button
                    className="trip-attachments__toggle"
                    type="button"
                    aria-controls={contentId}
                    aria-expanded={isExpanded}
                    onClick={() => setIsExpanded(currentValue => !currentValue)}
                >
                    <span aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
                    {isExpanded ? "Hide attachments" : "Show attachments"}
                </button>
            </header>

            {isExpanded &&
                (isLoading ? (
                    <Spinner text="Loading attachments..." />
                ) : (
                    <div
                        className="trip-attachments"
                        id={contentId}
                    >
                        <div className="trip-attachments__upload-panel">
                            <div className="trip-attachments__upload-heading">
                                <h3>Upload files</h3>
                                <p>Add photos, receipts, reports or text notes related to this trip.</p>
                            </div>

                            <form
                                className="trip-attachments__upload"
                                onSubmit={handleUpload}
                            >
                                <div className="trip-attachments__file-field">
                                    <span className="trip-attachments__file-label">Files</span>
                                    <label
                                        className={`trip-attachments__file-picker${uploadMutation.isPending ? " is-disabled" : ""}`}
                                        htmlFor="trip-attachments-input"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            className="trip-attachments__file-input"
                                            id="trip-attachments-input"
                                            name="files[]"
                                            type="file"
                                            accept={ACCEPTED_FILE_TYPES}
                                            aria-describedby="trip-attachments-hint"
                                            disabled={uploadMutation.isPending}
                                            multiple
                                            onChange={handleFileChange}
                                        />
                                        <span className="trip-attachments__file-button">Choose files</span>
                                        <span
                                            className="trip-attachments__file-status"
                                            title={selectedFiles.length === 1 ? selectedFiles[0].name : undefined}
                                        >
                                            {fileSelectionLabel}
                                        </span>
                                    </label>
                                    <span
                                        className="trip-attachments__file-hint"
                                        id="trip-attachments-hint"
                                    >
                                        JPG, PNG, WebP, PDF, Office, TXT or CSV. Up to {MAX_FILES} files,{" "}
                                        {MAX_FILE_SIZE / (1024 * 1024)} MB each.
                                    </span>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <ul
                                        className="trip-attachments__queue"
                                        aria-label="Files selected for upload"
                                    >
                                        {selectedFiles.map((file, index) => (
                                            <li key={`${file.name}-${file.lastModified}-${index}`}>
                                                <span className="trip-attachments__file-info">
                                                    <strong>{file.name}</strong>
                                                    <span>{formatFileSize(file.size)}</span>
                                                </span>
                                                <button
                                                    className="trip-attachments__remove"
                                                    type="button"
                                                    title={`Remove ${file.name}`}
                                                    aria-label={`Remove ${file.name}`}
                                                    disabled={uploadMutation.isPending}
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <button
                                    className="entity-action entity-action--create"
                                    type="submit"
                                    disabled={selectedFiles.length === 0 || uploadMutation.isPending}
                                >
                                    {uploadMutation.isPending ? "Uploading..." : "Upload files"}
                                </button>

                                {uploadMutation.isSuccess && (
                                    <p
                                        className="success-message"
                                        role="status"
                                    >
                                        {uploadMutation.data.message}
                                    </p>
                                )}
                            </form>
                        </div>

                        <TripAttachmentsError
                            actionError={downloadMutation.error ?? deleteMutation.error}
                            clientValidationError={clientValidationError}
                            previewError={previewError}
                            queryError={error}
                            renameError={changeNameMutation.error}
                            uploadError={uploadMutation.error}
                        />

                        <div className="trip-attachments__library">
                            <div className="trip-attachments__library-header">
                                <div>
                                    <h3>Uploaded files</h3>
                                    <p>Preview supported files or download the original.</p>
                                </div>
                                <span>{totalAttachments}</span>
                            </div>

                            {totalAttachments === 0 ? (
                                <p className="empty-state">No attachments yet. Uploaded files will appear here.</p>
                            ) : (
                                attachmentGroups
                                    .filter(group => group.attachments.length > 0)
                                    .map(group => (
                                        <section
                                            className="trip-attachments__group"
                                            key={group.title}
                                        >
                                            <header className="trip-attachments__group-header">
                                                <h4>{group.title}</h4>
                                                <span>{group.attachments.length}</span>
                                            </header>

                                            <div className="trip-attachments__grid">
                                                {group.attachments.map(attachment => (
                                                    <article
                                                        className="trip-attachment-card"
                                                        key={attachment.id}
                                                    >
                                                        <div className="trip-attachment-card__preview">
                                                            {attachment.kind === "image" &&
                                                            imagePreviewUrls[attachment.id] ? (
                                                                <button
                                                                    className="trip-attachment-card__image-preview"
                                                                    type="button"
                                                                    title="Preview image"
                                                                    onClick={() => setPreviewAttachment(attachment)}
                                                                >
                                                                    <img
                                                                        src={imagePreviewUrls[attachment.id]}
                                                                        alt={attachment.original_name}
                                                                    />
                                                                    {attachment.can_preview && (
                                                                        <span
                                                                            className="trip-attachment-card__preview-hint"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <img
                                                                                src={eyePreviewIcon}
                                                                                alt="Preview icon"
                                                                            />
                                                                            Preview
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <div className="trip-attachment-card__document">
                                                                    <img
                                                                        src={getAttachmentIcon(
                                                                            attachment.original_name,
                                                                            attachment.mime_type
                                                                        )}
                                                                        alt="Attachment icon"
                                                                        aria-hidden="true"
                                                                    />
                                                                    <strong>{formatMIME(attachment.mime_type)}</strong>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="trip-attachment-card__body">
                                                            <div>
                                                                {editingAttachmentId === attachment.id ? (
                                                                    <div className="trip-attachment-card__name-edit">
                                                                        <input
                                                                            type="text"
                                                                            value={draftName}
                                                                            onChange={e => setDraftName(e.target.value)}
                                                                            autoFocus
                                                                        />
                                                                        <button
                                                                            className="trip-attachment-action trip-attachment-card__name-edit-trigger"
                                                                            type="button"
                                                                            title="Save name"
                                                                            disabled={changeNameMutation.isPending}
                                                                            onClick={() =>
                                                                                handleSaveName(attachment.id)
                                                                            }
                                                                        >
                                                                            <img src={saveIcon} alt="" aria-hidden="true" />
                                                                            {changeNameMutation.isPending
                                                                                ? "Saving..."
                                                                                : "Save"}
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="trip-attachment-card__name">
                                                                        <h5
                                                                            title={
                                                                                attachment.display_name ??
                                                                                attachment.original_name
                                                                            }
                                                                        >
                                                                            {attachment.display_name ??
                                                                                attachment.original_name}
                                                                        </h5>
                                                                        <button
                                                                            className="trip-attachment-action trip-attachment-card__name-edit-trigger"
                                                                            type="button"
                                                                            title="Edit name"
                                                                            onClick={() =>
                                                                                handleStartEditName(attachment)
                                                                            }
                                                                        >
                                                                            <img src={editIcon} alt="" aria-hidden="true" />
                                                                            Edit
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <dl>
                                                                <div>
                                                                    <dt>Type</dt>
                                                                    <dd>{formatMIME(attachment.mime_type)}</dd>
                                                                </div>
                                                                <div>
                                                                    <dt>Size</dt>
                                                                    <dd>{formatFileSize(attachment.size)}</dd>
                                                                </div>
                                                                <div>
                                                                    <dt>Uploaded</dt>
                                                                    <dd>{formatDateOnly(attachment.created_at)}</dd>
                                                                </div>
                                                            </dl>
                                                        </div>

                                                        <div className="trip-attachment-card__actions">
                                                            {attachment.can_preview && (
                                                                <button
                                                                    className="trip-attachment-action"
                                                                    type="button"
                                                                    title={
                                                                        attachment.kind === "image"
                                                                            ? "Preview image"
                                                                            : "Open preview in a new tab"
                                                                    }
                                                                    disabled={openingAttachmentId === attachment.id}
                                                                    onClick={() => handlePreview(attachment)}
                                                                >
                                                                    <img
                                                                        src={viewIcon}
                                                                        alt="Preview icon"
                                                                        width="18"
                                                                        height="18"
                                                                        aria-hidden="true"
                                                                    />
                                                                    {openingAttachmentId === attachment.id
                                                                        ? "Opening..."
                                                                        : "Preview"}
                                                                </button>
                                                            )}

                                                            <button
                                                                className="trip-attachment-action"
                                                                type="button"
                                                                title="Download original file"
                                                                disabled={
                                                                    downloadMutation.isPending &&
                                                                    downloadMutation.variables?.id === attachment.id
                                                                }
                                                                onClick={() => downloadMutation.mutate(attachment)}
                                                            >
                                                                <img
                                                                    src={downloadIcon}
                                                                    alt="Download icon"
                                                                    width="18"
                                                                    height="18"
                                                                    aria-hidden="true"
                                                                />
                                                                {downloadMutation.isPending &&
                                                                downloadMutation.variables?.id === attachment.id
                                                                    ? "Downloading..."
                                                                    : "Download"}
                                                            </button>

                                                            <button
                                                                className="trip-attachment-action trip-attachment-action--delete"
                                                                type="button"
                                                                title="Delete attachment"
                                                                disabled={
                                                                    deleteMutation.isPending &&
                                                                    attachmentToDelete?.id === attachment.id
                                                                }
                                                                onClick={() => setAttachmentToDelete(attachment)}
                                                            >
                                                                <img
                                                                    src={deleteIcon}
                                                                    alt="Delete icon"
                                                                    width="18"
                                                                    height="18"
                                                                    aria-hidden="true"
                                                                />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </section>
                                    ))
                            )}
                        </div>

                        <ConfirmModal
                            isOpen={attachmentToDelete !== null}
                            title="Delete attachment?"
                            message={
                                attachmentToDelete
                                    ? `The file "${attachmentToDelete.original_name}" will be deleted permanently.`
                                    : undefined
                            }
                            confirmText="Delete"
                            isConfirming={deleteMutation.isPending}
                            onConfirm={() => {
                                if (attachmentToDelete) deleteMutation.mutate(attachmentToDelete.id);
                            }}
                            onCancel={() => setAttachmentToDelete(null)}
                        />
                        <TripAttachmentPreviewModal
                            attachment={previewAttachment}
                            previewUrl={previewAttachment ? imagePreviewUrls[previewAttachment.id] : undefined}
                            isDownloading={
                                downloadMutation.isPending && downloadMutation.variables?.id === previewAttachment?.id
                            }
                            onClose={() => setPreviewAttachment(null)}
                            onDownload={() => {
                                if (previewAttachment) downloadMutation.mutate(previewAttachment);
                            }}
                        />
                    </div>
                ))}
        </>
    );
};
