import type { PricingSetting, UpdatePricingType } from "@/types/pricingTypes";
import { useState } from "react";

type PricingSettingsFormProps = {
    pricingSettings?: PricingSetting;
    handleSubmit: (data: UpdatePricingType) => void;
    onClose: () => void;
};

export const PricingSettingsForm = ({
    pricingSettings,
    handleSubmit,
    onClose,
}: PricingSettingsFormProps) => {
    const [basePrice, setBasePrice] = useState(pricingSettings?.base_price);
    const [pricePerKm, setPPK] = useState(pricingSettings?.price_per_km);
    const [minimumPrice, setMinimumPrice] = useState(
        pricingSettings?.minimum_price,
    );

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit({
            price_per_km: pricePerKm,
            base_price: basePrice,
            minimum_price: minimumPrice,
        });
    };
    return (
        <form onSubmit={onSubmit} className="pricing-settings-form">
            <label>
                Base price
                <input
                    type="number"
                    value={basePrice}
                    name="base_price"
                    placeholder="Base price"
                    onChange={(e) =>
                        setBasePrice(Number(e.currentTarget.value))
                    }
                />
            </label>

            <label>
                Price per km
                <input
                    type="number"
                    value={pricePerKm}
                    name="price_per_km"
                    placeholder="Price per km"
                    onChange={(e) => setPPK(Number(e.currentTarget.value))}
                />
            </label>

            <label>
                Minimum price
                <input
                    type="number"
                    value={minimumPrice}
                    name="minimum_price"
                    placeholder="Minimum price"
                    onChange={(e) =>
                        setMinimumPrice(Number(e.currentTarget.value))
                    }
                />
            </label>

            <div className="pricing-settings-form__actions">
                <button type="submit">Save settings</button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </form>
    );
};
