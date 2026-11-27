import { act, render, screen } from '@testing-library/react';
import { DEFAULT_DESIGN_WIDTH, getPreviewScale, ScaledPreview } from './ScaledPreview';

type ResizeCallback = () => void;

const setElementSize = (
    element: HTMLElement,
    size: { clientWidth?: number; clientHeight?: number; offsetHeight?: number },
) => {
    Object.entries(size).forEach(([key, value]) => {
        Object.defineProperty(element, key, { configurable: true, value });
    });
};

describe('getPreviewScale', () => {
    it('fits by width when the frame is wide', () => {
        expect(
            getPreviewScale({ availableWidth: 720, availableHeight: 1000, designWidth: 1440, designHeight: 500 }),
        ).toBe(0.5);
    });

    it('fits by height when the frame is tall', () => {
        expect(
            getPreviewScale({ availableWidth: 1440, availableHeight: 300, designWidth: 1440, designHeight: 1200 }),
        ).toBe(0.25);
    });

    it('never scales the frame up past its design size', () => {
        expect(
            getPreviewScale({ availableWidth: 3000, availableHeight: 3000, designWidth: 1440, designHeight: 500 }),
        ).toBe(1);
    });

    it('falls back to the width ratio when the heights are unknown', () => {
        expect(getPreviewScale({ availableWidth: 720, availableHeight: 0, designWidth: 1440, designHeight: 0 })).toBe(
            0.5,
        );
    });

    it('returns 1 when nothing has been measured yet', () => {
        expect(getPreviewScale({ availableWidth: 0, availableHeight: 0, designWidth: 1440, designHeight: 0 })).toBe(1);
    });
});

describe('ScaledPreview', () => {
    const originalResizeObserver = global.ResizeObserver;
    let resizeCallback: ResizeCallback | undefined;
    const observe = jest.fn();
    const disconnect = jest.fn();

    beforeEach(() => {
        resizeCallback = undefined;
        observe.mockClear();
        disconnect.mockClear();
        global.ResizeObserver = jest.fn((callback: ResizeCallback) => {
            resizeCallback = callback;
            return { observe, disconnect, unobserve: jest.fn() };
        }) as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
        global.ResizeObserver = originalResizeObserver;
    });

    it('renders children inside a frame of the default design width', () => {
        render(
            <ScaledPreview>
                <p>preview content</p>
            </ScaledPreview>,
        );

        expect(screen.getByText('preview content')).toBeInTheDocument();
        expect(screen.getByTestId('scaled-preview-frame')).toHaveStyle({ width: `${DEFAULT_DESIGN_WIDTH}px` });
    });

    it('observes the viewport and the frame, and disconnects on unmount', () => {
        const { unmount } = render(<ScaledPreview>content</ScaledPreview>);

        expect(observe).toHaveBeenCalledWith(screen.getByTestId('scaled-preview'));
        expect(observe).toHaveBeenCalledWith(screen.getByTestId('scaled-preview-frame'));

        unmount();
        expect(disconnect).toHaveBeenCalled();
    });

    it('scales the frame to fit the viewport and sizes the box to the scaled frame', () => {
        render(<ScaledPreview designWidth={1000}>content</ScaledPreview>);

        setElementSize(screen.getByTestId('scaled-preview'), { clientWidth: 500, clientHeight: 400 });
        setElementSize(screen.getByTestId('scaled-preview-frame'), { offsetHeight: 1000 });

        act(() => resizeCallback?.());

        // min(500 / 1000, 400 / 1000) = 0.4
        expect(screen.getByTestId('scaled-preview-frame')).toHaveStyle({ transform: 'scale(0.4)', width: '1000px' });
        expect(screen.getByTestId('scaled-preview-box')).toHaveStyle({ width: '400px', height: '400px' });
    });

    it('applies a custom className to the viewport', () => {
        render(<ScaledPreview className="custom">content</ScaledPreview>);
        expect(screen.getByTestId('scaled-preview')).toHaveClass('custom');
    });

    it('still renders when ResizeObserver is not available', () => {
        // @ts-expect-error - simulating an environment without ResizeObserver
        delete global.ResizeObserver;

        render(<ScaledPreview>content</ScaledPreview>);

        expect(screen.getByTestId('scaled-preview-frame')).toHaveStyle({ transform: 'scale(1)' });
    });
});
