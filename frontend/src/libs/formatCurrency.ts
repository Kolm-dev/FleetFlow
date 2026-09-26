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
