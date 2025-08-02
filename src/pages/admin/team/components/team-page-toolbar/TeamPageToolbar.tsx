import PlusIcon from '../../../../../assets/icons/plus.svg';
import React, { useState, useCallback } from 'react';
import { Modal } from '../../../../../components/common/modal/Modal';
import { Button } from '../../../../../components/common/button/Button';
import { Select } from '../../../../../components/common/select/Select';
import { MemberForm, MemberFormValues } from '../member-form/MemberForm';
import { ImageValues } from '../../../../../types/common/image';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TeamCategory } from '../../../../../types/admin/team-members';
import { StatusFilter, ModalState } from '../../../../../types/common';

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
        <Modal.Title>{TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER}</Modal.Title>
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
                formId="add-member-modal"
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
                {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
            </Button>
            <Button formId="add-member-modal" type="submit" buttonStyle="primary">
                {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
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
        <Modal.Title>{TEAM_MEMBERS_TEXT.QUESTION.PUBLISH_MEMBER}</Modal.Title>
        <Modal.Content>
            <></>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={onCancel} buttonStyle="secondary">
                {COMMON_TEXT_ADMIN.BUTTON.NO}
            </Button>
            <Button onClick={onConfirm} buttonStyle="primary">
                {COMMON_TEXT_ADMIN.BUTTON.YES}
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
        <Modal.Title>{COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}</Modal.Title>
        <Modal.Content>
            <></>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={onCancel} buttonStyle="secondary">
                {COMMON_TEXT_ADMIN.BUTTON.NO}
            </Button>
            <Button onClick={onConfirm} buttonStyle="primary">
                {COMMON_TEXT_ADMIN.BUTTON.YES}
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
                    <SearchBar
                        onChange={(e) => {
                            onSearchQueryChange(e);
                        }}
                        autocompleteValues={autocompleteValues}
                        data-testid="search-input"
                        placeholder={TEAM_MEMBERS_TEXT.FORM.SEARCH.SEARCH_BY_NAME}
                    />
                </div>
                <div className="toolbar-actions">
                    <Select onValueChange={onStatusFilterChange} data-testid="status-filter">
                        <Select.Option
                            key={1}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.ALL}
                            value={COMMON_TEXT_ADMIN.FILTER.STATUS.ALL}
                        />
                        <Select.Option
                            key={2}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED}
                            value={COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED}
                        />
                        <Select.Option
                            key={3}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT}
                            value={COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT}
                        />
                    </Select>
                    <Button onClick={handleOpenAddMember} buttonStyle="primary" data-testid="add-member-button">
                        {TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER} <img src={PlusIcon} alt="plus" />
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
