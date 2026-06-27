import { renderHook, act } from '@testing-library/react';
import { useGenericModal, GenericFormRef, ButtonValidationState } from './useGenericModal';
import { VisibilityStatus, ModalMode } from '@/types/admin/common';

describe('useGenericModal', () => {
    const apiCall = jest.fn();
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    const getConfirmTitle = jest.fn(() => 'Confirm Title');
    const getErrorMessage = jest.fn(() => 'Error Message');
    const getFormKey = jest.fn(() => 'form-key');
    const transformFormData = jest.fn((data) => ({ ...data, transformed: true }));

    const defaultConfig = {
        mode: ModalMode.Add,
        isOpen: true,
        onClose,
        entity: { id: 1 },
        onSuccess,
        apiCall,
        getConfirmTitle,
        getErrorMessage,
        getFormKey,
        transformFormData,
    };

    const makeFormRef = (overrides: Partial<GenericFormRef> = {}): GenericFormRef => ({
        submit: jest.fn(),
        isDirty: jest.fn(() => false),
        isValid: jest.fn(() => true),
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('resets state on isOpen change', () => {
        const { rerender, result } = renderHook((props) => useGenericModal(props), {
            initialProps: { ...defaultConfig, isOpen: false },
        });
        rerender({ ...defaultConfig, isOpen: true });
        expect(result.current.error).toBe('');
        expect(result.current.showFormConfirmModal).toBe(false);
        expect(result.current.isFormValid).toBe(false);
    });

    it('does not reset state when modal is closed', () => {
        const { rerender, result } = renderHook((props) => useGenericModal(props), {
            initialProps: { ...defaultConfig, isOpen: true },
        });

        act(() => result.current.handleFormValidationChange(true));
        expect(result.current.isFormValid).toBe(true);

        rerender({ ...defaultConfig, isOpen: false });
        expect(result.current.isFormValid).toBe(true);
    });

    it('calls updateButtonStates when form validation changes', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));

        const mockIsValid = jest.fn((isPublishing) => !isPublishing);
        result.current.formRef.current = makeFormRef({ isValid: mockIsValid });

        act(() => result.current.handleFormValidationChange(true));

        expect(mockIsValid).toHaveBeenCalledWith(false);
        expect(mockIsValid).toHaveBeenCalledWith(true);
        expect(result.current.buttonStates.isDraftValid).toBe(true);
        expect(result.current.buttonStates.isPublishValid).toBe(false);
    });

    it('updateButtonStates respects different isValid results for draft vs publish', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));

        result.current.formRef.current = makeFormRef({
            isValid: jest.fn((isPublishing) => !isPublishing),
        });

        act(() => result.current.handleFormValidationChange(false));

        expect(result.current.buttonStates).toEqual<ButtonValidationState>({
            isDraftValid: true,
            isPublishValid: false,
        });
    });

    it('handles form validation change', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        act(() => result.current.handleFormValidationChange(true));
        expect(result.current.isFormValid).toBe(true);
    });

    it('handleFormSubmit does nothing if form is invalid', () => {
        const { result } = renderHook(() =>
            useGenericModal({
                ...defaultConfig,
            }),
        );
        result.current.formRef.current = makeFormRef({ isValid: () => false });
        act(() => {
            result.current.handleFormSubmit({ field: 'value' }, VisibilityStatus.Draft);
        });
        expect(result.current.showFormConfirmModal).toBe(false);
    });

    it('handleFormSubmit sets pending state if valid', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        result.current.formRef.current = makeFormRef({ isValid: () => true });
        act(() => {
            result.current.handleFormSubmit({ field: 'value' }, VisibilityStatus.Published);
        });
        expect(result.current.showFormConfirmModal).toBe(true);
    });

    it('handleCancelConfirmation hides the action confirmation and resets pending state', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        act(() => result.current.handleCancelConfirmation());
        expect(result.current.showFormConfirmModal).toBe(false);
        expect(result.current.isSubmitting).toBe(false);
    });

    it('handleCancelConfirmation does NOT close the parent modal (regression: "НІ" must keep edit modal open)', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        act(() => result.current.handleCancelConfirmation());
        expect(onClose).not.toHaveBeenCalled();
    });

    it('handleDismissConfirmation hides the action confirmation and resets pending state without closing the modal', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));

        result.current.formRef.current = makeFormRef({ isValid: () => true });
        act(() => {
            result.current.handleFormSubmit({ field: 'value' }, VisibilityStatus.Published);
        });
        expect(result.current.showFormConfirmModal).toBe(true);

        act(() => {
            result.current.handleDismissConfirmation();
        });

        expect(result.current.showFormConfirmModal).toBe(false);
        expect(result.current.isSubmitting).toBe(false);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('handleConfirmAction does nothing if no pending data', async () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        await act(async () => {
            await result.current.handleConfirmAction();
        });
        expect(apiCall).not.toHaveBeenCalled();
    });

    it('handleConfirmAction sets error and resets submitting on API failure', async () => {
        const localApiCall = jest.fn().mockRejectedValueOnce(new Error('boom'));
        const mockGetErrorMessage = jest.fn().mockReturnValue('boom'); // Mock to return 'boom'

        const { result } = renderHook(() =>
            useGenericModal({
                ...defaultConfig,
                apiCall: localApiCall,
                getErrorMessage: mockGetErrorMessage, // Use the mocked function
            }),
        );

        result.current.formRef.current = makeFormRef({ isValid: () => true, isDirty: () => false });

        act(() => {
            result.current.handleFormSubmit({ a: 1 } as any, VisibilityStatus.Published);
        });

        // Call handleConfirmAction and wait for state updates
        await act(async () => {
            await result.current.handleConfirmAction();
        });

        expect(localApiCall).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(mockGetErrorMessage).toHaveBeenCalledWith(ModalMode.Add); // or ModalMode.Edit depending on your defaultConfig.mode
        expect(result.current.error).toBe('boom');
        expect(result.current.isSubmitting).toBe(false);
    });

    it('handleConfirmAction success path', async () => {
        apiCall.mockResolvedValue({ id: 2 });
        const { result } = renderHook(() => useGenericModal(defaultConfig));

        // Mock formRef before calling handleFormSubmit
        result.current.formRef.current = {
            submit: jest.fn(),
            isValid: () => true,
            isDirty: () => false,
        };

        act(() => {
            result.current.handleFormSubmit({ a: 1 } as any, VisibilityStatus.Published);
        });

        await act(async () => {
            await result.current.handleConfirmAction();
        });

        expect(apiCall).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith({ id: 2 });
        expect(onClose).toHaveBeenCalled();
    });

    it('handleClose shows close confirm if dirty', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        result.current.formRef.current = makeFormRef({ isDirty: () => true });
        act(() => {
            result.current.handleClose();
        });
        expect(result.current.showCloseConfirmModal).toBe(true);
    });

    it('handleClose calls onClose if not dirty and not submitting', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        result.current.formRef.current = makeFormRef({ isDirty: () => false });
        act(() => {
            result.current.handleClose();
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('handleCancelClose hides modal', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        act(() => {
            result.current.handleCancelClose();
        });
        expect(result.current.showCloseConfirmModal).toBe(false);
    });

    it('handleConfirmClose hides modal and calls onClose', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        act(() => {
            result.current.handleConfirmClose();
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('handlePublishSubmit calls submit', () => {
        const submit = jest.fn();
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        result.current.formRef.current = makeFormRef({ submit });
        act(() => {
            result.current.handlePublishSubmit();
        });
        expect(submit).toHaveBeenCalledWith(VisibilityStatus.Published);
    });

    it('transforms form data before API call and passes status/entity to transformer', async () => {
        const localApiCall = jest.fn().mockResolvedValue({ id: 99 });
        const transformer = jest.fn((data, status, entity) => ({
            ...data,
            status,
            entityId: entity.id,
            transformed: true,
        }));
        const entity = { id: 123 };
        const { result } = renderHook(() =>
            useGenericModal({
                ...defaultConfig,
                entity,
                apiCall: localApiCall,
                transformFormData: transformer,
            }),
        );

        result.current.formRef.current = makeFormRef({ isValid: () => true });
        act(() => {
            result.current.handleFormSubmit({ foo: 'bar' } as any, VisibilityStatus.Draft);
        });
        await act(async () => {
            await result.current.handleConfirmAction();
        });

        expect(transformer).toHaveBeenCalledWith({ foo: 'bar' }, VisibilityStatus.Draft, entity);
        expect(localApiCall).toHaveBeenCalledWith({
            foo: 'bar',
            status: VisibilityStatus.Draft,
            entityId: 123,
            transformed: true,
        });
    });

    it('handleDraftSubmit calls submit', () => {
        const submit = jest.fn();
        const { result } = renderHook(() => useGenericModal(defaultConfig));
        result.current.formRef.current = makeFormRef({ submit });
        act(() => {
            result.current.handleDraftSubmit();
        });
        expect(submit).toHaveBeenCalledWith(VisibilityStatus.Draft);
    });

    it('buttonStates should reflect form validation state correctly', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));

        result.current.formRef.current = makeFormRef({
            isValid: jest.fn((isPublishing) => !isPublishing),
        });

        expect(result.current.buttonStates.isDraftValid).toBe(false);
        expect(result.current.buttonStates.isPublishValid).toBe(false);

        act(() => {
            result.current.handleFormValidationChange(true);
        });

        expect(result.current.buttonStates.isDraftValid).toBe(true);
        expect(result.current.buttonStates.isPublishValid).toBe(false);
    });

    it('buttonStates should work without form api', () => {
        const { result } = renderHook(() => useGenericModal(defaultConfig));

        result.current.formRef.current = null;

        act(() => {
            result.current.handleFormValidationChange(true);
        });

        expect(result.current.buttonStates.isDraftValid).toBe(true);
        expect(result.current.buttonStates.isPublishValid).toBe(true);
    });
});
