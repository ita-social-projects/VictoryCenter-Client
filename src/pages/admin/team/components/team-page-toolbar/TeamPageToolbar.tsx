import PlusIcon from '../../../../../assets/icons/plus.svg';
import React, { useState, useCallback } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/common/button/Button';
import { Select } from '../../../../../components/common/select/Select';
import { Input } from '../../../../../components/common/input/Input';
import { MemberForm, MemberFormValues } from '../member-form/MemberForm';
import { StatusFilter, ModalState } from '../../../../../types/Common';
import {
    TEAM_ADD_MEMBER,
    TEAM_SAVE_AS_DRAFT,
    TEAM_PUBLISH,
    TEAM_PUBLISH_NEW_MEMBER,
    TEAM_CONFIRM,
    TEAM_CANCEL,
    TEAM_CHANGES_LOST,
    TEAM_STATUS_ALL,
    TEAM_STATUS_PUBLISHED,
    TEAM_STATUS_DRAFT,
    SEARCH_BY_NAME,
} from '../../../../../const/team';
import { ImageValues } from '../../../../../types/Image';
import { TeamCategory } from '../../../../../types/admin/TeamMembers';

export type TeamPageToolbarProps = {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (categoryFilter: StatusFilter) => void;
    autocompleteValues: string[];
    onMemberPublish?: (member: MemberFormValues) => void;
    onMemberSaveDraft?: (member: MemberFormValues) => void;
    onError?: (msg: string | null) => void;
};

type MemberFormData = {
    category: TeamCategory;
    fullName: string;
    description: string;
    image: ImageValues | null;
    imageId: number | null;
} | null;

const AddMemberModal = ({
    isOpen,
    onClose,
    onPublish,
    onSaveDraft,
    formData,
    onFormDataChange,
    onError,
    isDraft,
}: {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (member: MemberFormValues) => void;
    onSaveDraft: (member: MemberFormValues) => void;
    formData: MemberFormValues | null;
    onFormDataChange: (formData: MemberFormValues) => void;
    onError?: (msg: string | null) => void;
    isDraft: boolean;
    setIsDraftMode: (draft: boolean) => void;
}) => (
    <Modal onClose={onClose} isOpen={isOpen} data-testid="add-member-modal">
        <Modal.Title>{TEAM_ADD_MEMBER}</Modal.Title>
        <Modal.Content>
            <MemberForm
                id="add-member-modal"
                onSubmit={onPublish}
                existingMemberFormValues={formData}
                onValuesChange={onFormDataChange}
                onError={onError}
                isDraft={isDraft}
            />
        </Modal.Content>
        <Modal.Actions>
            <Button
                form="add-member-modal"
                type="submit"
                onClick={() => {
                    if (formData?.description && formData?.fullName) {
                        const safeFormData = {
                            ...formData,
                            category: formData.category || 'Основна команда',
                        };
                        onSaveDraft(safeFormData);
                    }
                }}
                buttonStyle="secondary"
            >
                {TEAM_SAVE_AS_DRAFT}
            </Button>
            <Button form="add-member-modal" type="submit" buttonStyle="primary">
                {TEAM_PUBLISH}
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
        <Modal.Title>{TEAM_PUBLISH_NEW_MEMBER}</Modal.Title>
        <Modal.Content>
            <></>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={onCancel} buttonStyle="secondary">
                {TEAM_CANCEL}
            </Button>
            <Button onClick={onConfirm} buttonStyle="primary">
                {TEAM_CONFIRM}
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
        <Modal.Title>{TEAM_CHANGES_LOST}</Modal.Title>
        <Modal.Content>
            <></>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={onCancel} buttonStyle="secondary">
                {TEAM_CANCEL}
            </Button>
            <Button onClick={onConfirm} buttonStyle="primary">
                {TEAM_CONFIRM}
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
        add: false,
        confirmPublish: false,
        confirmClose: false,
    });
    const [pendingMemberData, setPendingMemberData] = useState<MemberFormData>(null);
    const [formData, setFormData] = useState<MemberFormValues | null>(null);
    const [isDraftMode, setIsDraftMode] = useState(false);

    const updateModalState = useCallback((updates: Partial<ModalState>) => {
        setModalState((prev) => ({ ...prev, ...updates }));
    }, []);

    const hasUnsavedChanges = useCallback(() => {
        return (
            formData !== null &&
            (formData.image !== null || !!formData.category || !!formData.fullName || !!formData.description)
        );
    }, [formData]);

    const resetState = useCallback(() => {
        setPendingMemberData(null);
        setFormData(null);
        setModalState({
            add: false,
            confirmPublish: false,
            confirmClose: false,
        });
    }, []);

    const handleOpenAddMember = useCallback(() => {
        setIsDraftMode(false);
        updateModalState({ add: true });
    }, [updateModalState]);

    const handleFormSubmit = useCallback(
        (member: MemberFormValues) => {
            if (isDraftMode) {
                onMemberSaveDraft?.(member);
                resetState();
            } else {
                setPendingMemberData(member);
                setFormData(member);
                updateModalState({ confirmPublish: true });
            }
        },
        [isDraftMode, onMemberSaveDraft, resetState, updateModalState],
    );

    const handleSaveAsDraft = useCallback(
        (member: MemberFormValues) => {
            setIsDraftMode(true);
            onMemberSaveDraft?.(member);
            resetState();
        },
        [onMemberSaveDraft, resetState],
    );

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

    const getInternalState = useCallback(
        () => ({
            modalState,
            pendingMemberData,
            formData,
            hasUnsavedChanges: hasUnsavedChanges(),
        }),
        [modalState, pendingMemberData, formData, hasUnsavedChanges],
    );

    if (process.env.NODE_ENV === 'test') {
        (TeamPageToolbar as any).getInternalState = getInternalState;
    }

    return (
        <>
            <div className="toolbar">
                <div className="toolbar-search">
                    <Input
                        onChange={(e) => {
                            onSearchQueryChange(e);
                        }}
                        autocompleteValues={autocompleteValues}
                        data-testid="search-input"
                        placeholder={SEARCH_BY_NAME}
                    />
                </div>
                <div className="toolbar-actions">
                    <Select onValueChange={onStatusFilterChange} data-testid="status-filter">
                        <Select.Option key={1} name={TEAM_STATUS_ALL} value={TEAM_STATUS_ALL} />
                        <Select.Option key={2} name={TEAM_STATUS_PUBLISHED} value={TEAM_STATUS_PUBLISHED} />
                        <Select.Option key={3} name={TEAM_STATUS_DRAFT} value={TEAM_STATUS_DRAFT} />
                    </Select>
                    <Button onClick={handleOpenAddMember} buttonStyle="primary" data-testid="add-member-button">
                        {TEAM_ADD_MEMBER} <img src={PlusIcon} alt="plus" />
                    </Button>
                </div>
            </div>

            <AddMemberModal
                isOpen={modalState.add}
                onClose={handleCloseAddMember}
                onPublish={handleFormSubmit}
                onSaveDraft={handleSaveAsDraft}
                formData={formData}
                onFormDataChange={setFormData}
                isDraft={isDraftMode}
                setIsDraftMode={setIsDraftMode}
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
