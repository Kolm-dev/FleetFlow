import { getPricingSettings, updatePricingSettings } from "@/api/pricing";
import { PricingSettingsForm } from "@/components/PricingSettingsForm";
import { Spinner } from "@/components/Spinner/Spinner";
import { getBackendErrorMessages } from "@/libs/errors";
import { formatCurrency, formatDateTime } from "@/libs/utils";
import type { UpdatePricingType } from "@/types/pricingTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const PricingSettings = () => {
    const [showForm, setShowForm] = useState(false);
    const [onSuccess, setOnSuccess] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const {
        isLoading,
        isFetched,
        data: pricing,
    } = useQuery({
        queryKey: ["pricingSettings"],
        queryFn: () => getPricingSettings(),
    });
    const {
        mutate,
        error,
        data: updateResult,
    } = useMutation({
        mutationKey: ["pricingSettings"],
        mutationFn: (data: UpdatePricingType) => updatePricingSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["pricingSettings"],
            });
            setShowForm(false);
            setOnSuccess(true);
        },
    });

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className="pricing-settings-page">
            <header className="page-header entity-list-header">
                <div>
                    <h2>Pricing settings</h2>
                    <p>Current pricing values</p>
                </div>
                {onSuccess && <div className="success-message">{updateResult?.message}</div>}
                <button
                    className="entity-action pricing-settings-edit-button entity-action--edit"
                    onClick={() => setShowForm(!showForm)}
                    type="button"
                >
                    Edit pricing
                </button>
            </header>
            <section className="pricing-settings-summary trips">
                <dl>
                    <div>
                        <dt>Base price</dt>
                        <dd>{formatCurrency(pricing?.trips.base_price)}</dd>
                    </div>
                    <div>
                        <dt>Price per km</dt>
                        <dd>{formatCurrency(pricing?.trips.price_per_km)}</dd>
                    </div>
                    <div>
                        <dt>Minimum price</dt>
                        <dd>{formatCurrency(pricing?.trips.minimum_price)}</dd>
                    </div>
                    <div>
                        <dt>Updated at</dt>
                        <dd>
                            {formatDateTime(pricing?.trips.updated_at, {
                                fallback: "Not updated yet",
                            })}
                        </dd>
                    </div>
                </dl>
            </section>
            <section className="pricing-settings-summary">
                <dl>
                    <div>
                        <dt>Gasoline price</dt>
                        <dd>{formatCurrency(pricing?.fuel.gasoline_price)}</dd>
                    </div>
                    <div>
                        <dt>Diesel price</dt>
                        <dd>{formatCurrency(pricing?.fuel.diesel_price)}</dd>
                    </div>
                    <div>
                        <dt>Updated at</dt>
                        <dd>
                            {formatDateTime(pricing?.fuel.updated_at, {
                                fallback: "Not updated yet",
                            })}
                        </dd>
                    </div>
                </dl>
            </section>

            {isFetched && showForm && (
                <section className="pricing-settings-editor">
                    {error && (
                        <ul className="error-message">
                            {getBackendErrorMessages(error, "Could not update pricing settings.").map(message => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    )}
                    <PricingSettingsForm
                        handleSubmit={data => mutate(data)}
                        onClose={() => setShowForm(false)}
                        pricingSettingsTrips={pricing?.trips}
                        pricingSettingsFuel={pricing?.fuel}
                    />
                </section>
            )}
        </div>
    );
};
