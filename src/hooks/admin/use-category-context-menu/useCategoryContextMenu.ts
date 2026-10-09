import { useCallback, useMemo } from 'react';
import { ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface CategoryContextMenuModalActions {
    openAddCategoryModal: () => void;
    openEditCategoryModal: () => void;
    openDeleteCategoryModal: () => void;
    openTranslateCategoryModal: () => void;
}

export const useCategoryContextMenu = (openModalActions: CategoryContextMenuModalActions) => {
    const categoryContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.DELETE_CATEGORY },
            { id: 'addTranslation', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_TRANSLATION },
        ],
        [],
    );

    const onContextMenuOptionSelected = useCallback(
        (id: string) => {
            if (id === 'add') {
                openModalActions.openAddCategoryModal();
            } else if (id === 'edit') {
                openModalActions.openEditCategoryModal();
            } else if (id === 'delete') {
                openModalActions.openDeleteCategoryModal();
            } else if (id === 'addTranslation') {
                openModalActions.openTranslateCategoryModal();
            }
        },
        [openModalActions],
    );

    return { categoryContextMenuOptions, onContextMenuOptionSelected };
};
