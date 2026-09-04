import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { HintBox } from '@/components/admin/hint-box/HintBox';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { Button } from '@/components/admin/button/Button';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ToastType } from '@/types/admin/toast';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENT_CATEGORY_VALIDATION, EVENT_NOTIFICATION_TIMERS } from '@/const/admin/events';

export interface DeleteEventCategoryModalProps {
    isOpen: boolean;
    categories: EventCategoryDto[];

    onClose: () => void;
    onConfirm: (categoryId: number) => void;
}

export const DeleteEventCategoryModal = ({ isOpen, categories, onClose, onConfirm }: DeleteEventCategoryModalProps) => {
    const client = useAdminClient();
    const [selectedCategory, setSelectedCategory] = useState<EventCategoryDto>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categoryToConfirm, setCategoryToConfirm] = useState<EventCategoryDto | null>(null);
    const { addToast } = useToast();

    const handleClose = () => {
        if (isSubmitting || !!categoryToConfirm) {
            return;
        }

        setSelectedCategory(undefined);
        onClose();
    };

    const handleCategoryChange = (category: EventCategoryDto) => {
        setSelectedCategory(category);
    };

    const handleSubmit = () => {
        if (isSubmitting || !selectedCategory || selectedCategory.relatedEventNewsCount) {
            return;
        }

        setCategoryToConfirm(selectedCategory);
    };

    const isDeleteDisabled = !selectedCategory?.id || isSubmitting || selectedCategory.relatedEventNewsCount > 0;

    const handleConfirmClose = () => {
        if (isSubmitting) {
            return;
        }

        setCategoryToConfirm(null);
    };

    const handleConfirmDelete = async () => {
        if (isSubmitting || !selectedCategory) {
            return;
        }

        try {
            setIsSubmitting(true);
            if (selectedCategory.relatedEventNewsCount > 0) {
                return;
            }
            await EventCategoriesApi.delete(client, categoryToConfirm!.id);

            onConfirm(categoryToConfirm!.id);
            setSelectedCategory(undefined);
            setCategoryToConfirm(null);
            onClose();
        } catch {
            setCategoryToConfirm(null);

            addToast(
                COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY,
                ToastType.Error,
                EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasRelatedRecords = () => selectedCategory && selectedCategory.relatedEventNewsCount > 0;

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY}</Modal.Title>
                <Modal.Content>
                    <div className="delete-category-modal-content">
                        <SingleSelectInputGroup
                            id="delete-category-select"
                            label={COMMON_TEXT_ADMIN.CATEGORIES.FORM.LABEL.CATEGORY}
                            isRequired
                            options={categories}
                            getOptionId={(cat) => cat.id}
                            getOptionName={(cat) => cat.name}
                            placeholder={COMMON_TEXT_ADMIN.FILTER.CATEGORY.SELECT_CATEGORY}
                            onChange={handleCategoryChange}
                            disabled={isSubmitting}
                            value={selectedCategory}
                        />
                        {hasRelatedRecords() && (
                            <HintBox
                                title={EVENT_CATEGORY_VALIDATION.eventItemsCount.getHasEventNewsCountError(
                                    selectedCategory!.relatedEventNewsCount,
                                )}
                                text={EVENT_CATEGORY_VALIDATION.eventItemsCount.getRelocationOrRemovalHint()}
                            />
                        )}
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button buttonStyle="secondary" onClick={handleClose} disabled={isSubmitting}>
                        {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                    </Button>
                    <Button buttonStyle="primary" onClick={handleSubmit} disabled={isDeleteDisabled}>
                        {COMMON_TEXT_ADMIN.BUTTON.DELETE}
                    </Button>
                </Modal.Actions>
            </Modal>
            <ConfirmationModal
                isOpen={!!categoryToConfirm}
                onClose={handleConfirmClose}
                onCancel={handleConfirmClose}
                onConfirm={handleConfirmDelete}
                title={COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY_CONFIRM}
                isButtonsDisabled={isSubmitting}
            />
        </>
    );
};
