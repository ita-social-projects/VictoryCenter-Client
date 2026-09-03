import { Image, ImageValues } from '@/types/common/image';
import { Modal } from '@/components/common/modal/Modal';
import { EVENTS_TEXT, EVENT_VALIDATION } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { useCallback, useState, useEffect } from 'react';
import { EventCategoryDto } from '@/types/admin/event-category';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import styles from './EventModal.module.scss';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';

interface EventFormValues {
    title: string;
    description: string;
    additionalDescription: string;
    publishDate: string | null;
    image: Image | ImageValues | null;
    linkUkr: string;
    linkEng: string;
}

type EventFormErrorState = Partial<Record<keyof EventFormValues, string>>;

export type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    currentCategory: EventCategoryDto | null;
};

const defaultFormState: EventFormValues = {
    title: '',
    description: '',
    additionalDescription: '',
    publishDate: null,
    image: null,
    linkUkr: '',
    linkEng: '',
};

export const EventModal = (props: EventModalProps) => {
    const { isOpen, onClose, currentCategory } = props;

    const [formState, setFormState] = useState<EventFormValues>(defaultFormState);
    const [errors, setErrors] = useState<EventFormErrorState>({});
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

    const isDirty = JSON.stringify(formState) !== JSON.stringify(defaultFormState);

    const handleFieldChange = useCallback(
        (name: keyof EventFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormState((prev) => ({
                ...prev,
                [name]: e.target.value,
            }));
        },
        [],
    );

    const handleClose = useCallback(() => {
        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }

        onClose();
    }, [isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);

    const handleCloseConfirmModalClose = useCallback(() => {
        setShowCloseConfirmModal(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            return;
        }
        setFormState(defaultFormState);
        setErrors({});
        setShowCloseConfirmModal(false);
    }, [isOpen]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} maxWidth="665px" className={styles['modal']}>
                <Modal.Title>
                    <h2 className={styles['modal-title']}>{EVENTS_TEXT.FORM.MODAL_TITLE}</h2>
                </Modal.Title>

                <Modal.Content>
                    <form onSubmit={(e) => e.preventDefault()} className={styles['container']}>
                        {currentCategory && <span className={styles['category-chip']}>{currentCategory.name}</span>}

                        <InputWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.TITLE}
                            id="event-title"
                            name="title"
                            value={formState.title}
                            onChange={handleFieldChange('title')}
                            maxLength={EVENT_VALIDATION.title.max}
                            error={errors.title}
                            isRequired
                            showCounterBelow
                        />

                        <TextAreaWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.DESCRIPTION}
                            id="event-description"
                            name="description"
                            value={formState.description}
                            onChange={handleFieldChange('description')}
                            maxLength={EVENT_VALIDATION.description.max}
                            error={errors.description}
                            isRequired
                            rows={4}
                        />

                        <div className={styles['two-column-container']}>
                            <div className={styles['left-column']}>
                                {/*date picker*/}
                                <div className={styles['date-placeholder']}></div>

                                {/*image upload*/}
                                <div className={styles['image-placeholder']}></div>
                            </div>

                            <div>
                                <TextAreaWithCharacterLimitGroup
                                    label={EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION}
                                    id="event-additional-description"
                                    name="additional-description"
                                    value={formState.additionalDescription}
                                    onChange={handleFieldChange('additionalDescription')}
                                    maxLength={EVENT_VALIDATION.additionalDescription.max}
                                    error={errors.additionalDescription}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className={styles['divider']} />

                        <h4 className={styles['link-section-title']}>{EVENTS_TEXT.FORM.LINKS_SECTION_TITLE}</h4>

                        <InputWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.LINK_UKR}
                            id="event-link-ukr"
                            name="linkUkr"
                            value={formState.linkUkr}
                            onChange={handleFieldChange('linkUkr')}
                            maxLength={EVENT_VALIDATION.link.max}
                            error={errors.linkUkr}
                            isRequired
                            showCounter={false}
                            className={styles['link-ukr']}
                        />

                        <InputWithCharacterLimitGroup
                            label={EVENTS_TEXT.FORM.LABEL.LINK_ENG}
                            id="event-link-eng"
                            name="linkEng"
                            value={formState.linkEng}
                            onChange={handleFieldChange('linkEng')}
                            maxLength={EVENT_VALIDATION.link.max}
                            error={errors.linkEng}
                            showCounter={false}
                            className={styles['link-eng']}
                        />
                    </form>
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles['buttons-wrapper']}>
                        <Button
                            type="button"
                            buttonStyle="secondary"
                            disabled={true}
                            className={styles['action-button']}
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT}
                        </Button>
                        <Button type="button" buttonStyle="primary" disabled={true} className={styles['action-button']}>
                            {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onClose={handleCloseConfirmModalClose}
                onCancel={handleCloseConfirmModalClose}
                onConfirm={handleConfirmClose}
            />
        </>
    );
};
