import { renderHook } from '@testing-library/react';
import { useOnClickOutside } from './useOnClickOutside';

// Mock DOM methods
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(document, 'addEventListener', {
    value: mockAddEventListener,
});

Object.defineProperty(document, 'removeEventListener', {
    value: mockRemoveEventListener,
});

// Helper functions
const createMockElement = (): HTMLElement => {
    const element = document.createElement('div');
    element.contains = jest.fn();
    return element;
};

const createMockEvent = (target: HTMLElement): Event =>
    ({
        target,
    }) as unknown as Event;

const setupHook = (ignoreClickRefs: any[], onOutsideClick = jest.fn(), enableWhen = true) => {
    return renderHook(() =>
        useOnClickOutside({
            ignoreClickRefs,
            onOutsideClick,
            enableWhen,
        }),
    );
};

describe('useOnClickOutside', () => {
    beforeEach(() => {
        mockAddEventListener.mockClear();
        mockRemoveEventListener.mockClear();
    });

    it('adds event listeners when enabled', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        setupHook([ref], callback);

        expect(mockAddEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(mockAddEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
        expect(mockAddEventListener).toHaveBeenCalledTimes(3);
    });

    it('does not add event listeners when disabled', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        setupHook([ref], callback, false);

        expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('removes event listeners on unmount', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        const { unmount } = setupHook([ref], callback);

        unmount();

        expect(mockRemoveEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(mockRemoveEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
        expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
    });

    it('calls onOutsideClick when clicking outside', () => {
        const element = createMockElement();
        const outsideElement = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        (element.contains as jest.Mock).mockReturnValue(false);

        setupHook([ref], callback);

        const handler = mockAddEventListener.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not call onOutsideClick when clicking inside', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        (element.contains as jest.Mock).mockReturnValue(true);

        setupHook([ref], callback);

        const handler = mockAddEventListener.mock.calls[0][1];
        const event = createMockEvent(element);

        handler(event);

        expect(callback).not.toHaveBeenCalled();
    });

    it('handles multiple refs', () => {
        const element1 = createMockElement();
        const element2 = createMockElement();
        const outsideElement = createMockElement();
        const ref1 = { current: element1 };
        const ref2 = { current: element2 };
        const callback = jest.fn();

        (element1.contains as jest.Mock).mockReturnValue(false);
        (element2.contains as jest.Mock).mockReturnValue(true);

        setupHook([ref1, ref2], callback);

        const handler = mockAddEventListener.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).not.toHaveBeenCalled();
    });

    it('handles null refs', () => {
        const ref = { current: null };
        const callback = jest.fn();
        const outsideElement = createMockElement();

        setupHook([ref], callback);

        const handler = mockAddEventListener.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('handles empty refs array', () => {
        const callback = jest.fn();
        const outsideElement = createMockElement();

        setupHook([], callback);

        const handler = mockAddEventListener.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('updates event listeners when enableWhen changes', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        const { rerender } = renderHook(
            ({ enabled }) =>
                useOnClickOutside({
                    ignoreClickRefs: [ref],
                    onOutsideClick: callback,
                    enableWhen: enabled,
                }),
            { initialProps: { enabled: true } },
        );

        expect(mockAddEventListener).toHaveBeenCalledTimes(2);

        rerender({ enabled: false });

        expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
    });

    it('works with both mousedown and touchstart events', () => {
        const element = createMockElement();
        const outsideElement = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        (element.contains as jest.Mock).mockReturnValue(false);

        setupHook([ref], callback);

        // Test mousedown
        const mouseHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'mousedown')[1];
        const mouseEvent = createMockEvent(outsideElement);
        mouseHandler(mouseEvent);

        // Test touchstart
        const touchHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'touchstart')[1];
        const touchEvent = createMockEvent(outsideElement);
        touchHandler(touchEvent);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, mouseEvent);
        expect(callback).toHaveBeenNthCalledWith(2, touchEvent);
    });
});
