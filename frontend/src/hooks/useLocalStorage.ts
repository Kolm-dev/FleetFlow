import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export const useLocalStorage = <T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const savedValue = window.localStorage.getItem(key);

            return savedValue === null ? initialValue : (JSON.parse(savedValue) as T);
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Интерфейс продолжит работать, даже если браузер запретил localStorage.
        }
    }, [key, value]);

    return [value, setValue];
};
