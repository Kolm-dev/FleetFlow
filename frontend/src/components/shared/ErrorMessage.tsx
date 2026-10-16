import { cn } from "cn";
import { CircleAlert } from "lucide-react";
import type { Ref } from "react";

type ErrorMessageProps = {
    messages?: string | string[] | null;
    fallbackMessage?: string;
    className?: string;
    id?: string;
    ref?: Ref<HTMLDivElement>;
};

export const ErrorMessage = ({ messages, fallbackMessage, className, id, ref }: ErrorMessageProps) => {
    const normalizedMessages = (Array.isArray(messages) ? messages : [messages])
        .filter((message): message is string => typeof message === "string")
        .map((message) => message.trim())
        .filter(Boolean);
    const displayMessages = normalizedMessages.length > 0
        ? normalizedMessages
        : fallbackMessage?.trim()
          ? [fallbackMessage.trim()]
          : [];

    if (displayMessages.length === 0) return null;

    return (
        <div
            className={cn(
                "flex min-w-0 items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive sm:p-4",
                className,
            )}
            id={id}
            ref={ref}
            role="alert"
        >
            <CircleAlert className="mt-0.5 size-4 shrink-0 sm:size-[18px]" aria-hidden="true" />
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
