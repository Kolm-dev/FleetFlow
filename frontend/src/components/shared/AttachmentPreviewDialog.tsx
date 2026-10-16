import type { AttachmentFile } from "@/components/shared/AttachmentFileRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useEffect } from "react";

type AttachmentPreviewDialogProps<T extends AttachmentFile> = {
    attachment: T;
    previewUrl: string;
    onClose: () => void;
    onDownload: (attachment: T) => void;
    isDownloading?: boolean;
};

export const AttachmentPreviewDialog = <T extends AttachmentFile>({
    attachment,
    previewUrl,
    onClose,
    onDownload,
    isDownloading = false,
}: AttachmentPreviewDialogProps<T>) => {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            role="presentation"
            onClick={onClose}
        >
            <Card
                className="max-h-[90vh] w-full max-w-4xl overflow-hidden shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="attachment-preview-title"
                onClick={event => event.stopPropagation()}
            >
                <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-center border-b pb-4">
                    <CardTitle id="attachment-preview-title" className="truncate text-base" title={attachment.original_name}>
                        {attachment.original_name}
                    </CardTitle>
                    <Button type="button" size="icon" variant="ghost" aria-label="Close preview" onClick={onClose}>
                        <X aria-hidden="true" />
                    </Button>
                </CardHeader>
                <CardContent className="grid min-h-0 gap-4 p-4">
                    <div className="grid min-h-0 place-items-center overflow-auto rounded-lg bg-muted/40 p-2">
                        <img
                            className="max-h-[65vh] max-w-full object-contain"
                            src={previewUrl}
                            alt={attachment.original_name}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="button" disabled={isDownloading} onClick={() => onDownload(attachment)}>
                            <Download aria-hidden="true" />
                            {isDownloading ? "Downloading…" : "Download original"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
