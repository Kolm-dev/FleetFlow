import { apiClient } from "@/api/client";
import type { TripAttachmentsResponse, UploadTripAttachmentsResponse } from "@/types/tripsTypes";


export const getTripAttachments = (tripId: number) => {
    return apiClient<TripAttachmentsResponse>(`/trips/${tripId}/attachments`);
};

export const uploadTripAttachments = (tripId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files[]", file));
    return apiClient<UploadTripAttachmentsResponse>(`/trips/${tripId}/attachments`, {
        method: "POST",
        data: formData,
    });
};

export const deleteTripAttachment = (tripId: number, attachmentId: number) => {
    return apiClient<void>(`/trips/${tripId}/attachments/${attachmentId}`, {
        method: "DELETE",
    });
};

export const downloadTripAttachment = async (tripId: number, attachment: { id: number; original_name: string }) => {
    // Запрашиваем файл как Blob
    const blob = await apiClient<Blob>(`/trips/${tripId}/attachments/${attachment.id}/download`, {
        method: "GET",
        responseType: "blob",
    });
    // Создаём временный object URL для скачанного Blob
    const url = URL.createObjectURL(blob);
    // Создаём временную ссылку, кликаем по ней -> браузер скачивает файл
    const link = document.createElement("a");
    link.href = url;

    link.download = attachment.original_name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const getTripAttachmentPreviewUrl = async (tripId: number, attachmentId: number) => {
    const blob = await apiClient<Blob>(`/trips/${tripId}/attachments/${attachmentId}/content`, {
        responseType: "blob",
    });
    const url = URL.createObjectURL(blob);
    return url;
};

export const updateTripAttachmentName = (tripId: number, attachmentId: number, displayName: string) => {
    return apiClient<void>(`/trips/${tripId}/attachments/${attachmentId}`, {
        method: "PATCH",
        data: {
            display_name: displayName,
        },
    });
};
