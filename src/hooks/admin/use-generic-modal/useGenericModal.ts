import { useCallback, useEffect, useRef, useState } from 'react';
import { ModalMode, PendingAction, VisibilityStatus } from '../../../types/admin/common';

export interface GenericFormRef {
    submit: (status: VisibilityStatus) => void;
    isDirty: () => boolean;
    isValid: (isPublishing?: boolean) => boolean;
}

export interface GenericFormValues {
    [key: string]: any;
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
}: UseGenericModalConfig<TFormValues, TEntity>) => {
    const formRef = useRef<TFormRef>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showFormConfirmModal, setShowFormConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [pendingFormData, setPendingFormData] = useState<TFormValues | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [validationTick, setValidationTick] = useState(0);

    const isEditMode = mode === ModalMode.Edit;

    const handleFormValidationChange = useCallback((isValid: boolean) => {
        setIsFormValid(isValid);
        setValidationTick((x) => x + 1);
    }, []);

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
        resetPendingState();
        setIsSubmitting(false);
    }, [resetPendingState]);

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

        handleFormValidationChange,
        handleFormSubmit,
        handleCancelConfirmation,
        handleConfirmAction,
        handleClose,
        handleConfirmClose,
        handleCancelClose,
        handleDraftSubmit,
        handlePublishSubmit,
    };
};
