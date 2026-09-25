import { getPricingSettings, updatePricingSettings } from "@/api/pricing";
import { PricingSettingsForm } from "@/components/PricingSettingsForm";
import { Spinner } from "@/components/Spinner";
import type { UpdatePricingType } from "@/types/pricingTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const PricingSettings = () => {
    const [showForm, setShowForm] = useState(false);
    const queryClient = useQueryClient();
    const {
        isLoading,
        isFetched,
        data: pricing,
    } = useQuery({
        queryKey: ["pricingSettings"],
        queryFn: () => getPricingSettings(),
    });
    const { mutate } = useMutation({
        mutationKey: ["pricingSettings"],
        mutationFn: (data: UpdatePricingType) => updatePricingSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["pricingSettings"],
            });
            setShowForm(false);
        },
    });

    const formatDateTime = (val?: string | null) => {
        if (!val) return "Not updated yet";

        return new Date(val).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    if (isLoading) {
        return <Spinner />;
    }
    return (
        <div className="pricing-settings-page">
            <header className="page-header entity-list-header">
                <div>
                    <h2>Pricing settings</h2>
                    <p>Current trip tariff values</p>
                </div>
                <button
                    className="entity-action pricing-settings-edit-button entity-action--edit"
                    onClick={() => setShowForm(!showForm)}
                    type="button"
                >
                    Edit pricing
                </button>
            </header>

            <section className="pricing-settings-summary">
                <dl>
                    <div>
                        <dt>Base price</dt>
                        <dd>{pricing?.base_price}</dd>
                    </div>
                    <div>
                        <dt>Price per km</dt>
                        <dd>{pricing?.price_per_km}</dd>
                    </div>
                    <div>
                        <dt>Minimum price</dt>
                        <dd>{pricing?.minimum_price}</dd>
                    </div>
                    <div>
                        <dt>Updated at</dt>
                        <dd>{formatDateTime(pricing?.updated_at)}</dd>
                    </div>
                </dl>
            </section>

            {isFetched && showForm && (
                <section className="pricing-settings-editor">
                    <h2>Edit tariff</h2>
                    <PricingSettingsForm
                        handleSubmit={(data) => mutate(data)}
                        onClose={() => setShowForm(false)}
                        pricingSettings={pricing}
                    />
                </section>
            )}
        </div>
    );
};
