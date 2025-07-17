import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { ProgramCategory, ProgramCategoryCreateUpdate,} from '../../../../../types/ProgramAdminPage';
import { ProgramCategoryValidationSchema } from '../../../../../validation/admin/program-category-schema/program-category-schema';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from "../../../../../const/admin/programs";
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import InfoIcon from "../../../../../assets/icons/info.svg";
import classNames from "classnames";

type AddProgramCategoryFormValues = {
  name: string;
};

type AddCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: ProgramCategory) => void;
  categories: ProgramCategory[];
};

export const AddCategoryModal = ({
  isOpen,
  onClose,
  onAddCategory,
  categories,
}: AddCategoryModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddProgramCategoryFormValues>({
      mode: 'onChange',
      resolver: yupResolver(ProgramCategoryValidationSchema),
      defaultValues: {
        name: '',
    },
  });

  const nameValue = watch('name') || '';

  const isDuplicateName = categories.some(
    (category) => category.name.trim().toLowerCase() === nameValue.trim().toLowerCase()
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
      <Modal.Title>
          {PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY}
      </Modal.Title>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="program-form-main" id="add-program-category-form">
          <div className='form-group'>
            <label htmlFor="add-category-name">
                <span className='required-field'>*</span>
                {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
            </label>
            <div className={classNames('input-line-wrapper', { disabled: isSubmitting })}>
              <input
                {...register('name')}
                maxLength={PROGRAM_CATEGORY_VALIDATION.name.max}
                className='input'
                name='name'
                type="text"
                id='add-category-name'
                disabled={isSubmitting}
              />
              <div className='character-limit'>
                {nameValue.length}/{PROGRAM_CATEGORY_VALIDATION.name.max}
              </div>
            </div>
            {errors.name && (
              <span className="error">{errors.name.message}</span>
            )}
          </div>

          {isDuplicateName && (
            <div className='hint-container'>
              <div className='hint-container-title'>
                <img src={InfoIcon} alt="info-icon" />
                <span>{PROGRAM_CATEGORY_VALIDATION.name.getUniqueNameError()}</span>
              </div>
            </div>
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
          {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CONFIRM_SAVE}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
