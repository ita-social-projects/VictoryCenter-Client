import { useState, useLayoutEffect, RefObject } from 'react';

export type MeasurementAxis = 'height' | 'width';
export type CalculationStrategy = 'basedOnFirstElement' | 'sumOfElements';

export interface useCalculateContainerSizeBasedOnChildrenProps {
    elementsContainerRef: RefObject<HTMLElement | null>;
    targetVisibleElementsCount: number;
    measurementAxis: MeasurementAxis;
    calculationStrategy: CalculationStrategy;
    dependencies: unknown[];
    disableAfterFirstSuccess?: boolean;
    disableWhen?: boolean;
}

export interface useCalculateContainerSizeBasedOnChildrenResult {
    calculatedSize: number | undefined;
}

export const useCalculateContainerSizeBasedOnChildren = ({
    elementsContainerRef,
    targetVisibleElementsCount,
    measurementAxis,
    calculationStrategy,
    disableWhen = false,
    dependencies = [],
    disableAfterFirstSuccess = false,
}: useCalculateContainerSizeBasedOnChildrenProps): useCalculateContainerSizeBasedOnChildrenResult => {
    const [calculatedSize, setCalculatedSize] = useState<number | undefined>(undefined);
    const [hasCalculated, setHasCalculated] = useState(false);

    useLayoutEffect(() => {
        if (disableAfterFirstSuccess && hasCalculated) {
            return;
        }

        const containerEl = elementsContainerRef.current;

        if (disableWhen || !containerEl || containerEl.children.length === 0) {
            if (disableWhen) {
                setHasCalculated(false);
            }
            setCalculatedSize(undefined);
            return;
        }

        const dimension: 'offsetHeight' | 'offsetWidth' = measurementAxis === 'height' ? 'offsetHeight' : 'offsetWidth';
        let finalSize: number | undefined;

        if (calculationStrategy === 'basedOnFirstElement') {
            const firstElement = containerEl.children[0] as HTMLElement;
            const firstElementSize = firstElement?.[dimension] ?? 0;
            finalSize = firstElementSize * targetVisibleElementsCount;
        } else if (calculationStrategy === 'sumOfElements') {
            const childElements = Array.from(containerEl.children) as HTMLElement[];
            const wholeElementsCount = Math.floor(targetVisibleElementsCount);

            if (childElements.length < wholeElementsCount) {
                setCalculatedSize(undefined);
                return;
            }

            const fractionalPart = targetVisibleElementsCount % 1;
            const elementsToMeasure = childElements.slice(0, wholeElementsCount + (fractionalPart > 0 ? 1 : 0));

            finalSize = elementsToMeasure.reduce((accumulator, element, index) => {
                if (index < wholeElementsCount) {
                    return accumulator + element[dimension];
                }
                return accumulator + element[dimension] * fractionalPart;
            }, 0);
        }

        setCalculatedSize(finalSize);

        if (finalSize !== undefined && disableAfterFirstSuccess) {
            setHasCalculated(true);
        }
    }, [
        disableWhen,
        targetVisibleElementsCount,
        measurementAxis,
        calculationStrategy,
        disableAfterFirstSuccess,
        hasCalculated,
        elementsContainerRef,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ...dependencies,
    ]);

    return { calculatedSize };
};
