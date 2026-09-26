const numberFormatter = new Intl.NumberFormat("en-US");

const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const formatCurrency = (
    value: number | string | null | undefined,
    fallback = "-",
) => {
    if (value === null || value === undefined || value === "") return fallback;

    const numericValue = Number(value);

    return Number.isFinite(numericValue)
        ? usdFormatter.format(numericValue)
        : fallback;
};

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatMileage = (value: number) => `${formatNumber(value)} km`;

export const formatNullableValue = (
    value: number | string | null | undefined,
    fallback = "-",
) => value ?? fallback;

export const formatNumberWithSuffix = (
    value: number | null,
    suffix = "",
    fallback = "Not specified",
) => (value === null ? fallback : `${formatNumber(value)}${suffix}`);

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

export const formatDateTime = (
    value?: string | null,
    options: FormatDateTimeOptions = {},
) => {
    const {
        fallback = "-",
        hour12,
        locale = "en-US",
        timeZone,
    } = options;

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
