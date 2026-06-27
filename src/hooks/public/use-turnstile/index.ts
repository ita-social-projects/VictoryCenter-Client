import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    theme?: 'light' | 'dark' | 'auto';
                    callback: (token: string) => void;
                    'expired-callback': () => void;
                    'error-callback': () => void;
                },
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const SCRIPT_ID = 'cf-turnstile-script';

interface UseTurnstileReturn {
    token: string | null;
    containerRef: React.RefObject<HTMLDivElement | null>;
    reset: () => void;
}

export const useTurnstile = (siteKey: string): UseTurnstileReturn => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const reset = useCallback(() => {
        if (window.turnstile && widgetIdRef.current) {
            window.turnstile.reset(widgetIdRef.current);
        }
        setToken(null);
    }, []);

    const renderWidget = useCallback(() => {
        if (!window.turnstile || !containerRef.current) return;

        if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: 'light',
            callback: (t: string) => setToken(t),
            'expired-callback': () => setToken(null),
            'error-callback': () => setToken(null),
        });
    }, [siteKey]);

    useEffect(() => {
        const existing = document.getElementById(SCRIPT_ID);

        if (!existing) {
            const script = document.createElement('script');
            script.id = SCRIPT_ID;
            script.src = SCRIPT_URL;
            script.async = true;
            script.defer = true;
            script.onload = renderWidget;
            document.head.appendChild(script);
        } else if (window.turnstile) {
            renderWidget();
        } else {
            existing.addEventListener('load', renderWidget);
        }

        return () => {
            if (window.turnstile && widgetIdRef.current) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [renderWidget]);

    return { token, containerRef, reset };
};
