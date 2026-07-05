import { useState, useLayoutEffect, RefObject } from 'react';

export type Dimension = 'height' | 'width';
export type Strategy = 'basedOnFirstElement' | 'sumOfElements';

export interface UseContainerSizeFromChildrenProps {
    elementsContainerRef: RefObject<HTMLElement | null>;
    targetVisibleElementsCount: number;
    calculationDimension: Dimension;
    calculationStrategy: Strategy;
    dependencies: unknown[];
    isDisabledAfterFirstSuccess?: boolean;
    isDisabled?: boolean;
}

export interface UseContainerSizeFromChildrenResult {
    calculatedSize: number | undefined;
}

export const useContainerSizeFromChildren = ({
    elementsContainerRef,
    targetVisibleElementsCount,
    calculationDimension,
    calculationStrategy,
    dependencies = [],
    isDisabled = false,
    isDisabledAfterFirstSuccess = false,
}: UseContainerSizeFromChildrenProps): UseContainerSizeFromChildrenResult => {
    const [calculatedSize, setCalculatedSize] = useState<number | undefined>(undefined);
    const [hasCalculated, setHasCalculated] = useState(false);

    useLayoutEffect(() => {
        if (isDisabledAfterFirstSuccess && hasCalculated) {
            return;
        }

        const containerEl = elementsContainerRef.current;

        if (isDisabled || !containerEl || containerEl.children.length === 0) {
            if (isDisabled) {
                setHasCalculated(false);
            }
            setCalculatedSize(undefined);
            return;
        }

        const getExactSize = (el: HTMLElement, dim: Dimension): number => {
            const rect = el.getBoundingClientRect();
            return dim === 'height' ? rect.height : rect.width;
        };
        let finalSize: number | undefined;

        if (calculationStrategy === 'basedOnFirstElement') {
            const firstElement = containerEl.children[0] as HTMLElement;
            const firstElementSize = firstElement ? getExactSize(firstElement, calculationDimension) : 0;
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
                const exactSize = getExactSize(element, calculationDimension);
                if (index < wholeElementsCount) {
                    return accumulator + exactSize;
                }
                return accumulator + exactSize * fractionalPart;
            }, 0);
        }

        if (finalSize !== undefined) {
            setCalculatedSize(Math.ceil(finalSize));
        } else {
            setCalculatedSize(undefined);
        }

        if (finalSize !== undefined && isDisabledAfterFirstSuccess) {
            setHasCalculated(true);
        }
    }, [
        isDisabled,
        targetVisibleElementsCount,
        calculationDimension,
        calculationStrategy,
        isDisabledAfterFirstSuccess,
        hasCalculated,
        elementsContainerRef,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ...dependencies,
    ]);

    return { calculatedSize };
};
