import { calculateTripPrice, getPricingSettings } from "@/api/pricing";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { formControlClass, formFieldClass } from "@/components/shared/EntityForm";
import { Button } from "@/components/ui/button";
import { formatCurrency, toNullableNumber } from "@/libs/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";

type TripPriceCalculatorProps = {
    distance: string;
    price: string;
    onPriceChange: (price: string) => void;
};

type PriceCalculationStatus = "idle" | "loading" | "success" | "error";

export const TripPriceCalculator = ({
    distance,
    price,
    onPriceChange,
}: TripPriceCalculatorProps) => {
    const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null);
    const [priceCalculationStatus, setPriceCalculationStatus] =
        useState<PriceCalculationStatus>("idle");
    const [isManualPrice, setIsManualPrice] = useState(false);
    const { data: pricing } = useQuery({
        queryKey: ["pricingSettings"],
        queryFn: () => getPricingSettings(),
    });

    const handlePriceChange = (value: string) => {
        onPriceChange(value);

        if (recommendedPrice === null) return;
        setIsManualPrice(toNullableNumber(value) !== recommendedPrice);
    };

    const handleRecalculatePrice = async () => {
        const distanceValue = toNullableNumber(distance);

        if (distanceValue === null || distanceValue <= 0) {
            setRecommendedPrice(null);
            setPriceCalculationStatus("error");
            return;
        }

        setPriceCalculationStatus("loading");
        setIsManualPrice(false);

        try {
            const response = await calculateTripPrice(distanceValue);
            const nextRecommendedPrice = response.recommended_price;

            setRecommendedPrice(nextRecommendedPrice);
            setPriceCalculationStatus("success");
            setIsManualPrice(toNullableNumber(price) !== nextRecommendedPrice);
        } catch {
            setRecommendedPrice(null);
            setPriceCalculationStatus("error");
        }
    };

    const handleUseRecommendedPrice = () => {
        if (recommendedPrice === null) return;

        onPriceChange(recommendedPrice.toString());
        setIsManualPrice(false);
    };

    return (
        <aside className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <h2 className="m-0 text-base font-semibold text-foreground">Price recommendation</h2>
            {pricing?.configured === false && (
                <p className="m-0 text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Pricing uses default values. <Link to="/pricing-settings">Review pricing</Link>
                </p>
            )}
            <p className="m-0 text-sm text-muted-foreground">
                Distance: <strong>{distance || "not specified"} km</strong>
            </p>
            <label className={formFieldClass}>
                Price (USD)
                <input
                    className={formControlClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => handlePriceChange(event.currentTarget.value)}
                />
            </label>

            <Button
                type="button"
                variant="outline"
                onClick={handleRecalculatePrice}
                disabled={priceCalculationStatus === "loading"}
            >
                {priceCalculationStatus === "loading"
                    ? "Recalculating..."
                    : "Recalculate"}
            </Button>

            <div className="text-sm text-muted-foreground [&_p]:m-0">
                {priceCalculationStatus === "idle" && (
                    <p>
                        Recommended price has not been calculated yet. You can
                        keep your own price.
                    </p>
                )}

                {priceCalculationStatus === "loading" && (
                    <p>Calculating recommended price...</p>
                )}

                {priceCalculationStatus === "success" &&
                    recommendedPrice !== null && (
                        <>
                            <p>
                                Recommended price:{" "}
                                <strong>{formatCurrency(recommendedPrice)}</strong>
                            </p>
                            <p>
                                Price to save:{" "}
                                <strong>
                                    {formatCurrency(price, "not specified")}
                                </strong>
                            </p>
                            {isManualPrice && (
                                <p className="font-semibold text-amber-700 dark:text-amber-300">
                                    You changed the calculated price manually.
                                </p>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleUseRecommendedPrice}
                                disabled={
                                    toNullableNumber(price) === recommendedPrice
                                }
                            >
                                Use recommended
                            </Button>
                        </>
                    )}

                {priceCalculationStatus === "error" && (
                    <ErrorMessage messages="Cannot calculate price. Enter trip distance first." />
                )}
            </div>
        </aside>
    );
};
