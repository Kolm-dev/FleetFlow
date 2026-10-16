import { Button } from "@/components/ui/button";
import pdfIcon from "@/assets/icons/trip-attachment-icons/icons-documents/pdf.png";
import txtIcon from "@/assets/icons/trip-attachment-icons/icons-documents/txt.png";
import imageIcon from "@/assets/icons/trip-attachment-icons/icons-documents/img.png";
import { formatDateTime, formatFileSize } from "@/libs/utils";
import { Download, Eye, Trash2 } from "lucide-react";

export type AttachmentFile = {
    id: number;
    original_name: string;
    mime_type: string;
    size: number;
    user_id: number | null;
    uploaded_at: string;
};

type AttachmentFileRowProps<T extends AttachmentFile> = {
    attachment: T;
    onPreview?: (attachment: T) => void;
    onDownload: (attachment: T) => void;
    onDelete?: (attachment: T) => void;
    isDownloading?: boolean;
    isDeleting?: boolean;
};

export const AttachmentFileRow = <T extends AttachmentFile>({
    attachment,
    onPreview,
    onDownload,
    onDelete,
    isDownloading = false,
    isDeleting = false,
}: AttachmentFileRowProps<T>) => {
    const isImage = attachment.mime_type.startsWith("image/");
    const extension = attachment.original_name.split(".").pop()?.toLowerCase();
    const documentIcon = extension === "pdf" ? pdfIcon : extension === "txt" ? txtIcon : null;

    return (
        <li className="flex min-w-0 flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {documentIcon ? (
                        <img
                            className="size-5 object-contain"
                            src={documentIcon}
                            alt=""
                        />
                    ) : isImage ? (
                        <img
                            className="size-5 object-contain"
                            src={imageIcon}
                            alt=""
                        />
                    ) : (
                        <img
                            className="size-5 object-contain"
                            src={txtIcon}
                            alt=""
                        />
                    )}
                </span>
                <div className="grid min-w-0 gap-1">
                    {isImage && onPreview ? (
                        <Button
                            className="h-auto min-w-0 justify-start gap-1.5 bg-transparent px-0 py-0 text-left text-sm font-medium text-foreground hover:bg-transparent hover:underline"
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => onPreview(attachment)}
                        >
                            <span className="truncate">{attachment.original_name}</span>
                            <Eye
                                className="size-3.5 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </Button>
                    ) : (
                        <span
                            className="truncate text-sm font-medium"
                            title={attachment.original_name}
                        >
                            {attachment.original_name}
                        </span>
                    )}
                    <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.size)}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={attachment.uploaded_at}>{formatDateTime(attachment.uploaded_at)}</time>
                        <span aria-hidden="true">·</span>
                        <span>User ID: {attachment.user_id ?? "—"}</span>
                    </div>
                </div>
            </div>
            <div className="flex shrink-0 gap-2">
                <Button
                    className="ml-0 w-full sm:w-auto"
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isDownloading || isDeleting}
                    onClick={() => onDownload(attachment)}
                >
                    <Download aria-hidden="true" />
                    {isDownloading ? "Downloading…" : "Download"}
                </Button>
                {onDelete && (
                    <Button
                        className="ml-0 w-full sm:w-auto"
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting || isDownloading}
                        onClick={() => onDelete(attachment)}
                    >
                        <Trash2 aria-hidden="true" />
                        {isDeleting ? "Deleting…" : "Delete"}
                    </Button>
                )}
            </div>
        </li>
    );
};
