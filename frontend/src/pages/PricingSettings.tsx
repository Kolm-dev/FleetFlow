import { getPricingSettings, updatePricingSettings } from "@/api/pricing";
import { PricingSettingsForm } from "@/components/PricingSettingsForm";
import { Spinner } from "@/components/Spinner/Spinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
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
            queryClient.invalidateQueries({
                queryKey: ["stats"],
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
                {onSuccess && (
                    <SuccessMessage
                        tag="pricing"
                        successText={updateResult?.message}
                        onComplete={() => setOnSuccess(false)}
                    />
                )}
                <button
                    className={`entity-action pricing-settings-edit-button entity-action--edit${
                        pricing?.configured === false && !showForm ? " attention-pulse" : ""
                    }`}
                    onClick={() => {
                        setShowForm(!showForm);
                        setOnSuccess(false);
                    }}
                    type="button"
                >
                    Edit pricing
                </button>
            </header>
            {pricing?.configured === false && (
                <p className="m-0 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    Default pricing values are used. Review and save trip and fuel prices for your company.
                </p>
            )}
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
                        <ErrorMessage messages={getBackendErrorMessages(error, "Could not update pricing settings.")} />
                    )}
                    <PricingSettingsForm
                        handleSubmit={data => {
                            setOnSuccess(false);
                            mutate(data);
                        }}
                        onClose={() => setShowForm(false)}
                        highlightSave={pricing?.configured === false}
                        pricingSettingsTrips={pricing?.trips}
                        pricingSettingsFuel={pricing?.fuel}
                    />
                </section>
            )}
        </div>
    );
};
