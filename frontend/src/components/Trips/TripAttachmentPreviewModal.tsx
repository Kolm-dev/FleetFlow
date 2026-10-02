import downloadIcon from "@/assets/icons/trip-attachment-icons/download.svg";
import type { TripAttachment } from "@/types/tripsTypes";
import { useEffect, useRef } from "react";

type TripAttachmentPreviewModalProps = {
    attachment: TripAttachment | null;
    previewUrl?: string;
    isDownloading: boolean;
    onClose: () => void;
    onDownload: () => void;
};

export const TripAttachmentPreviewModal = ({
    attachment,
    previewUrl,
    isDownloading,
    onClose,
    onDownload,
}: TripAttachmentPreviewModalProps) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!attachment || !previewUrl) return;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [attachment, onClose, previewUrl]);

    if (!attachment || !previewUrl) return null;

    return (
        <div
            className="trip-attachment-preview-modal"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="trip-attachment-preview-modal__content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trip-attachment-preview-title"
                onClick={event => event.stopPropagation()}
            >
                <header className="trip-attachment-preview-modal__header">
                    <div>
                        <span>Image preview</span>
                        <h2 id="trip-attachment-preview-title">{attachment.original_name}</h2>
                    </div>
                    <button
                        ref={closeButtonRef}
                        className="trip-attachment-preview-modal__close"
                        type="button"
                        title="Close preview"
                        aria-label="Close preview"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <div className="trip-attachment-preview-modal__image">
                    <img
                        src={previewUrl}
                        alt={attachment.original_name}
                    />
                </div>

                <footer className="trip-attachment-preview-modal__footer">
                    <button
                        className="trip-attachment-action"
                        type="button"
                        disabled={isDownloading}
                        onClick={onDownload}
                    >
                        <img
                            src={downloadIcon}
                            alt=""
                            aria-hidden="true"
                        />
                        {isDownloading ? "Downloading..." : "Download original"}
                    </button>
                </footer>
            </div>
        </div>
    );
};
