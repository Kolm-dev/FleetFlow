import { CreateEntityButton } from "@/components/shared/CreateEntityButton";
import { CircleAlert } from "lucide-react";

type NoAvailableDriversProps = {
    context: "vehicle" | "trip";
};

const messages = {
    vehicle: "No available drivers. Add a driver before creating a vehicle.",
    trip: "No available drivers. Add a driver and assign a vehicle before creating a trip.",
} satisfies Record<NoAvailableDriversProps["context"], string>;

export const NoAvailableDrivers = ({ context }: NoAvailableDriversProps) => (
    <div className="grid justify-items-start gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive sm:p-4">
        <div className="flex min-w-0 items-start gap-3 text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0 sm:size-4.5" aria-hidden="true" />
            <p className="m-0 min-w-0 flex-1 font-medium leading-6 wrap-anywhere">
                {messages[context]}
            </p>
        </div>
        <CreateEntityButton entity="driver" to="/drivers/create" />
    </div>
);
