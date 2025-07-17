import React, { useEffect, useRef } from 'react';
import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { ProgramCategory, ProgramCategoryCreateUpdate } from '../../../../../types/ProgramAdminPage';
import { ProgramCategoryValidationSchema } from '../../../../../validation/admin/program-category-schema/program-category-schema';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from "../../../../../const/admin/programs";
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import InfoIcon from "../../../../../assets/icons/info.svg";
import classNames from "classnames";

type EditProgramCategoryFormValues = {
  name: string;
};

type EditCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditCategory: (category: ProgramCategory) => void;
  categories: ProgramCategory[];
};

export const EditCategoryModal = ({
  isOpen,
  onClose,
  onEditCategory,
  categories,
}: EditCategoryModalProps) => {
  const selectedCategoryRef = useRef<null | ProgramCategory>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditProgramCategoryFormValues>({
    mode: 'onChange',
    resolver: yupResolver(ProgramCategoryValidationSchema),
    defaultValues: {
      name: '',
    },
  });

  const nameValue = watch('name') || '';

  const isDuplicateName = categories.some(
    (category) =>
      category.id !== selectedCategoryRef.current?.id &&
      category.name.trim().toLowerCase() === nameValue.trim().toLowerCase()
  );

  const onSubmit = async (data: EditProgramCategoryFormValues) => {
    if (isSubmitting || isDuplicateName || !selectedCategoryRef.current) return;

    try {
      const categoryToUpdate: ProgramCategoryCreateUpdate = {
        id: selectedCategoryRef.current.id,
        name: data.name.trim(),
      };

      const updatedCategory = await ProgramsApi.editCategory(categoryToUpdate);

      onEditCategory(updatedCategory);
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
    selectedCategoryRef.current = null;
    onClose();
  };

  useEffect(() => {
    if (isOpen && categories.length > 0) {
      const firstCategory = categories[0];
      selectedCategoryRef.current = firstCategory;
      setValue('name', firstCategory.name);
    }
  }, [isOpen, categories, setValue]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const selected = categories.find(cat => cat.id === selectedId);
    if (selected) {
      selectedCategoryRef.current = selected;
      setValue('name', selected.name);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Title>
        {PROGRAM_CATEGORY_TEXT.FORM.TITLE.EDIT_CATEGORY}
      </Modal.Title>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="program-form-main" id="edit-program-category-form">
          <div className='form-group'>
            <label htmlFor="edit-category-select">
                <span className='required-field'>*</span>
              {PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
            </label>
            <select
              id="edit-category-select"
              onChange={handleCategoryChange}
              disabled={isSubmitting}
              value={selectedCategoryRef.current?.id || ''}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className='form-group form-group-name'>
            <label htmlFor="edit-category-name">
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
                id='edit-category-name'
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
          form="edit-program-category-form"
          buttonStyle="primary"
          disabled={isSubmitting || isDuplicateName || !nameValue.trim()}
        >
          {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CONFIRM_SAVE}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
