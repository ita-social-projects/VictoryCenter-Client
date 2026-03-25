import { useCallback, useEffect, useRef, useState } from 'react';
import { ModalMode, PendingAction, VisibilityStatus } from '@/types/admin/common';

export interface GenericFormRef {
    submit: (status: VisibilityStatus) => Promise<void>;
    isDirty: () => boolean;
    isValid: (isPublishing?: boolean) => boolean;
}

export interface GenericFormValues {
    [key: string]: any;
}

export interface ButtonValidationState {
    isDraftValid: boolean;
    isPublishValid: boolean;
}

export interface UseGenericModalConfig<TFormValues extends GenericFormValues, TEntity> {
    mode: ModalMode;
    isOpen: boolean;
    onClose: () => void;
    entity?: TEntity;
    onSuccess: (entity: TEntity) => void;
    apiCall: (data: any) => Promise<TEntity>;
    getConfirmTitle: (mode: ModalMode, entity: TEntity | undefined, pendingAction: PendingAction | null) => string;
    getErrorMessage: (mode: ModalMode) => string;
    getFormKey: (mode: ModalMode, entity?: TEntity) => string | number;
    transformFormData: (formData: TFormValues, status: VisibilityStatus, entity?: TEntity) => any;
    closeOnDraftCancel?: boolean;
}

export interface UseGenericModalReturn<TFormValues, TFormRef> {
    formRef: React.RefObject<TFormRef | null>;
    isSubmitting: boolean;
    error: string;
    showFormConfirmModal: boolean;
    showCloseConfirmModal: boolean;
    isFormValid: boolean;
    isEditMode: boolean;
    formKey: string | number;
    formConfirmTitle: string;
    buttonStates: ButtonValidationState;
    handleFormValidationChange: (isValid: boolean) => void;
    handleFormSubmit: (data: TFormValues, status: VisibilityStatus) => void;
    handleCancelConfirmation: () => void;
    handleDismissConfirmation: () => void;
    handleConfirmAction: () => Promise<void>;
    handleClose: () => void;
    handleConfirmClose: () => void;
    handleCancelClose: () => void;
    handleDraftSubmit: () => void;
    handlePublishSubmit: () => void;
}

export const useGenericModal = <
    TFormValues extends GenericFormValues,
    TEntity,
    TFormRef extends GenericFormRef = GenericFormRef,
>({
    mode,
    isOpen,
    onClose,
    entity,
    onSuccess,
    apiCall,
    getConfirmTitle,
    getErrorMessage,
    getFormKey,
    transformFormData,
}: UseGenericModalConfig<TFormValues, TEntity>): UseGenericModalReturn<TFormValues, TFormRef> => {
    const formRef = useRef<TFormRef>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showFormConfirmModal, setShowFormConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [pendingFormData, setPendingFormData] = useState<TFormValues | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [buttonStates, setButtonStates] = useState<ButtonValidationState>({
        isDraftValid: false,
        isPublishValid: false,
    });

    const isEditMode = mode === ModalMode.Edit;

    const updateButtonStates = useCallback(
        (currentIsValid: boolean) => {
            const api = formRef.current;
            const isDirtyForSubmit = mode === ModalMode.Edit ? (api?.isDirty?.() ?? false) : true;

            setButtonStates({
                isDraftValid: isDirtyForSubmit && (api?.isValid?.(false) ?? currentIsValid),
                isPublishValid: isDirtyForSubmit && (api?.isValid?.(true) ?? currentIsValid),
            });
        },
        [mode],
    );

    const handleFormValidationChange = useCallback(
        (isValid: boolean) => {
            setIsFormValid(isValid);
            updateButtonStates(isValid);
        },
        [updateButtonStates],
    );

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setShowFormConfirmModal(false);
        setShowCloseConfirmModal(false);
        setPendingAction(null);
        setPendingFormData(null);
        setIsFormValid(false);
    }, [isOpen]);

    const resetPendingState = useCallback(() => {
        setPendingAction(null);
        setPendingFormData(null);
    }, []);

    const handleCancelConfirmation = useCallback(() => {
        setShowFormConfirmModal(false);
        onClose();
        resetPendingState();
        setIsSubmitting(false);
    }, [onClose, resetPendingState]);

    const handleConfirmAction = useCallback(async () => {
        if (!pendingFormData || pendingAction === null) return;

        setShowFormConfirmModal(false);
        setIsSubmitting(true);
        setError('');

        try {
            const status: VisibilityStatus =
                pendingAction === PendingAction.Publish ? VisibilityStatus.Published : VisibilityStatus.Draft;

            const transformedData = transformFormData(pendingFormData, status, entity);
            const result = await apiCall(transformedData);

            onSuccess(result);
            onClose();
        } catch {
            setError(getErrorMessage(mode));
            resetPendingState();
        } finally {
            setIsSubmitting(false);
        }
    }, [
        pendingFormData,
        pendingAction,
        transformFormData,
        entity,
        apiCall,
        onSuccess,
        onClose,
        getErrorMessage,
        mode,
        resetPendingState,
    ]);

    const handleFormSubmit = useCallback((data: TFormValues, status: VisibilityStatus) => {
        const isPublishing = status === VisibilityStatus.Published;
        const currentIsValid = formRef.current?.isValid(isPublishing) || false;

        if (!currentIsValid) {
            return;
        }

        setPendingFormData(data);
        setPendingAction(status === VisibilityStatus.Published ? PendingAction.Publish : PendingAction.Draft);
        setShowFormConfirmModal(true);
    }, []);

    const handleClose = useCallback(() => {
        if (formRef.current?.isDirty()) {
            if (pendingAction === PendingAction.Draft) {
                onClose();
            } else {
                setShowCloseConfirmModal(true);
            }
        } else if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose, pendingAction]);

    const handleDismissConfirmation = useCallback(() => {
        setShowFormConfirmModal(false);
        resetPendingState();
        setIsSubmitting(false);
    }, [resetPendingState]);

    const handleCancelClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);

    const handlePublishSubmit = useCallback(() => {
        formRef.current?.submit(VisibilityStatus.Published);
    }, []);

    const handleDraftSubmit = useCallback(() => {
        formRef.current?.submit(VisibilityStatus.Draft);
    }, []);

    const formConfirmTitle = getConfirmTitle(mode, entity, pendingAction);
    const formKey = getFormKey(mode, entity);

    return {
        formRef,
        isSubmitting,
        error,
        showFormConfirmModal,
        showCloseConfirmModal,
        isFormValid,
        isEditMode,
        formKey,
        formConfirmTitle,
        buttonStates,

        handleFormValidationChange,
        handleFormSubmit,
        handleCancelConfirmation,
        handleDismissConfirmation,
        handleConfirmAction,
        handleClose,
        handleConfirmClose,
        handleCancelClose,
        handleDraftSubmit,
        handlePublishSubmit,
    };
};
