import {
    downloadVehicleServiceAttachment,
    getVehicleServiceAttachmentPreviewUrl,
    getVehicleServiceAttachments,
    uploadVehicleServiceAttachments,
} from "@/api/vehicleServiceAttachment";
import pdfIcon from "@/assets/icons/trip-attachment-icons/icons-documents/pdf.png";
import txtIcon from "@/assets/icons/trip-attachment-icons/icons-documents/txt.png";
import { formatDateTime, formatFileSize } from "@/libs/utils";
import type { VehicleServiceAttachment as Attachment } from "@/types/vehicleServicesTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

export interface ComponentProps {
    vehicleId: number;
    serviceId: number;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const VehicleServiceAttachment = ({ vehicleId, serviceId }: ComponentProps) => {
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [preview, setPreview] = useState<{ attachment: Attachment; url: string } | null>(null);
    const queryKey = ["vehicle-service-attachments", vehicleId, serviceId];
    const { data } = useQuery({
        queryKey,
        queryFn: () => getVehicleServiceAttachments(vehicleId, serviceId),
    });

    const uploadMutation = useMutation({
        mutationFn: () => uploadVehicleServiceAttachments(vehicleId, serviceId, files),
        onSuccess: async () => {
            setFiles([]);
            if (inputRef.current) inputRef.current.value = "";
            await queryClient.invalidateQueries({ queryKey });
        },
    });
    const downloadMutation = useMutation({
        mutationFn: (attachment: Attachment) =>
            downloadVehicleServiceAttachment(vehicleId, serviceId, attachment),
    });

    useEffect(() => () => {
        if (preview) URL.revokeObjectURL(preview.url);
    }, [preview]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFiles(Array.from(event.currentTarget.files ?? []));
    };

    const handleUpload = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (files.length === 0 || files.length > MAX_FILES || files.some(file => file.size > MAX_FILE_SIZE)) return;
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
        <section>
            <h3>Attachments</h3>
            <form onSubmit={handleUpload}>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.txt,.pdf"
                    multiple
                    onChange={handleFileChange}
                />
                <button
                    type="submit"
                    disabled={files.length === 0 || files.length > MAX_FILES || files.some(file => file.size > MAX_FILE_SIZE) || uploadMutation.isPending}
                >
                    Add attachments
                </button>
            </form>

            <ul>
                {(data?.data ?? []).map(attachment => {
                    const isImage = attachment.mime_type.startsWith("image/");
                    const icon = attachment.original_name.toLowerCase().endsWith(".pdf") ? pdfIcon : txtIcon;

                    return (
                        <li key={attachment.id}>
                            {isImage ? (
                                <button type="button" onClick={() => void handlePreview(attachment)}>
                                    {attachment.original_name}
                                </button>
                            ) : (
                                <>
                                    <img src={icon} alt="" /> {attachment.original_name}
                                </>
                            )}
                            <span>{formatFileSize(attachment.size)}</span>
                            <time dateTime={attachment.uploaded_at}>{formatDateTime(attachment.uploaded_at)}</time>
                            <span>User ID: {attachment.user_id}</span>
                            <button type="button" onClick={() => downloadMutation.mutate(attachment)}>Download</button>
                        </li>
                    );
                })}
            </ul>

            {preview && (
                <div role="presentation" onClick={() => setPreview(null)}>
                    <div role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
                        <button type="button" onClick={() => setPreview(null)}>Close</button>
                        <h4>{preview.attachment.original_name}</h4>
                        <img src={preview.url} alt={preview.attachment.original_name} />
                        <button type="button" onClick={() => downloadMutation.mutate(preview.attachment)}>Download</button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default VehicleServiceAttachment;
