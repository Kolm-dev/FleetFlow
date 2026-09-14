export type PricingSetting = {
    price_per_km: number;
    base_price: number;
    minimum_price: number;
    updated_at: string | null;
};

export type CalculatePriceResponse = {
    recommended_price: number;
};

export type UpdatePricingType = {
    price_per_km?: number;
    base_price?: number;
    minimum_price?: number;
};
