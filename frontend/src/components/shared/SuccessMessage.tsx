import { cn } from "cn";
import {
    Building2,
    DollarSign,
    Paperclip,
    Route,
    Truck,
    UserRound,
    type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type Ref } from "react";

export type SuccessTag = "pricing" | "vehicle" | "driver" | "client" | "trip" | "attachment";
export type SuccessMessageTime = number | "inf";

type SuccessMessageProps = {
    tag?: SuccessTag | null;
    successText?: string | string[] | null;
    fallbackMessage?: string;
    time?: SuccessMessageTime;
    onComplete?: () => void;
    className?: string;
    id?: string;
    ref?: Ref<HTMLDivElement>;
};

const DEFAULT_TIME = 5000;
const DEFAULT_FALLBACK_MESSAGE = "Successfully";

const tagIcons: Record<SuccessTag, LucideIcon> = {
    pricing: DollarSign,
    vehicle: Truck,
    driver: UserRound,
    client: Building2,
    trip: Route,
    attachment: Paperclip,
};

export const SuccessMessage = ({
    tag = null,
    successText,
    fallbackMessage = DEFAULT_FALLBACK_MESSAGE,
    time = DEFAULT_TIME,
    onComplete,
    className,
    id,
    ref,
}: SuccessMessageProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const onCompleteRef = useRef(onComplete);
    const messages = (Array.isArray(successText) ? successText : [successText])
        .filter((message): message is string => typeof message === "string")
        .map(message => message.trim())
        .filter(Boolean);
    const displayMessages = messages.length > 0
        ? messages
        : [fallbackMessage.trim() || DEFAULT_FALLBACK_MESSAGE];
    const messageKey = displayMessages.join("\u0000");
    const TagIcon = tag ? tagIcons[tag] : null;

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (time === "inf") return;

        const timeoutId = window.setTimeout(() => {
            setIsVisible(false);
            onCompleteRef.current?.();
        }, Math.max(0, time));

        return () => window.clearTimeout(timeoutId);
    }, [messageKey, time]);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "flex min-w-0 items-start gap-3 rounded-lg border border-emerald-600/25 bg-emerald-600/10 p-3 text-sm text-emerald-800 dark:text-emerald-300 sm:p-4",
                className,
            )}
            id={id}
            ref={ref}
            role="status"
            aria-live="polite"
        >
            {TagIcon && (
                <TagIcon className="mt-0.5 size-4 shrink-0 sm:size-[18px]" aria-hidden="true" />
            )}
            {displayMessages.length === 1 ? (
                <p className="m-0 min-w-0 flex-1 break-words font-medium [overflow-wrap:anywhere]">
                    {displayMessages[0]}
                </p>
            ) : (
                <ul className="m-0 min-w-0 flex-1 list-inside list-disc space-y-1 break-words pl-0 font-medium [overflow-wrap:anywhere]">
                    {displayMessages.map((message, index) => (
                        <li key={`${message}-${index}`}>{message}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
