import React, { useEffect, useRef, useState } from 'react';
import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import { ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from "../../../../../const/admin/programs";
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import InfoIcon from "../../../../../assets/icons/info.svg";

type DeleteCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDeleteCategory: (categoryId: number) => void;
  categories: ProgramCategory[];
};

export const DeleteCategoryModal = ({
  isOpen,
  onClose,
  onDeleteCategory,
  categories,
}: DeleteCategoryModalProps) => {
  const [categoryId, setCategoryId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  const handleSubmit = async () => {
    if (isSubmittingRef.current || !selectedCategory || selectedCategory.programsCount > 0) return;

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      await ProgramsApi.deleteCategory(selectedCategory.id);

      onDeleteCategory(selectedCategory.id);
      setCategoryId(0);
      onClose();
    } catch (error) {
      // Handle in your way
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setCategoryId(0);
    onClose();
  };

  useEffect(() => {
    if (isOpen && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [isOpen, categories]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    setCategoryId(selectedId);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Title>
        {PROGRAM_CATEGORY_TEXT.FORM.TITLE.DELETE_CATEGORY}
      </Modal.Title>
      <Modal.Content>
        <div className="program-form-main">
          <div className='form-group'>
            <label htmlFor="delete-category-select">
              <span className='required-field'>*</span>
              {PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}
            </label>
            <select
              id="delete-category-select"
              onChange={handleCategoryChange}
              disabled={isSubmitting}
              value={categoryId}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && selectedCategory.programsCount > 0 && (
            <div className='hint-container'>
              <div className='hint-container-title'>
                <img src={InfoIcon} alt="info-icon" />
                <span>
                  {PROGRAM_CATEGORY_VALIDATION.programsCount
                    .getProgramsCountHintTitle(selectedCategory.programsCount)}
                </span>
              </div>
              {PROGRAM_CATEGORY_VALIDATION.programsCount.getRelocationOrRemovalHint()}
            </div>
          )}
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button
          type='button'
          buttonStyle='secondary'
          className={'cancel-button'}
          onClick={handleClose}
          disabled={isSubmitting}
        >
          {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CANCEL_DELETE}
        </Button>
        <Button
          type='button'
          buttonStyle='primary'
          className={'publisher-button'}
          onClick={handleSubmit}
          disabled={!!(selectedCategory && selectedCategory.programsCount > 0) || isSubmitting}
        >
          {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CONFIRM_DELETE}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
