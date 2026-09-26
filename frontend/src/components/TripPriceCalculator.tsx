import { calculateTripPrice } from "@/api/pricing";
import { formatCurrency, toNullableNumber } from "@/libs/utils";
import { useState } from "react";

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
        <aside className="trip-price-tools">
            <h2>Price recommendation</h2>
            <p className="trip-price-tools__distance">
                Distance: <strong>{distance || "not specified"} km</strong>
            </p>
            <label>
                Price (USD)
                <input
                    type="number"
                    value={price}
                    onChange={(event) => handlePriceChange(event.currentTarget.value)}
                />
            </label>

            <button
                type="button"
                onClick={handleRecalculatePrice}
                disabled={priceCalculationStatus === "loading"}
            >
                {priceCalculationStatus === "loading"
                    ? "Recalculating..."
                    : "Recalculate"}
            </button>

            <div className="trip-price-tools__status">
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
                                <p className="trip-price-tools__manual">
                                    You changed the calculated price manually.
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleUseRecommendedPrice}
                                disabled={
                                    toNullableNumber(price) === recommendedPrice
                                }
                            >
                                Use recommended
                            </button>
                        </>
                    )}

                {priceCalculationStatus === "error" && (
                    <p className="error-message">
                        Cannot calculate price. Enter trip distance first.
                    </p>
                )}
            </div>
        </aside>
    );
};
