import csvDocumentIcon from "@/assets/icons/trip-attachment-icons/icons-documents/csv.png";
import docDocumentIcon from "@/assets/icons/trip-attachment-icons/icons-documents/doc.png";
import imageDocumentIcon from "@/assets/icons/trip-attachment-icons/icons-documents/img.png";
import pdfDocumentIcon from "@/assets/icons/trip-attachment-icons/icons-documents/pdf.png";
import txtDocumentIcon from "@/assets/icons/trip-attachment-icons/icons-documents/txt.png";
import xlsDocumentIcon from "@/assets/icons/trip-attachment-icons/icons-documents/xls.png";

const numberFormatter = new Intl.NumberFormat("en-US");

const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const formatCurrency = (value: number | string | null | undefined, fallback = "-") => {
    if (value === null || value === undefined || value === "") return fallback;

    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? usdFormatter.format(numericValue) : fallback;
};

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatMileage = (value: number) => `${formatNumber(value)} km`;

export const formatNullableValue = (value: number | string | null | undefined, fallback = "-") => value ?? fallback;

export const formatNumberWithSuffix = (value: number | null, suffix = "", fallback = "Not specified") =>
    value === null ? fallback : `${formatNumber(value)}${suffix}`;

export const toNullableNumber = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === "") return null;

    const numberValue = Number(trimmedValue);

    return Number.isFinite(numberValue) ? numberValue : null;
};

export const getValidPage = (value: string | null) => {
    const page = Number(value);

    return Number.isInteger(page) && page > 0 ? page : 1;
};

export const toDateInputValue = (value?: string) => value?.slice(0, 10) ?? "";

export const formatDateOnly = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(`${value.slice(0, 10)}T00:00:00`));

type FormatDateTimeOptions = {
    fallback?: string;
    hour12?: boolean;
    locale?: string;
    timeZone?: string;
};

export const formatDateTime = (value?: string | null, options: FormatDateTimeOptions = {}) => {
    const { fallback = "-", hour12, locale = "en-US", timeZone } = options;

    if (!value) return fallback;

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12,
        timeZone,
    }).format(new Date(value));
};

export const isHttpUrl = (value: string) => {
    try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

export const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes < 0) return "-";
    if (bytes < 1024) return `${bytes} B`;

    const units = ["KB", "MB"];
    const unitIndex = Math.min(Math.max(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, 0), units.length - 1);
    const value = bytes / 1024 ** (unitIndex + 1);

    return `${value.toFixed(unitIndex === 0 || unitIndex === 1 ? 0 : 1)} ${units[unitIndex]}`;
};

export const ACCEPTED_FILE_TYPES = ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";

const attachmentIconsByExtension: Record<string, string> = {
    jpg: imageDocumentIcon,
    jpeg: imageDocumentIcon,
    png: imageDocumentIcon,
    webp: imageDocumentIcon,
    pdf: pdfDocumentIcon,
    doc: docDocumentIcon,
    docx: docDocumentIcon,
    xls: xlsDocumentIcon,
    xlsx: xlsDocumentIcon,
    txt: txtDocumentIcon,
    csv: csvDocumentIcon,
};

export const getAttachmentIcon = (fileName: string, mimeType: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (extension && attachmentIconsByExtension[extension]) {
        return attachmentIconsByExtension[extension];
    }

    if (mimeType.startsWith("image/")) return imageDocumentIcon;
    if (mimeType === "application/pdf") return pdfDocumentIcon;
    if (mimeType.startsWith("text/")) return txtDocumentIcon;

    return docDocumentIcon;
};

export const formatMIME = (mimeType: string) => {
    const type = mimeType.toLowerCase();

    if (type.startsWith("image/")) return "Image";
    if (type === "text/plain") return "Text document";
    if (type === "text/csv") return "CSV document";
    if (
        type === "application/pdf" ||
        type.includes("msword") ||
        type.includes("wordprocessingml") ||
        type.includes("ms-excel") ||
        type.includes("spreadsheetml")
    ) {
        return "Document";
    }

    return "File";
};

export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const validateFiles = (files: File[]) => {
    if (files.length === 0) return "Select at least one file.";
    if (files.length > MAX_FILES) return `You can upload up to ${MAX_FILES} files at once.`;

    const oversizedFile = files.find(file => file.size > MAX_FILE_SIZE);

    return oversizedFile ? `"${oversizedFile.name}" is larger than ${formatFileSize(MAX_FILE_SIZE)}.` : null;
};
