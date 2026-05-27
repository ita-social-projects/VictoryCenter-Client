import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useScrollAnimation } from './useScrollAnimation';

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
let ioCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;

const TestComponent = ({ threshold }: { threshold?: number }) => {
    const { ref, isVisible } = useScrollAnimation(threshold);
    return <div ref={ref as React.RefObject<HTMLDivElement>} data-testid="target" data-visible={String(isVisible)} />;
};

describe('useScrollAnimation', () => {
    const originalIO = (global as any).IntersectionObserver;

    beforeEach(() => {
        mockObserve.mockReset();
        mockDisconnect.mockReset();
        (global as any).IntersectionObserver = jest.fn((cb: typeof ioCallback) => {
            ioCallback = cb;
            return { observe: mockObserve, disconnect: mockDisconnect };
        });
    });

    afterEach(() => {
        (global as any).IntersectionObserver = originalIO;
    });

    it('should start as not visible', () => {
        render(<TestComponent />);

        expect(screen.getByTestId('target')).toHaveAttribute('data-visible', 'false');
    });

    it('should become visible when IntersectionObserver fires with isIntersecting true', () => {
        render(<TestComponent />);

        act(() => {
            ioCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
        });

        expect(screen.getByTestId('target')).toHaveAttribute('data-visible', 'true');
    });

    it('should not become visible when isIntersecting is false', () => {
        render(<TestComponent />);

        act(() => {
            ioCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
        });

        expect(screen.getByTestId('target')).toHaveAttribute('data-visible', 'false');
    });

    it('should disconnect observer after becoming visible', () => {
        render(<TestComponent />);

        act(() => {
            ioCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
        });

        expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should disconnect observer on unmount', () => {
        const { unmount } = render(<TestComponent />);

        unmount();

        expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should observe the rendered element', () => {
        render(<TestComponent />);

        expect(mockObserve).toHaveBeenCalledWith(screen.getByTestId('target'));
    });
});
