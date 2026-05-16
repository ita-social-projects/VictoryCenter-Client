import { useCallback, useRef, useState } from 'react';
import { SectionCancelActionType } from '@/types/admin/programs';

export interface SectionCancelRequest {
    type: SectionCancelActionType;
    onDiscard: () => void;
}

export interface UseSectionCancelConfirmationResult {
    isSectionRemoveModalOpen: boolean;
    isSectionRevertModalOpen: boolean;
    pendingCancelActionType: SectionCancelActionType | null;
    handleRequestCancelSection: (request: SectionCancelRequest) => void;
    handleCloseSectionRemoveModal: () => void;
    handleCloseSectionRevertModal: () => void;
    handleConfirmRemoveSection: () => void;
    handleConfirmRevertSection: () => void;
}

export const useSectionCancelConfirmation = (): UseSectionCancelConfirmationResult => {
    const [isSectionRemoveModalOpen, setIsSectionRemoveModalOpen] = useState(false);
    const [isSectionRevertModalOpen, setIsSectionRevertModalOpen] = useState(false);
    const [pendingCancelActionType, setPendingCancelActionType] = useState<SectionCancelActionType | null>(null);
    const sectionDiscardActionRef = useRef<(() => void) | null>(null);

    const handleRequestCancelSection = useCallback((request: SectionCancelRequest) => {
        sectionDiscardActionRef.current = request.onDiscard;
        setPendingCancelActionType(request.type);

        switch (request.type) {
            case SectionCancelActionType.RemoveSection:
                setIsSectionRemoveModalOpen(true);
                break;
            case SectionCancelActionType.RevertSection:
            case SectionCancelActionType.RevertAfterReplace:
            case SectionCancelActionType.DiscardNewSection:
                setIsSectionRevertModalOpen(true);
                break;
            default:
                break;
        }
    }, []);

    const resetCancelActionState = useCallback(() => {
        setPendingCancelActionType(null);
        sectionDiscardActionRef.current = null;
    }, []);

    const handleCloseSectionRemoveModal = useCallback(() => {
        setIsSectionRemoveModalOpen(false);
        resetCancelActionState();
    }, [resetCancelActionState]);

    const handleCloseSectionRevertModal = useCallback(() => {
        setIsSectionRevertModalOpen(false);
        resetCancelActionState();
    }, [resetCancelActionState]);

    const handleConfirmRemoveSection = useCallback(() => {
        sectionDiscardActionRef.current?.();
        handleCloseSectionRemoveModal();
    }, [handleCloseSectionRemoveModal]);

    const handleConfirmRevertSection = useCallback(() => {
        sectionDiscardActionRef.current?.();
        handleCloseSectionRevertModal();
    }, [handleCloseSectionRevertModal]);

    return {
        isSectionRemoveModalOpen,
        isSectionRevertModalOpen,
        pendingCancelActionType,
        handleRequestCancelSection,
        handleCloseSectionRemoveModal,
        handleCloseSectionRevertModal,
        handleConfirmRemoveSection,
        handleConfirmRevertSection,
    };
};
