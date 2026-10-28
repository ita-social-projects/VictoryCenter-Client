import { renderHook, act } from '@testing-library/react';
import { useGenericModal, GenericFormRef, ButtonValidationState, UseGenericModalConfig } from './useGenericModal';
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

    type TestConfig = UseGenericModalConfig<any, any>;

    const makeFormRef = (overrides: Partial<GenericFormRef> = {}): GenericFormRef => ({
        submit: jest.fn(),
        isDirty: jest.fn(() => false),
        isValid: jest.fn(() => true),
        ...overrides,
    });

    const renderModal = (overrides: Partial<TestConfig> = {}) =>
        renderHook(() => useGenericModal({ ...defaultConfig, ...overrides } as TestConfig));

    type ModalResult = ReturnType<typeof renderModal>['result'];

    const setFormRef = (result: ModalResult, overrides: Partial<GenericFormRef> = {}) => {
        result.current.formRef.current = makeFormRef(overrides);
    };

    const submitAs = (result: ModalResult, status: VisibilityStatus, data: Record<string, unknown> = { a: 1 }) => {
        setFormRef(result);
        act(() => {
            result.current.handleFormSubmit(data, status);
        });
    };

    const confirmAction = async (result: ModalResult) => {
        await act(async () => {
            await result.current.handleConfirmAction();
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('state reset', () => {
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
    });

    describe('validation and button states', () => {
        it('calls updateButtonStates when form validation changes', () => {
            const { result } = renderModal();
            const mockIsValid = jest.fn((isPublishing) => !isPublishing);
            setFormRef(result, { isValid: mockIsValid });

            act(() => result.current.handleFormValidationChange(true));

            expect(mockIsValid).toHaveBeenCalledWith(false);
            expect(mockIsValid).toHaveBeenCalledWith(true);
            expect(result.current.buttonStates.isDraftValid).toBe(true);
            expect(result.current.buttonStates.isPublishValid).toBe(false);
        });

        it('updateButtonStates respects different isValid results for draft vs publish', () => {
            const { result } = renderModal();
            setFormRef(result, { isValid: jest.fn((isPublishing) => !isPublishing) });

            act(() => result.current.handleFormValidationChange(false));

            expect(result.current.buttonStates).toEqual<ButtonValidationState>({
                isDraftValid: true,
                isPublishValid: false,
            });
        });

        it('handles form validation change', () => {
            const { result } = renderModal();

            act(() => result.current.handleFormValidationChange(true));

            expect(result.current.isFormValid).toBe(true);
        });

        it('buttonStates should reflect form validation state correctly', () => {
            const { result } = renderModal();
            setFormRef(result, { isValid: jest.fn((isPublishing) => !isPublishing) });

            expect(result.current.buttonStates.isDraftValid).toBe(false);
            expect(result.current.buttonStates.isPublishValid).toBe(false);

            act(() => result.current.handleFormValidationChange(true));

            expect(result.current.buttonStates.isDraftValid).toBe(true);
            expect(result.current.buttonStates.isPublishValid).toBe(false);
        });

        it('buttonStates should work without form api', () => {
            const { result } = renderModal();
            result.current.formRef.current = null;

            act(() => result.current.handleFormValidationChange(true));

            expect(result.current.buttonStates.isDraftValid).toBe(true);
            expect(result.current.buttonStates.isPublishValid).toBe(true);
        });
    });

    describe('handleFormSubmit', () => {
        it('does nothing if form is invalid', () => {
            const { result } = renderModal();
            setFormRef(result, { isValid: () => false });

            act(() => {
                result.current.handleFormSubmit({ field: 'value' }, VisibilityStatus.Draft);
            });

            expect(result.current.showFormConfirmModal).toBe(false);
        });

        it('sets pending state if valid', () => {
            const { result } = renderModal();

            submitAs(result, VisibilityStatus.Published);

            expect(result.current.showFormConfirmModal).toBe(true);
        });
    });

    describe('handleCancelConfirmation', () => {
        it('hides the action confirmation, resets pending state and does NOT close the parent modal', () => {
            const { result } = renderModal();
            submitAs(result, VisibilityStatus.Published);

            act(() => result.current.handleCancelConfirmation());

            expect(result.current.showFormConfirmModal).toBe(false);
            expect(result.current.isSubmitting).toBe(false);
            expect(onClose).not.toHaveBeenCalled();
        });

        describe('with closeOnDraftCancel', () => {
            it('closes the modal without calling the API when the pending action is Draft', () => {
                const { result } = renderModal({ closeOnDraftCancel: true });
                submitAs(result, VisibilityStatus.Draft);
                expect(result.current.showFormConfirmModal).toBe(true);

                act(() => result.current.handleCancelConfirmation());

                expect(result.current.showFormConfirmModal).toBe(false);
                expect(result.current.isSubmitting).toBe(false);
                expect(onClose).toHaveBeenCalledTimes(1);
                expect(apiCall).not.toHaveBeenCalled();
                expect(onSuccess).not.toHaveBeenCalled();
            });

            it('keeps the modal open when the pending action is Publish', () => {
                const { result } = renderModal({ closeOnDraftCancel: true });
                submitAs(result, VisibilityStatus.Published);

                act(() => result.current.handleCancelConfirmation());

                expect(result.current.showFormConfirmModal).toBe(false);
                expect(onClose).not.toHaveBeenCalled();
            });

            it.each([
                ['not set', undefined],
                ['false', false],
            ])('keeps the modal open for Draft when closeOnDraftCancel is %s', (_name, flag) => {
                const { result } = renderModal({ closeOnDraftCancel: flag });
                submitAs(result, VisibilityStatus.Draft);

                act(() => result.current.handleCancelConfirmation());

                expect(result.current.showFormConfirmModal).toBe(false);
                expect(onClose).not.toHaveBeenCalled();
            });

            it('resets pending state so a later confirm does not call the API', async () => {
                const { result } = renderModal({ closeOnDraftCancel: true });
                submitAs(result, VisibilityStatus.Draft);

                act(() => result.current.handleCancelConfirmation());
                await confirmAction(result);

                expect(apiCall).not.toHaveBeenCalled();
            });
        });
    });

    describe('handleDismissConfirmation', () => {
        it.each([
            ['without closeOnDraftCancel', false, VisibilityStatus.Published],
            ['with closeOnDraftCancel and Draft (Esc / overlay / X)', true, VisibilityStatus.Draft],
        ])('hides the confirmation, resets pending state and never closes the modal %s', (_name, flag, status) => {
            const { result } = renderModal({ closeOnDraftCancel: flag });
            submitAs(result, status);
            expect(result.current.showFormConfirmModal).toBe(true);

            act(() => result.current.handleDismissConfirmation());

            expect(result.current.showFormConfirmModal).toBe(false);
            expect(result.current.isSubmitting).toBe(false);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('resets pending state so a later confirm does not call the API', async () => {
            const { result } = renderModal({ closeOnDraftCancel: true });
            submitAs(result, VisibilityStatus.Draft);

            act(() => result.current.handleDismissConfirmation());
            await confirmAction(result);

            expect(apiCall).not.toHaveBeenCalled();
        });
    });

    describe('handleConfirmAction', () => {
        it('does nothing if no pending data', async () => {
            const { result } = renderModal();

            await confirmAction(result);

            expect(apiCall).not.toHaveBeenCalled();
        });

        it('sets error and resets submitting on API failure', async () => {
            const localApiCall = jest.fn().mockRejectedValueOnce(new Error('boom'));
            const mockGetErrorMessage = jest.fn().mockReturnValue('boom');
            const { result } = renderModal({ apiCall: localApiCall, getErrorMessage: mockGetErrorMessage });

            submitAs(result, VisibilityStatus.Published);
            await confirmAction(result);

            expect(localApiCall).toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
            expect(mockGetErrorMessage).toHaveBeenCalledWith(ModalMode.Add);
            expect(result.current.error).toBe('boom');
            expect(result.current.isSubmitting).toBe(false);
        });

        it('success path calls onSuccess and onClose', async () => {
            apiCall.mockResolvedValue({ id: 2 });
            const { result } = renderModal();

            submitAs(result, VisibilityStatus.Published);
            await confirmAction(result);

            expect(apiCall).toHaveBeenCalled();
            expect(onSuccess).toHaveBeenCalledWith({ id: 2 });
            expect(onClose).toHaveBeenCalled();
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
            const { result } = renderModal({ entity, apiCall: localApiCall, transformFormData: transformer });

            submitAs(result, VisibilityStatus.Draft, { foo: 'bar' });
            await confirmAction(result);

            expect(transformer).toHaveBeenCalledWith({ foo: 'bar' }, VisibilityStatus.Draft, entity);
            expect(localApiCall).toHaveBeenCalledWith({
                foo: 'bar',
                status: VisibilityStatus.Draft,
                entityId: 123,
                transformed: true,
            });
        });
    });

    describe('closing the modal', () => {
        it('handleClose shows close confirm if dirty', () => {
            const { result } = renderModal();
            setFormRef(result, { isDirty: () => true });

            act(() => result.current.handleClose());

            expect(result.current.showCloseConfirmModal).toBe(true);
        });

        it('handleClose calls onClose if not dirty and not submitting', () => {
            const { result } = renderModal();
            setFormRef(result, { isDirty: () => false });

            act(() => result.current.handleClose());

            expect(onClose).toHaveBeenCalled();
        });

        it('handleCancelClose hides modal', () => {
            const { result } = renderModal();

            act(() => result.current.handleCancelClose());

            expect(result.current.showCloseConfirmModal).toBe(false);
        });

        it('handleConfirmClose hides modal and calls onClose', () => {
            const { result } = renderModal();

            act(() => result.current.handleConfirmClose());

            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('submit triggers', () => {
        it.each([
            ['handlePublishSubmit', 'handlePublishSubmit', VisibilityStatus.Published],
            ['handleDraftSubmit', 'handleDraftSubmit', VisibilityStatus.Draft],
        ] as const)('%s calls submit with the matching status', (_name, handler, status) => {
            const submit = jest.fn();
            const { result } = renderModal();
            setFormRef(result, { submit });

            act(() => result.current[handler]());

            expect(submit).toHaveBeenCalledWith(status);
        });
    });
});
