import { useState, useEffect } from 'react';

export default function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Maak een timer die de waarde pas na de 'delay' periode bijwerkt
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Ruim de timer op als de waarde verandert (de gebruiker typt weer)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Voer dit effect alleen opnieuw uit als de waarde of delay verandert

    return debouncedValue;
}