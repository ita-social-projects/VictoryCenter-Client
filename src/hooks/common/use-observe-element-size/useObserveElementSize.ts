import { useState, useLayoutEffect, RefObject, useRef, useEffect, useCallback } from 'react';

export interface Size {
    width: number;
    height: number;
}

export interface useObserveElementSizeProps {
    observableElement: RefObject<HTMLElement | null>;
    onSizeChanged?: (size: Size) => void;
    disableWhen?: boolean;
}

export const useObserveElementSize = ({
    observableElement,
    onSizeChanged,
    disableWhen = false,
}: useObserveElementSizeProps): Size => {
    const [size, setSize] = useState<Size>({
        width: 0,
        height: 0,
    });

    // Store callback in ref to avoid recreating ResizeObserver when inline callbacks change
    // but still call the latest callback version
    const savedOnSizeChangedRef = useRef(onSizeChanged);
    useEffect(() => {
        savedOnSizeChangedRef.current = onSizeChanged;
    }, [onSizeChanged]);

    useLayoutEffect(() => {
        const element = observableElement.current;

        if (disableWhen || !element) {
            setSize((currentSize) => {
                if (currentSize.width !== 0 || currentSize.height !== 0) {
                    return { width: 0, height: 0 };
                }
                return currentSize;
            });
            return;
        }

        const updateSize = () => {
            const newSize: Size = {
                width: element.offsetWidth,
                height: element.offsetHeight,
            };

            setSize((currentSize) => {
                if (currentSize.width !== newSize.width || currentSize.height !== newSize.height) {
                    savedOnSizeChangedRef.current?.(newSize);
                    return newSize;
                }
                return currentSize;
            });
        };

        const observer = new ResizeObserver(updateSize);
        observer.observe(element);
        updateSize();

        return () => {
            observer.disconnect();
        };
    }, [observableElement, disableWhen]);

    return size;
};
