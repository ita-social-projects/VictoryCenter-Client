import { renderHook } from '@testing-library/react';
import { useOnClickOutside } from './useOnClickOutside';

const createMockElement = (): HTMLElement => {
    const element = document.createElement('div');
    element.contains = jest.fn();
    return element;
};

const createMockEvent = (target: HTMLElement): Event =>
    ({
        target,
    }) as unknown as Event;

const setupHook = (ignoreClickRefs: any[], onOutsideClick = jest.fn(), isDisabled = false) => {
    return renderHook(() =>
        useOnClickOutside({
            ignoreClickRefs,
            onOutsideClick,
            isDisabled,
        }),
    );
};

describe('useOnClickOutside', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let removeEventListenerSpy: jest.SpyInstance;

    beforeAll(() => {
        addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    });

    afterAll(() => {
        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });

    beforeEach(() => {
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
    });

    it('adds event listeners when enabled', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        setupHook([ref], callback, false);

        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('does not add event listeners when disabled', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        setupHook([ref], callback, true);

        expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('removes event listeners on unmount', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        const { unmount } = setupHook([ref], callback, false);

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it('calls onOutsideClick when clicking outside', () => {
        const element = createMockElement();
        const outsideElement = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        (element.contains as jest.Mock).mockReturnValue(false);

        setupHook([ref], callback, false);

        const handler = addEventListenerSpy.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('does not call onOutsideClick when clicking inside', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        (element.contains as jest.Mock).mockReturnValue(true);

        setupHook([ref], callback, false);

        const handler = addEventListenerSpy.mock.calls[0][1];
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

        setupHook([ref1, ref2], callback, false);

        const handler = addEventListenerSpy.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).not.toHaveBeenCalled();
    });

    it('handles null refs', () => {
        const ref = { current: null };
        const callback = jest.fn();
        const outsideElement = createMockElement();

        setupHook([ref], callback, false);

        const handler = addEventListenerSpy.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('handles empty refs array', () => {
        const callback = jest.fn();
        const outsideElement = createMockElement();

        setupHook([], callback, false);

        const handler = addEventListenerSpy.mock.calls[0][1];
        const event = createMockEvent(outsideElement);

        handler(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('updates event listeners when isDisabled changes', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        const { rerender } = renderHook(
            ({ disabled }) =>
                useOnClickOutside({
                    ignoreClickRefs: [ref],
                    onOutsideClick: callback,
                    isDisabled: disabled,
                }),
            { initialProps: { disabled: false } },
        );

        // Due to strict mode, this might be called more than expected initially
        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

        rerender({ disabled: true });

        expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it('works with both mousedown and touchstart events', () => {
        const element = createMockElement();
        const outsideElement = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        (element.contains as jest.Mock).mockReturnValue(false);

        setupHook([ref], callback, false);

        const mouseHandler = addEventListenerSpy.mock.calls.find((call) => call[0] === 'mousedown')[1];
        const mouseEvent = createMockEvent(outsideElement);
        mouseHandler(mouseEvent);

        const touchHandler = addEventListenerSpy.mock.calls.find((call) => call[0] === 'touchstart')[1];
        const touchEvent = createMockEvent(outsideElement);
        touchHandler(touchEvent);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, mouseEvent);
        expect(callback).toHaveBeenNthCalledWith(2, touchEvent);
    });

    it('uses default value for isDisabled when not provided', () => {
        const element = createMockElement();
        const ref = { current: element };
        const callback = jest.fn();

        renderHook(() =>
            useOnClickOutside({
                ignoreClickRefs: [ref],
                onOutsideClick: callback,
            }),
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });
});
