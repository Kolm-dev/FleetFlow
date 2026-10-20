import type { PricingSettingFuel, PricingSettingTrips, UpdatePricingType } from "@/types/pricingTypes";
import { useState } from "react";

type PricingSettingsFormProps = {
    pricingSettingsTrips?: PricingSettingTrips;
    pricingSettingsFuel?: PricingSettingFuel;

    handleSubmit: (data: UpdatePricingType) => void;
    onClose: () => void;
    highlightSave?: boolean;
};

export const PricingSettingsForm = ({
    pricingSettingsFuel: fuelSettings,
    pricingSettingsTrips: tripSettings,
    handleSubmit,
    onClose,
    highlightSave = false,
}: PricingSettingsFormProps) => {
    const [basePrice, setBasePrice] = useState(tripSettings?.base_price);
    const [pricePerKm, setPPK] = useState(tripSettings?.price_per_km);
    const [minimumPrice, setMinimumPrice] = useState(tripSettings?.minimum_price);
    const [priceDiesel, setPriceDiesel] = useState(fuelSettings?.diesel_price);
    const [priceGasoline, setPriceGasoline] = useState(fuelSettings?.gasoline_price);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit({
            price_per_km: pricePerKm,
            base_price: basePrice,
            minimum_price: minimumPrice,
            diesel_price: priceDiesel,
            gasoline_price: priceGasoline,
        });
    };
    return (
        <form
            onSubmit={onSubmit}
            className="pricing-settings-form"
        >
            <div className="pricing-settings-form__group">
                <h2>Trip pricing</h2>
                <label>
                    <span>Base price, USD</span>
                    <input
                        value={basePrice}
                        type="number"
                        min="0"
                        step="0.01"
                        name="base_price"
                        placeholder="Base price"
                        onChange={e => setBasePrice(Number(e.currentTarget.value))}
                    />
                </label>

                <label>
                    <span>Price per km, USD</span>
                    <input
                        value={pricePerKm}
                        name="price_per_km"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price per km"
                        onChange={e => setPPK(Number(e.currentTarget.value))}
                    />
                </label>

                <label>
                    <span>Minimum price, USD</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={minimumPrice}
                        name="minimum_price"
                        placeholder="Minimum price"
                        onChange={e => setMinimumPrice(Number(e.currentTarget.value))}
                    />
                </label>
            </div>

            <div className="pricing-settings-form__group">
                <h2>Fuel pricing</h2>
                <label>
                    <span>Gasoline price, USD/L</span>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={priceGasoline}
                        name="gasoline_price"
                        placeholder="Gasoline price"
                        onChange={e => setPriceGasoline(Number(e.currentTarget.value))}
                    />
                </label>

                <label>
                    <span>Diesel price, USD/L</span>
                    <input
                        value={priceDiesel}
                        type="number"
                        min="0.01"
                        step="0.01"
                        name="diesel_price"
                        placeholder="Diesel price"
                        onChange={e => setPriceDiesel(Number(e.currentTarget.value))}
                    />
                </label>
            </div>
            {highlightSave && (
                <p
                    role="status"
                    className="attention-hint col-span-full m-0 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 animate-in fade-in slide-in-from-top-1 duration-200 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                >
                    <span
                        className="attention-hint__dot"
                        aria-hidden="true"
                    />
                    <span>
                        <strong>One last step.</strong> These prices are still defaults. Adjust them if needed, then
                        press <mark>Save settings</mark> to confirm them for your company.
                    </span>
                </p>
            )}
            <div className="pricing-settings-form__actions">
                <button
                    className={`entity-action entity-action--update${highlightSave ? " attention-pulse" : ""}`}
                    type="submit"
                >
                    Save settings
                </button>
                <button
                    className="pricing-settings-form__cancel"
                    type="button"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};
