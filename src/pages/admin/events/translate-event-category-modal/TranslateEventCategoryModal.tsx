import { useState, useMemo } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { Button } from '@/components/admin/button/Button';
import { Select } from '@/components/common/select/Select';
import { EventCategoryDto } from '@/types/admin/event-category';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENT_CATEGORY_TEXT, EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import styles from './TranslateEventCategoryModal.module.scss';

export interface TranslateEventCategoryModalProps {
    isOpen: boolean;
    categories: EventCategoryDto[];
    onClose: () => void;
}

export const TranslateEventCategoryModal = ({ isOpen, categories, onClose }: TranslateEventCategoryModalProps) => {
    const [selectedCategory, setSelectedCategory] = useState<EventCategoryDto | null>(null);
    const [translationName, setTranslationName] = useState('');
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    }, [categories]);

    const isDirty = selectedCategory !== null || translationName.length > 0;
    const isFormValid = selectedCategory !== null && translationName.trim().length > 0;
    const maxNameLength = EVENT_CATEGORY_VALIDATION.name.max;

    const handleCategoryChange = (category: EventCategoryDto) => {
        setSelectedCategory(category);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= maxNameLength) {
            setTranslationName(e.target.value);
        }
    };

    const handleRequestClose = () => {
        if (!isDirty) {
            onClose();
            return;
        }
        setIsExitConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        setIsExitConfirmOpen(false);
        setSelectedCategory(null);
        setTranslationName('');
        onClose();
    };

    const handleCancelClose = () => {
        setIsExitConfirmOpen(false);
    };

    const handleSaveClick = () => {
        if (!isFormValid) return;
        setSelectedCategory(null);
        setTranslationName('');
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleRequestClose} className={styles['translate-category-modal']}>
                <Modal.Title>{EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.TITLE}</Modal.Title>
                <Modal.Content>
                    <div className={styles['content-wrapper']}>
                        <div className={styles['language-selector-wrapper']}>
                            <Select<string>
                                value="en"
                                onValueChange={() => {}}
                                placeholder={EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.LANGUAGE_EN}
                                headClassName={styles['language-select-head']}
                            >
                                <Select.Option value="en" name={EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.LANGUAGE_EN} />
                            </Select>
                        </div>

                        <SingleSelectInputGroup
                            id="category-select"
                            label={EVENT_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                            isRequired
                            options={sortedCategories}
                            getOptionId={(cat) => cat.id}
                            getOptionName={(cat) => cat.name}
                            placeholder={EVENT_CATEGORY_TEXT.FORM.CATEGORY_PLACEHOLDER}
                            onChange={handleCategoryChange}
                            value={selectedCategory || undefined}
                        />

                        <div className={styles['input-group']}>
                            <label htmlFor="translation-name" className={styles['input-label']}>
                                <span className={styles['required-asterisk']}>*</span>
                                {EVENT_CATEGORY_TEXT.FORM.LABEL.NAME}
                            </label>
                            <input
                                id="translation-name"
                                type="text"
                                value={translationName}
                                onChange={handleNameChange}
                                className={styles['text-input']}
                            />
                            <div className={styles['char-counter']}>
                                {translationName.length}/{maxNameLength}
                            </div>
                        </div>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        buttonStyle="primary"
                        onClick={handleSaveClick}
                        disabled={!isFormValid}
                        className={styles['submit-button']}
                    >
                        {EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.SAVE_BUTTON}
                    </Button>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={isExitConfirmOpen}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
