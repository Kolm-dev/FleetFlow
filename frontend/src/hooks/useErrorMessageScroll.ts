import { useEffect, useRef } from "react";

export const useErrorMessageScroll = (errorMessage: string | null) => {
    // Элемент с ошибкой
    const errorMessageRef = useRef<HTMLParagraphElement | null>(null);
    // Куда нужно вернуть пользователя.
    const scrollReturnPositionRef = useRef(0);
    const scrollReturnTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!errorMessage) return;

        if (scrollReturnTimeoutRef.current !== null) {
            window.clearTimeout(scrollReturnTimeoutRef.current);
        }

        // Ждём ближайший кадр, чтобы React успел отрисовать сообщение.
        window.requestAnimationFrame(() => {
            errorMessageRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        });

        //возращаем через 3.5с
        scrollReturnTimeoutRef.current = window.setTimeout(() => {
            window.scrollTo({
                top: scrollReturnPositionRef.current,
                behavior: "smooth",
            });
        }, 3500);

        return () => {
            //размонтируем
            if (scrollReturnTimeoutRef.current !== null) {
                window.clearTimeout(scrollReturnTimeoutRef.current);
            }
        };
    }, [errorMessage]);

    return { errorMessageRef, scrollReturnPositionRef };
};
