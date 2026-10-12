import { apiClient } from "@/api/client";
import type {
    CalculatePriceResponse,
    PricingSettingActionResponse,
    PricingSettingResponse,
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

export async function getPricingSettings(): Promise<PricingSettingResponse> {
    const response = await apiClient<PricingSettingResponse>(
        "/pricing-settings",
    );

    return response;
}

export async function updatePricingSettings(
    data: UpdatePricingType,
): Promise<PricingSettingActionResponse> {
    return apiClient("/pricing-settings", {
        method: "PATCH",
        data,
    });
}
