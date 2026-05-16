import { act, renderHook } from '@testing-library/react';
import { useDirtyModalCloseConfirmation } from './useDirtyModalCloseConfirmation';

describe('useDirtyModalCloseConfirmation', () => {
    it('should close immediately when modal is clean', () => {
        const onClose = jest.fn();
        const { result } = renderHook(() =>
            useDirtyModalCloseConfirmation({
                isDirty: false,
                onClose,
            }),
        );

        act(() => {
            result.current.handleRequestClose();
        });

        expect(result.current.isCloseConfirmOpen).toBe(false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should request confirmation when modal is dirty', () => {
        const onClose = jest.fn();
        const { result } = renderHook(() =>
            useDirtyModalCloseConfirmation({
                isDirty: true,
                onClose,
            }),
        );

        act(() => {
            result.current.handleRequestClose();
        });

        expect(result.current.isCloseConfirmOpen).toBe(true);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should close dirty modal only after confirmation', () => {
        const onClose = jest.fn();
        const { result } = renderHook(() =>
            useDirtyModalCloseConfirmation({
                isDirty: true,
                onClose,
            }),
        );

        act(() => {
            result.current.handleRequestClose();
            result.current.handleConfirmClose();
        });

        expect(result.current.isCloseConfirmOpen).toBe(false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should keep dirty modal open when confirmation is canceled', () => {
        const onClose = jest.fn();
        const { result } = renderHook(() =>
            useDirtyModalCloseConfirmation({
                isDirty: true,
                onClose,
            }),
        );

        act(() => {
            result.current.handleRequestClose();
            result.current.handleCancelClose();
        });

        expect(result.current.isCloseConfirmOpen).toBe(false);
        expect(onClose).not.toHaveBeenCalled();
    });
});
