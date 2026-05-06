import { useCallback, useState } from 'react';

interface UseDirtyModalCloseConfirmationParams {
    isDirty: boolean;
    onClose: () => void;
}

interface UseDirtyModalCloseConfirmationResult {
    isCloseConfirmOpen: boolean;
    handleRequestClose: () => void;
    handleConfirmClose: () => void;
    handleCancelClose: () => void;
}

export const useDirtyModalCloseConfirmation = ({
    isDirty,
    onClose,
}: UseDirtyModalCloseConfirmationParams): UseDirtyModalCloseConfirmationResult => {
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

    const handleRequestClose = useCallback(() => {
        if (isDirty) {
            setIsCloseConfirmOpen(true);
            return;
        }

        onClose();
    }, [isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setIsCloseConfirmOpen(false);
        onClose();
    }, [onClose]);

    const handleCancelClose = useCallback(() => {
        setIsCloseConfirmOpen(false);
    }, []);

    return {
        isCloseConfirmOpen,
        handleRequestClose,
        handleConfirmClose,
        handleCancelClose,
    };
};
