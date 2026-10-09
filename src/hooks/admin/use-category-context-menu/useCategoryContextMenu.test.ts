import { renderHook } from '@testing-library/react';
import { useCategoryContextMenu } from './useCategoryContextMenu';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

describe('useCategoryContextMenu', () => {
    const createOpenModalActions = () => ({
        openAddCategoryModal: jest.fn(),
        openEditCategoryModal: jest.fn(),
        openDeleteCategoryModal: jest.fn(),
        openTranslateCategoryModal: jest.fn(),
    });

    it('returns the standard add/edit/delete/translate category menu options', () => {
        const { result } = renderHook(() => useCategoryContextMenu(createOpenModalActions()));

        expect(result.current.categoryContextMenuOptions).toEqual([
            { id: 'add', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.DELETE_CATEGORY },
            { id: 'addTranslation', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_TRANSLATION },
        ]);
    });

    it.each([
        ['add', 'openAddCategoryModal'],
        ['edit', 'openEditCategoryModal'],
        ['delete', 'openDeleteCategoryModal'],
        ['addTranslation', 'openTranslateCategoryModal'],
    ] as const)('opens the correct modal for the "%s" option (%s)', (optionId, actionName) => {
        const openModalActions = createOpenModalActions();
        const { result } = renderHook(() => useCategoryContextMenu(openModalActions));

        result.current.onContextMenuOptionSelected(optionId);

        expect(openModalActions[actionName]).toHaveBeenCalledTimes(1);
    });

    it('does nothing when an unknown option id is selected', () => {
        const openModalActions = createOpenModalActions();
        const { result } = renderHook(() => useCategoryContextMenu(openModalActions));

        result.current.onContextMenuOptionSelected('unknown');

        expect(openModalActions.openAddCategoryModal).not.toHaveBeenCalled();
        expect(openModalActions.openEditCategoryModal).not.toHaveBeenCalled();
        expect(openModalActions.openDeleteCategoryModal).not.toHaveBeenCalled();
        expect(openModalActions.openTranslateCategoryModal).not.toHaveBeenCalled();
    });
});
