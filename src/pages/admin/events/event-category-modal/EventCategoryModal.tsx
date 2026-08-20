import { useCallback, useMemo, useState, useEffect } from 'react';
import { ModalMode } from '@/types/admin/common';
import { EventCategory } from '@/types/admin/event-category';
import { Modal } from '@/components/common/modal/Modal';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TEAM_CATEGORY_TEXT, TEAM_CATEGORY_VALIDATION } from '@/const/admin/team';

interface EventCategoryFormValues {
    name: string;
}

interface FormErrorState {
    name?: string;
}

interface BaseProps {
    isOpen: boolean;
    onClose: () => void;
    categories: EventCategory[];
}

interface AddModalProps extends BaseProps {
    mode: ModalMode.Add;
    onAddCategory: (category: EventCategory) => void;
}

interface EditModalProps extends BaseProps {
    mode: ModalMode.Edit;
    onEditCategory: (category: EventCategory) => void;
}

export type EventCategoryModalProps = AddModalProps | EditModalProps;

export const EventCategoryModal = (props: EventCategoryModalProps) => {
    const { isOpen, onClose, categories, mode } = props;

    const defaultFormState = useMemo<EventCategoryFormValues>(
        () => ({
            name: '',
        }),
        [],
    );

    const [formState, setFormState] = useState<EventCategoryFormValues>(defaultFormState);
    const [errors, setErrors] = useState<FormErrorState>({});
    const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    }, []);

    const handleCategoryChange = useCallback(
        (category: EventCategory) => {
            const selected = categories.find((cat) => cat.id === category.id);

            if (selected) {
                setSelectedCategory(selected);
                setFormState({
                    name: selected.name,
                });
            }
        },
        [categories],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === ModalMode.Edit && categories.length > 0) {
            const firstCategory = categories[0];

            setSelectedCategory(firstCategory);

            setFormState({
                name: firstCategory.name,
            });
        } else {
            setSelectedCategory(null);
            setFormState(defaultFormState);
        }
    }, [isOpen, mode, categories, defaultFormState]);

    const handleSubmit = useCallback(async () => {
        // TODO: add implementation.
    }, []);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Title>
                {mode === ModalMode.Add
                    ? COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.ADD_CATEGORY
                    : COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.EDIT_CATEGORY}
            </Modal.Title>

            <Modal.Content>
                <form>
                    {mode === ModalMode.Edit && (
                        <SingleSelectInputGroup
                            id="edit-event-category-select"
                            label={TEAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
                            isRequired
                            options={categories}
                            getOptionId={(category) => category.id}
                            getOptionName={(category) => category.name}
                            disabled={isSubmitting}
                            onChange={handleCategoryChange}
                            placeholder=""
                            value={selectedCategory || undefined}
                        />
                    )}

                    <InputWithCharacterLimitGroup
                        isRequired
                        label={TEAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                        error={errors.name}
                        value={formState.name}
                        onChange={handleNameChange}
                        name="name"
                        type="text"
                        id="event-category-name"
                        disabled={isSubmitting}
                        maxLength={TEAM_CATEGORY_VALIDATION.name.max}
                    />
                </form>
            </Modal.Content>

            <Modal.Actions>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    buttonStyle="primary"
                    disabled={isSubmitting || !formState.name.trim()}
                >
                    {COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
