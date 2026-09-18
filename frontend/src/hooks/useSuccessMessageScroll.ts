import { useEffect, useRef } from "react";

export const useSuccessMessageScroll = (successMessage: string | null) => {
    const successMessageRef = useRef<HTMLParagraphElement | null>(null);
    const scrollReturnPositionRef = useRef(0);
    const scrollReturnTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!successMessage) return;

        if (scrollReturnTimeoutRef.current !== null) {
            window.clearTimeout(scrollReturnTimeoutRef.current);
        }

        window.requestAnimationFrame(() => {
            successMessageRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        });

        scrollReturnTimeoutRef.current = window.setTimeout(() => {
            window.scrollTo({
                top: scrollReturnPositionRef.current,
                behavior: "smooth",
            });
        }, 3500);

        return () => {
            if (scrollReturnTimeoutRef.current !== null) {
                window.clearTimeout(scrollReturnTimeoutRef.current);
            }
        };
    }, [successMessage]);

    return { successMessageRef, scrollReturnPositionRef };
};
