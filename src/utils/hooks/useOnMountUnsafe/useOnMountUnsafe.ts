import { EffectCallback, useEffect, useRef } from 'react';

// useOnMountUnsafe is a hook that runs an effect only once(even in strict mode).
export function useOnMountUnsafe(effect: EffectCallback) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            effect();
        }
    });
}
