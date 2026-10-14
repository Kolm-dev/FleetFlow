import { cn } from "cn";
import { Building2, DollarSign, Paperclip, Route, Truck, UserRound, type LucideIcon } from "lucide-react";
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
const EXIT_ANIMATION_DURATION = 300;

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
    const [isExiting, setIsExiting] = useState(false);
    const onCompleteRef = useRef(onComplete);
    const messages = (Array.isArray(successText) ? successText : [successText])
        .filter((message): message is string => typeof message === "string")
        .map(message => message.trim())
        .filter(Boolean);
    const displayMessages = messages.length > 0 ? messages : [fallbackMessage.trim() || DEFAULT_FALLBACK_MESSAGE];
    const messageKey = displayMessages.join("\u0000");
    const TagIcon = tag ? tagIcons[tag] : null;

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (time === "inf") return;

        let exitTimeoutId: number | undefined;
        const timeoutId = window.setTimeout(
            () => {
                setIsExiting(true);
                exitTimeoutId = window.setTimeout(() => {
                    setIsVisible(false);
                    onCompleteRef.current?.();
                }, EXIT_ANIMATION_DURATION);
            },
            Math.max(0, time)
        );

        return () => {
            window.clearTimeout(timeoutId);
            if (exitTimeoutId !== undefined) window.clearTimeout(exitTimeoutId);
        };
    }, [messageKey, time]);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "flex min-w-0 items-start gap-3 rounded-lg border border-emerald-600/25 bg-emerald-600/10 p-3 text-sm text-emerald-800 animate-in fade-in slide-in-from-top-1 duration-200 dark:text-emerald-300 sm:p-4",
                isExiting && "animate-out fade-out slide-out-to-top-1 duration-300",
                className
            )}
            id={id}
            ref={ref}
            role="status"
            aria-live="polite"
        >
            {TagIcon && (
                <TagIcon
                    className="mt-0.5 size-4 shrink-0 sm:size-4.5"
                    aria-hidden="true"
                />
            )}
            {displayMessages.length === 1 ? (
                <p className="m-0 min-w-0 flex-1 wrap-break-word font-medium ">{displayMessages[0]}</p>
            ) : (
                <ul className="m-0 min-w-0 flex-1 list-inside list-disc space-y-1 wrap-break-word pl-0 font-medium ">
                    {displayMessages.map((message, index) => (
                        <li key={`${message}-${index}`}>{message}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
