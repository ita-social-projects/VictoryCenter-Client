import { useCallback, useMemo, useState } from 'react';

export interface BaseModalState<TEntity> {
    isAddModalOpen: boolean;
    itemToDelete: TEntity | null;
    itemToEdit: TEntity | null;
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

export interface BaseOpenModalActions<TEntity> {
    openAddItemModal: () => void;
    openEditItemModal: (item: TEntity) => void;
    openDeleteItemModal: (item: TEntity) => void;
    openAddCategoryModal: () => void;
    openEditCategoryModal: () => void;
    openDeleteCategoryModal: () => void;
}

export interface UseModalsStateResult<TEntity> {
    modalState: BaseModalState<TEntity>;
    openModalActions: BaseOpenModalActions<TEntity>;
    closeModalActions: BaseCloseModalActions;
    isAnyModalOpened: boolean;
}

export const useModalsState = <TEntity>(): UseModalsStateResult<TEntity> => {
    const [modalState, setModalState] = useState<BaseModalState<TEntity>>({
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

    const updateModalState = useCallback((updates: Partial<BaseModalState<TEntity>>) => {
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

    const openModalActions: BaseOpenModalActions<TEntity> = useMemo(
        () => ({
            openAddItemModal: () => {
                if (!isAnyModalOpened) {
                    updateModalState({ isAddModalOpen: true });
                }
            },
            openEditItemModal: (item: TEntity) => {
                if (!isAnyModalOpened) {
                    updateModalState({ itemToEdit: item });
                }
            },
            openDeleteItemModal: (item: TEntity) => {
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
        closeModalActions,
        openModalActions,
    };
};
