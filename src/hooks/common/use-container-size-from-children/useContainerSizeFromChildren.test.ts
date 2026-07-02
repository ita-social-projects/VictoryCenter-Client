import { renderHook } from '@testing-library/react';
import { useContainerSizeFromChildren, UseContainerSizeFromChildrenProps } from './useContainerSizeFromChildren';

const createMockElement = (size: number, axis: 'height' | 'width') => {
    const element = document.createElement('div');

    element.getBoundingClientRect = () => ({
        width: axis === 'width' ? size : 0,
        height: axis === 'height' ? size : 0,
        top: 0,
        left: 0,
        bottom: axis === 'height' ? size : 0,
        right: axis === 'width' ? size : 0,
        x: 0,
        y: 0,
        toJSON: () => { },
    } as DOMRect);

    Object.defineProperty(element, axis === 'height' ? 'offsetHeight' : 'offsetWidth', {
        configurable: true,
        get: () => size,
    });

    return element;
};

const createContainerWithChildren = (sizes: number[], axis: 'height' | 'width') => {
    const container = document.createElement('div');
    sizes.forEach((size) => {
        const child = createMockElement(size, axis);
        container.appendChild(child);
    });
    return container;
};

const getHookProps = (
    overrides: Partial<UseContainerSizeFromChildrenProps> = {},
): UseContainerSizeFromChildrenProps => ({
    elementsContainerRef: { current: null },
    targetVisibleElementsCount: 2,
    calculationDimension: 'height' as const,
    calculationStrategy: 'basedOnFirstElement' as const,
    dependencies: [],
    ...overrides,
});

describe('useCalculateContainerSizeBasedOnChildren', () => {
    it('returns undefined when container ref is null', () => {
        const { result } = renderHook(() => useContainerSizeFromChildren(getHookProps()));

        expect(result.current.calculatedSize).toBeUndefined();
    });

    it('returns undefined when container has no children', () => {
        const container = document.createElement('div');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(getHookProps({ elementsContainerRef: { current: container } })),
        );

        expect(result.current.calculatedSize).toBeUndefined();
    });

    it('returns undefined when hook is disabled', () => {
        const container = createContainerWithChildren([100, 200], 'height');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(
                getHookProps({
                    elementsContainerRef: { current: container },
                    isDisabled: true,
                }),
            ),
        );

        expect(result.current.calculatedSize).toBeUndefined();
    });

    it('calculates size based on first element strategy with height', () => {
        const container = createContainerWithChildren([100, 200, 300], 'height');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(
                getHookProps({
                    elementsContainerRef: { current: container },
                    targetVisibleElementsCount: 2.5,
                }),
            ),
        );

        expect(result.current.calculatedSize).toBe(250); // 100 * 2.5
    });

    it('calculates size based on first element strategy with width', () => {
        const container = createContainerWithChildren([50, 100], 'width');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(
                getHookProps({
                    elementsContainerRef: { current: container },
                    calculationDimension: 'width',
                    targetVisibleElementsCount: 3,
                }),
            ),
        );

        expect(result.current.calculatedSize).toBe(150); // 50 * 3
    });

    it('calculates size based on sum of elements strategy', () => {
        const container = createContainerWithChildren([100, 200, 300], 'height');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(
                getHookProps({
                    elementsContainerRef: { current: container },
                    calculationStrategy: 'sumOfElements',
                    targetVisibleElementsCount: 2,
                }),
            ),
        );

        expect(result.current.calculatedSize).toBe(300); // 100 + 200
    });

    it('calculates size with fractional elements in sum strategy', () => {
        const container = createContainerWithChildren([100, 200, 300], 'height');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(
                getHookProps({
                    elementsContainerRef: { current: container },
                    calculationStrategy: 'sumOfElements',
                    targetVisibleElementsCount: 2.5,
                }),
            ),
        );

        expect(result.current.calculatedSize).toBe(450); // 100 + 200 + (300 * 0.5)
    });

    it('returns undefined when not enough children for sum strategy', () => {
        const container = createContainerWithChildren([100], 'height');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(
                getHookProps({
                    elementsContainerRef: { current: container },
                    calculationStrategy: 'sumOfElements',
                    targetVisibleElementsCount: 2,
                }),
            ),
        );

        expect(result.current.calculatedSize).toBeUndefined();
    });

    it('recalculates when dependencies change', () => {
        const container = createContainerWithChildren([100], 'height');
        let dependency = 'initial';

        const { result, rerender } = renderHook(
            (deps) =>
                useContainerSizeFromChildren(
                    getHookProps({
                        elementsContainerRef: { current: container },
                        dependencies: deps,
                    }),
                ),
            { initialProps: [dependency] },
        );

        expect(result.current.calculatedSize).toBe(200); // 100 * 2

        // Change dependency
        dependency = 'changed';
        rerender([dependency]);

        expect(result.current.calculatedSize).toBe(200);
    });

    it('disables calculation after first success when flag is set', () => {
        const container = createContainerWithChildren([100], 'height');

        const { result, rerender } = renderHook((props) => useContainerSizeFromChildren(props), {
            initialProps: getHookProps({
                elementsContainerRef: { current: container },
                targetVisibleElementsCount: 2,
                isDisabledAfterFirstSuccess: true,
            }),
        });

        expect(result.current.calculatedSize).toBe(200);

        // Change target count - should not recalculate because isDisabledAfterFirstSuccess is true
        rerender(
            getHookProps({
                elementsContainerRef: { current: container },
                targetVisibleElementsCount: 3,
                isDisabledAfterFirstSuccess: true,
            }),
        );

        expect(result.current.calculatedSize).toBe(200); // Still old value
    });

    it('handles edge case with zero-sized elements', () => {
        const container = createContainerWithChildren([0, 100], 'height');
        const { result } = renderHook(() =>
            useContainerSizeFromChildren(
                getHookProps({
                    elementsContainerRef: { current: container },
                }),
            ),
        );

        expect(result.current.calculatedSize).toBe(0); // 0 * 2
    });
});
