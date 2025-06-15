import PlusIcon from "../../../../../assets/icons/plus.svg";
import React, { useState, useCallback } from "react";
import { Modal } from "../../../../../components/common/modal/Modal";
import { TeamCategory } from "../../TeamPage";
import { Button } from "../../../../../components/common/button/Button";
import { Select } from "../../../../../components/common/select/Select";
import { Input } from "../../../../../components/common/input/Input";
import { MemberForm, MemberFormValues } from "../member-form/MemberForm";

export type TeamPageToolbarProps = {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (categoryFilter: StatusFilter) => void;
    autocompleteValues: string[];
    onMemberPublish?: (member: MemberFormValues) => void;
    onMemberSaveDraft?: (member: MemberFormValues) => void;
};

export type StatusFilter = "Усі" | "Опубліковано" | "Чернетка";

type ModalState = {
    addMember: boolean;
    confirmPublish: boolean;
    confirmClose: boolean;
};

type MemberFormData = {
    category: TeamCategory;
    fullName: string;
    description: string;
    img: FileList | null;
} | null;

const AddMemberModal = ({
                            isOpen,
                            onClose,
                            onPublish,
                            onSaveDraft,
                        }: {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (member: MemberFormValues) => void;
    onSaveDraft: (member: MemberFormValues) => void;
}) => (
    <Modal onClose={onClose} isOpen={isOpen} data-testid="add-member-modal">
        <Modal.Title>Додати в команду</Modal.Title>
        <Modal.Content>
            <MemberForm id="add-member-modal" onSubmit={onPublish} />
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={() => onSaveDraft({} as MemberFormValues)} buttonStyle="secondary">
                Зберегти як чернетку
            </Button>
            <Button form="add-member-modal" type="submit" buttonStyle="primary">
                Опублікувати
            </Button>
        </Modal.Actions>
    </Modal>
);

const ConfirmPublishModal = ({
                                 isOpen,
                                 onCancel,
                                 onConfirm,
                             }: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) => (
    <Modal isOpen={isOpen} onClose={onCancel} data-testid="publish-confirm-modal">
        <Modal.Title>Опублікувати нового члена команди?</Modal.Title>
        <Modal.Content>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={onCancel} buttonStyle="secondary">
                Ні
            </Button>
            <Button onClick={onConfirm} buttonStyle="primary">
                Так
            </Button>
        </Modal.Actions>
    </Modal>
);

const ConfirmCloseModal = ({
                               isOpen,
                               onCancel,
                               onConfirm,
                           }: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) => (
    <Modal isOpen={isOpen} onClose={onCancel} data-testid="confirm-close-modal">
        <Modal.Title>Зміни буде втрачено. Бажаєте продовжити?</Modal.Title>
        <Modal.Content>

        </Modal.Content>
        <Modal.Actions>
            <Button onClick={onCancel} buttonStyle="secondary">
                Ні
            </Button>
            <Button onClick={onConfirm} buttonStyle="primary">
                Так
            </Button>
        </Modal.Actions>
    </Modal>
);

export const TeamPageToolbar = ({
                                    onSearchQueryChange,
                                    onStatusFilterChange,
                                    autocompleteValues,
                                    onMemberPublish,
                                    onMemberSaveDraft,
                                }: TeamPageToolbarProps) => {
    const [modalState, setModalState] = useState<ModalState>({
        addMember: false,
        confirmPublish: false,
        confirmClose: false,
    });

    const [pendingMemberData, setPendingMemberData] = useState<MemberFormData>(null);
    const [formData, setFormData] = useState<MemberFormData>(null);

    const updateModalState = useCallback((updates: Partial<ModalState>) => {
        setModalState(prev => ({ ...prev, ...updates }));
    }, []);

    const hasUnsavedChanges = useCallback(() => {
        return formData !== null && (
            formData.img !== null ||
            !!formData.category ||
            !!formData.fullName ||
            !!formData.description
        );
    }, [formData]);

    const resetState = useCallback(() => {
        setPendingMemberData(null);
        setFormData(null);
        setModalState({
            addMember: false,
            confirmPublish: false,
            confirmClose: false,
        });
    }, []);

    const handleOpenAddMember = useCallback(() => {
        updateModalState({ addMember: true });
    }, [updateModalState]);

    const handleFormSubmit = useCallback((member: MemberFormValues) => {
        setPendingMemberData(member);
        setFormData(member);
        updateModalState({ confirmPublish: true });
    }, [updateModalState]);

    const handleSaveAsDraft = useCallback((member: MemberFormValues) => {
        onMemberSaveDraft?.(member);
        resetState();
    }, [onMemberSaveDraft, resetState]);

    const handleCancelPublish = useCallback(() => {
        setPendingMemberData(null);
        updateModalState({ confirmPublish: false });
    }, [updateModalState]);

    const handleConfirmPublish = useCallback(() => {
        if (pendingMemberData) {
            onMemberPublish?.(pendingMemberData);
        }
        resetState();
    }, [pendingMemberData, onMemberPublish, resetState]);

    const handleCloseAddMember = useCallback(() => {
        if (hasUnsavedChanges()) {
            updateModalState({ confirmClose: true });
        } else {
            resetState();
        }
    }, [hasUnsavedChanges, updateModalState, resetState]);

    const handleCancelClose = useCallback(() => {
        updateModalState({ confirmClose: false });
    }, [updateModalState]);

    const handleConfirmClose = useCallback(() => {
        resetState();
    }, [resetState]);

    // For testing purposes, expose internal state
    const getInternalState = useCallback(() => ({
        modalState,
        pendingMemberData,
        formData,
        hasUnsavedChanges: hasUnsavedChanges(),
    }), [modalState, pendingMemberData, formData, hasUnsavedChanges]);

    if (process.env.NODE_ENV === 'test') {
        (TeamPageToolbar as any).getInternalState = getInternalState;
    }

    return (
        <>
            <div className="toolbar">
                <div className="toolbar-search">
                    <Input
                        onChange={onSearchQueryChange}
                        autocompleteValues={autocompleteValues}
                        data-testid="search-input"
                    />
                </div>
                <div className="toolbar-actions">
                    <Select onValueChange={onStatusFilterChange} data-testid="status-filter">
                        <Select.Option name="Усі" value="Усі" />
                        <Select.Option name="Опубліковано" value="Опубліковано" />
                        <Select.Option name="Чернетка" value="Чернетка" />
                    </Select>
                    <Button
                        onClick={handleOpenAddMember}
                        buttonStyle="primary"
                        data-testid="add-member-button"
                    >
                        Додати в команду
                        <img src={PlusIcon} alt="plus" />
                    </Button>
                </div>
            </div>

            <AddMemberModal
                isOpen={modalState.addMember}
                onClose={handleCloseAddMember}
                onPublish={handleFormSubmit}
                onSaveDraft={handleSaveAsDraft}
            />

            <ConfirmPublishModal
                isOpen={modalState.confirmPublish}
                onCancel={handleCancelPublish}
                onConfirm={handleConfirmPublish}
            />

            <ConfirmCloseModal
                isOpen={modalState.confirmClose}
                onCancel={handleCancelClose}
                onConfirm={handleConfirmClose}
            />
        </>
    );
};
