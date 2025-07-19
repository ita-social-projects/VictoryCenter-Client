import Modal from '../../../../../components/common/modal/Modal';
import Button from '../../../../../components/common/button/Button';
import HintContainer from '../../../../../components/common/hint/HintContainer';
import InputWithCharacterLimit from '../../../../../components/common/input-with-character-limit/InputWithCharacterLimit';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ProgramCategory, ProgramCategoryCreateUpdate } from '../../../../../types/ProgramAdminPage';
import { ProgramCategoryValidationSchema } from '../../../../../validation/admin/program-category-schema/program-category-schema';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';

type AddProgramCategoryFormValues = {
    name: string;
};

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCategory: (category: ProgramCategory) => void;
    categories: ProgramCategory[];
}

export const AddCategoryModal = ({ isOpen, onClose, onAddCategory, categories }: AddCategoryModalProps) => {
    const {
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AddProgramCategoryFormValues>({
        mode: 'onBlur',
        resolver: yupResolver(ProgramCategoryValidationSchema),
        defaultValues: {
            name: '',
        },
    });

    const nameValue = watch('name') || '';

    const isDuplicateName = categories.some(
        (category) => category.name.trim().toLowerCase() === nameValue.trim().toLowerCase(),
    );

    const onSubmit = async (data: AddProgramCategoryFormValues) => {
        if (isSubmitting || isDuplicateName) return;

        try {
            const categoryToCreate: ProgramCategoryCreateUpdate = {
                id: null,
                name: data.name.trim(),
            };

            const newCategory = await ProgramsApi.addProgramCategory(categoryToCreate);

            onAddCategory(newCategory);
            reset();
            onClose();
        } catch (error) {
            // Handle in your way
        } finally {
            // Handle in your way
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>{PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY}</Modal.Title>
            <Modal.Content>
                <form onSubmit={handleSubmit(onSubmit)} className="program-form-main" id="add-program-category-form">
                    <div className="form-group">
                        <label htmlFor="add-category-name">
                            <span className="required-field">*</span>
                            {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                        </label>
                        <Controller
                            name={'name'}
                            control={control}
                            render={({ field }) => (
                                <InputWithCharacterLimit
                                    {...field}
                                    id="add-category-name"
                                    maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                        {errors.name && <span className="error">{errors.name.message}</span>}
                    </div>
                    {isDuplicateName && (
                        <HintContainer
                            title={PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError()}
                        />
                    )}
                </form>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    type="submit"
                    form="add-program-category-form"
                    buttonStyle="primary"
                    disabled={isSubmitting || isDuplicateName || !nameValue.trim()}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.SAVE}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
