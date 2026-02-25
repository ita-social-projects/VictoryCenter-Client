import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

type MatchMediaMock = {
    matches: boolean;
    media: string;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
    dispatch: (matches: boolean) => void;
};

function createMatchMediaMock(initialMatches: boolean): MatchMediaMock {
    let listener: ((event: MediaQueryListEvent) => void) | null = null;

    return {
        matches: initialMatches,
        media: '',
        addEventListener: jest.fn((_, cb) => {
            listener = cb;
        }),
        removeEventListener: jest.fn(),
        dispatch(newValue: boolean) {
            this.matches = newValue;
            listener?.({ matches: newValue } as MediaQueryListEvent);
        },
    };
}

describe('useMediaQuery', () => {
    let matchMediaMock: MatchMediaMock;

    beforeEach(() => {
        matchMediaMock = createMatchMediaMock(false);

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(() => matchMediaMock),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns initial match value immediately', () => {
        matchMediaMock.matches = true;

        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

        expect(result.current).toBe(true);
    });

    it('updates value when media query changes via event', () => {
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

        expect(result.current).toBe(false);

        act(() => {
            matchMediaMock.dispatch(true);
        });

        expect(result.current).toBe(true);
    });

    it('adds event listener on mount', () => {
        renderHook(() => useMediaQuery('(min-width: 768px)'));

        expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('removes event listener on unmount', () => {
        const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

        unmount();

        expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('re-subscribes when query changes', () => {
        const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
            initialProps: { query: '(min-width: 768px)' },
        });

        rerender({ query: '(min-width: 1024px)' });

        expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
    });
});
