import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const updateMatches = (event?: MediaQueryListEvent) => {
            setMatches(event?.matches ?? media.matches);
        };

        updateMatches();
        media.addEventListener('change', updateMatches);
        return () => media.removeEventListener('change', updateMatches);
    }, [query]);

    return matches;
}
