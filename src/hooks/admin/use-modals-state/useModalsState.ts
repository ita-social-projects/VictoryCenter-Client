import { useCallback, useMemo, useState } from 'react';

export interface BaseModalState<TEntity> {
    isAddModalOpen: boolean;
    itemToDelete: TEntity | null;
    itemToEdit: TEntity | null;
    itemToTranslate: TEntity | null;
    isAddCategoryModalOpen: boolean;
    isEditCategoryModalOpen: boolean;
    isDeleteCategoryModalOpen: boolean;
    isAddSectionModalOpen: boolean;
}

export interface BaseCloseModalActions {
    closeAddItemModal: () => void;
    closeEditItemModal: () => void;
    closeDeleteItemModal: () => void;
    closeAddCategoryModal: () => void;
    closeEditCategoryModal: () => void;
    closeTranslateItemModal: () => void;
    closeDeleteCategoryModal: () => void;
    closeAddSectionModal: () => void;
}

export interface BaseOpenModalActions<TEntity> {
    openAddItemModal: () => void;
    openEditItemModal: (item: TEntity) => void;
    openDeleteItemModal: (item: TEntity) => void;
    openTranslateItemModal: (item: TEntity) => void;
    openAddCategoryModal: () => void;
    openEditCategoryModal: () => void;
    openDeleteCategoryModal: () => void;
    openAddSectionModal: () => void;
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
        itemToTranslate: null,
        isAddCategoryModalOpen: false,
        isEditCategoryModalOpen: false,
        isDeleteCategoryModalOpen: false,
        isAddSectionModalOpen: false,
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
            closeTranslateItemModal: () => updateModalState({ itemToTranslate: null }),
            closeDeleteCategoryModal: () => updateModalState({ isDeleteCategoryModalOpen: false }),
            closeAddSectionModal: () => updateModalState({ isAddSectionModalOpen: false }),
        }),
        [updateModalState],
    );

    const openModalActions: BaseOpenModalActions<TEntity> = useMemo(() => {
        const isAnyModalOpenedInState = (state: BaseModalState<TEntity>) =>
            Object.values(state).some((value) => (typeof value === 'boolean' ? value : value !== null));

        return {
            openAddItemModal: () => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, isAddModalOpen: true };
                });
            },
            openEditItemModal: (item: TEntity) => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, itemToEdit: item };
                });
            },
            openDeleteItemModal: (item: TEntity) => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, itemToDelete: item };
                });
            },
            openTranslateItemModal: (item: TEntity) => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, itemToTranslate: item };
                });
            },
            openAddCategoryModal: () => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, isAddCategoryModalOpen: true };
                });
            },
            openEditCategoryModal: () => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, isEditCategoryModalOpen: true };
                });
            },
            openDeleteCategoryModal: () => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, isDeleteCategoryModalOpen: true };
                });
            },
            openAddSectionModal: () => {
                setModalState((prev) => {
                    if (isAnyModalOpenedInState(prev)) return prev;
                    return { ...prev, isAddSectionModalOpen: true };
                });
            },
        };
    }, []);

    return {
        modalState,
        isAnyModalOpened,
        closeModalActions,
        openModalActions,
    };
};
