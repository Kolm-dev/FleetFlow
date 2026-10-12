export type PricingSettingTrips = {
    price_per_km: number;
    base_price: number;
    minimum_price: number;
    updated_at: string | null;
};

export type PricingSettingFuel = {
    diesel_price: number;
    gasoline_price: number;
    updated_at: string;
};
export type PricingSetting = {
    fuel: PricingSettingFuel;
    trips: PricingSettingTrips;
};

export type PricingSettingResponse = PricingSetting;

export type PricingSettingActionResponse = PricingSettingResponse & {
    message: string;
    
};

export type CalculatePriceResponse = {
    recommended_price: number;
};

export type UpdatePricingType = {
    price_per_km?: number;
    base_price?: number;
    minimum_price?: number;
    diesel_price?: number;
    gasoline_price?: number;
    
    
};
