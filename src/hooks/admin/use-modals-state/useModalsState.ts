import { useCallback, useMemo, useState } from 'react';

export interface BaseModalState<T> {
    isAddModalOpen: boolean;
    itemToDelete: T | null;
    itemToEdit: T | null;
    isAddCategoryModalOpen: boolean;
    isEditCategoryModalOpen: boolean;
    isDeleteCategoryModalOpen: boolean;
}

export interface BaseCloseModalActions {
    closeAddItemModal: () => void;
    closeEditItemModal: () => void;
    closeDeleteItemModal: () => void;
    closeAddCategoryModal: () => void;
    closeEditCategoryModal: () => void;
    closeDeleteCategoryModal: () => void;
}

export interface BaseOpenModalActions<T> {
    openAddItemModal: () => void;
    openEditItemModal: (item: T) => void;
    openDeleteItemModal: (item: T) => void;
    openAddCategoryModal: () => void;
    openEditCategoryModal: () => void;
    openDeleteCategoryModal: () => void;
}

export interface UseModalsStateResult<T> {
    modalState: BaseModalState<T>;
    openModalActions: BaseOpenModalActions<T>;
    closeModalActions: BaseCloseModalActions;
    updateModalState: (updates: Partial<BaseModalState<T>>) => void;
    isAnyModalOpened: boolean;
}

export const useModalsState = <T>(): UseModalsStateResult<T> => {
    const [modalState, setModalState] = useState<BaseModalState<T>>({
        isAddModalOpen: false,
        itemToDelete: null,
        itemToEdit: null,
        isAddCategoryModalOpen: false,
        isEditCategoryModalOpen: false,
        isDeleteCategoryModalOpen: false,
    });

    const isAnyModalOpened = useMemo(() => {
        return Object.values(modalState).some((value) => (typeof value === 'boolean' ? value : value !== null));
    }, [modalState]);

    const updateModalState = useCallback((updates: Partial<BaseModalState<T>>) => {
        setModalState((prev) => ({ ...prev, ...updates }));
    }, []);

    const closeModalActions: BaseCloseModalActions = useMemo(
        () => ({
            closeAddItemModal: () => updateModalState({ isAddModalOpen: false }),
            closeEditItemModal: () => updateModalState({ itemToEdit: null }),
            closeDeleteItemModal: () => updateModalState({ itemToDelete: null }),
            closeAddCategoryModal: () => updateModalState({ isAddCategoryModalOpen: false }),
            closeEditCategoryModal: () => updateModalState({ isEditCategoryModalOpen: false }),
            closeDeleteCategoryModal: () => updateModalState({ isDeleteCategoryModalOpen: false }),
        }),
        [updateModalState],
    );

    const openModalActions: BaseOpenModalActions<T> = useMemo(
        () => ({
            openAddItemModal: () => {
                if (!isAnyModalOpened) {
                    updateModalState({ isAddModalOpen: true });
                }
            },
            openEditItemModal: (item: T) => {
                if (!isAnyModalOpened) {
                    updateModalState({ itemToEdit: item });
                }
            },
            openDeleteItemModal: (item: T) => {
                if (!isAnyModalOpened) {
                    updateModalState({ itemToDelete: item });
                }
            },
            openAddCategoryModal: () => {
                if (!isAnyModalOpened) {
                    updateModalState({ isAddCategoryModalOpen: true });
                }
            },
            openEditCategoryModal: () => {
                if (!isAnyModalOpened) {
                    updateModalState({ isEditCategoryModalOpen: true });
                }
            },
            openDeleteCategoryModal: () => {
                if (!isAnyModalOpened) {
                    updateModalState({ isDeleteCategoryModalOpen: true });
                }
            },
        }),
        [isAnyModalOpened, updateModalState],
    );

    return {
        modalState,
        isAnyModalOpened,
        updateModalState,
        closeModalActions,
        openModalActions,
    };
};
