import type { PricingSetting } from "./../types/pricingTypes";
import { apiClient } from "@/api/client";
import type {
    CalculatePriceResponse,
    UpdatePricingType,
} from "@/types/pricingTypes";

export async function calculateTripPrice(
    distance: number,
): Promise<CalculatePriceResponse> {
    return apiClient("/trips/calculate-price", {
        method: "POST",
        data: {
            distance,
        },
    });
}

export async function getPricingSettings(): Promise<PricingSetting> {
    return apiClient("/pricing-settings");
}

export async function updatePricingSettings(
    data: UpdatePricingType,
): Promise<PricingSetting> {
    return apiClient("/pricing-settings", {
        method: "PATCH",
        data,
    });
}
