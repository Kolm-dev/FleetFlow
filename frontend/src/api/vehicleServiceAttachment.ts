import type { VehicleServiceAttachmentUploadResponse, VehicleServiceAttachmentsResponse } from "@/types/vehicleServicesTypes";
import { apiClient } from "./client";

export const uploadVehicleServiceAttachments = (vehicleId: number, serviceId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files[]", file));

    return apiClient<VehicleServiceAttachmentUploadResponse>(`vehicles/${vehicleId}/services/${serviceId}/attachments`, {
        method: "POST",
        data: formData,
    });
};

export const getVehicleServiceAttachments = (vehicleId: number, serviceId: number) =>
    apiClient<VehicleServiceAttachmentsResponse>(`vehicles/${vehicleId}/services/${serviceId}/attachments`);

export const deleteVehicleServiceAttachment = (vehicleId: number, serviceId: number, attachmentId: number) => {
    return apiClient<void>(`vehicles/${vehicleId}/services/${serviceId}/attachments/${attachmentId}`, {
        method: "DELETE",
    });
};

export const downloadVehicleServiceAttachment = async (
    vehicleId: number,
    serviceId: number,
    attachment: { id: number; original_name: string },
) => {
    const blob = await apiClient<Blob>(
        `vehicles/${vehicleId}/services/${serviceId}/attachments/${attachment.id}/download`,
        {
            method: "GET",
            responseType: "blob",
        },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.original_name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const getVehicleServiceAttachmentPreviewUrl = async (
    vehicleId: number,
    serviceId: number,
    attachmentId: number,
) => {
    const blob = await apiClient<Blob>(
        `vehicles/${vehicleId}/service/${serviceId}/attachments/${attachmentId}/content`,
        { responseType: "blob" },
    );
    return URL.createObjectURL(blob);
};
