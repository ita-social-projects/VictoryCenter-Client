import { useState, useRef, useEffect, useMemo } from 'react';
import { VisibilityStatus } from '../../../types/Common';
import { PROGRAMS_TEXT } from '../../../const/admin/programs';
import { ProgramFormRef, ProgramFormValues } from '../../../pages/admin/programs/components/program-form/ProgramForm';
import { ProgramsApi } from '../../../services/api/admin/programs/programs-api';
import { Program, ProgramCreateUpdate } from '../../../types/ProgramAdminPage';

interface UseProgramModalProps {
    isOpen: boolean;
    program?: Program | null;
    onSuccess: (program: Program) => void;
    onClose: () => void;
}

export const useProgramModal = ({ isOpen, program, onSuccess, onClose }: UseProgramModalProps) => {
    const isEditMode = !!program;
    const formRef = useRef<ProgramFormRef>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showFormConfirmModal, setShowFormConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'publish' | 'draft' | null>(null);
    const [pendingFormData, setPendingFormData] = useState<ProgramFormValues | null>(null);

    const initialData = useMemo<ProgramFormValues | null>(() => {
        if (!isEditMode || !program) return null;

        return {
            name: program.name,
            description: program.description,
            categories: program.categories,
            img: program.img,
        };
    }, [program, isEditMode]);

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setShowFormConfirmModal(false);
        setShowCloseConfirmModal(false);
        setPendingAction(null);
        setPendingFormData(null);
    }, [isOpen]);

    const handleFormSubmit = (data: ProgramFormValues, status: VisibilityStatus) => {
        setPendingFormData(data);
        setPendingAction(status === 'Published' ? 'publish' : 'draft');
        setShowFormConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!pendingFormData || !pendingAction) return;

        setShowFormConfirmModal(false);
        setIsSubmitting(true);
        setError('');

        try {
            const status: VisibilityStatus = pendingAction === 'publish' ? 'Published' : 'Draft';
            const programData: ProgramCreateUpdate = {
                id: isEditMode && program ? program.id : null,
                name: pendingFormData.name,
                description: pendingFormData.description,
                categoryIds: pendingFormData.categories.map((cat) => cat.id),
                img: pendingFormData.img,
                status: status,
            };

            const resultProgram = isEditMode
                ? await ProgramsApi.editProgram(programData)
                : await ProgramsApi.addProgram(programData);

            onSuccess(resultProgram);
            onClose();
        } catch {
            const errorMessage = isEditMode
                ? PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM
                : PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM;
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetPendingState = () => {
        setPendingAction(null);
        setPendingFormData(null);
    };

    const handleCancelConfirmation = () => {
        setShowFormConfirmModal(false);
        resetPendingState();
        setIsSubmitting(false);
    };

    const handleClose = () => {
        if (formRef.current?.isDirty()) {
            setShowCloseConfirmModal(true);
        } else if (!isSubmitting) {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowCloseConfirmModal(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowCloseConfirmModal(false);
    };

    return {
        formRef,
        isSubmitting,
        error,
        initialData,
        pendingAction,
        modals: {
            formConfirm: {
                isOpen: showFormConfirmModal,
                onConfirm: handleConfirmAction,
                onCancel: handleCancelConfirmation,
            },
            closeConfirm: {
                isOpen: showCloseConfirmModal,
                onConfirm: handleConfirmClose,
                onCancel: handleCancelClose,
            },
        },
        handleFormSubmit,
        handleClose,
    };
};
