import { renderHook, act } from '@testing-library/react';
import { useModalsState } from './useModalsState';

describe('useModalsState', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useModalsState<string>());

        expect(result.current.modalState).toEqual({
            isAddModalOpen: false,
            itemToDelete: null,
            itemToEdit: null,
            itemToTranslate: null,
            isAddCategoryModalOpen: false,
            isEditCategoryModalOpen: false,
            isDeleteCategoryModalOpen: false,
        });
        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should open add item modal when no other modals are open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openAddItemModal();
        });

        expect(result.current.modalState.isAddModalOpen).toBe(true);
        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should not open add item modal when another modal is already open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openEditCategoryModal();
        });

        act(() => {
            result.current.openModalActions.openAddItemModal();
        });

        expect(result.current.modalState.isAddModalOpen).toBe(false);
        expect(result.current.modalState.isEditCategoryModalOpen).toBe(true);
    });

    it('should close add item modal', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openAddItemModal();
        });

        act(() => {
            result.current.closeModalActions.closeAddItemModal();
        });

        expect(result.current.modalState.isAddModalOpen).toBe(false);
        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should open edit item modal with item when no other modals are open', () => {
        const { result } = renderHook(() => useModalsState<string>());
        const testItem = 'test-item';

        act(() => {
            result.current.openModalActions.openEditItemModal(testItem);
        });

        expect(result.current.modalState.itemToEdit).toBe(testItem);
        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should not open edit item modal when another modal is already open', () => {
        const { result } = renderHook(() => useModalsState<string>());
        const testItem = 'test-item';

        act(() => {
            result.current.openModalActions.openAddItemModal();
        });

        act(() => {
            result.current.openModalActions.openEditItemModal(testItem);
        });

        expect(result.current.modalState.itemToEdit).toBe(null);
        expect(result.current.modalState.isAddModalOpen).toBe(true);
    });

    it('should close edit item modal', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openEditItemModal('test-item');
        });

        act(() => {
            result.current.closeModalActions.closeEditItemModal();
        });

        expect(result.current.modalState.itemToEdit).toBe(null);
        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should open delete item modal with item when no other modals are open', () => {
        const { result } = renderHook(() => useModalsState<string>());
        const testItem = 'test-item';

        act(() => {
            result.current.openModalActions.openDeleteItemModal(testItem);
        });

        expect(result.current.modalState.itemToDelete).toBe(testItem);
        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should not open delete item modal when another modal is already open', () => {
        const { result } = renderHook(() => useModalsState<string>());
        const testItem = 'test-item';

        act(() => {
            result.current.openModalActions.openAddCategoryModal();
        });

        act(() => {
            result.current.openModalActions.openDeleteItemModal(testItem);
        });

        expect(result.current.modalState.itemToDelete).toBe(null);
        expect(result.current.modalState.isAddCategoryModalOpen).toBe(true);
    });

    it('should close delete item modal', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openDeleteItemModal('test-item');
        });

        act(() => {
            result.current.closeModalActions.closeDeleteItemModal();
        });

        expect(result.current.modalState.itemToDelete).toBe(null);
        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should open add category modal when no other modals are open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openAddCategoryModal();
        });

        expect(result.current.modalState.isAddCategoryModalOpen).toBe(true);
        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should not open add category modal when another modal is already open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openEditItemModal('test-item');
        });

        act(() => {
            result.current.openModalActions.openAddCategoryModal();
        });

        expect(result.current.modalState.isAddCategoryModalOpen).toBe(false);
        expect(result.current.modalState.itemToEdit).toBe('test-item');
    });

    it('should close add category modal', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openAddCategoryModal();
        });

        act(() => {
            result.current.closeModalActions.closeAddCategoryModal();
        });

        expect(result.current.modalState.isAddCategoryModalOpen).toBe(false);
        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should open edit category modal when no other modals are open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openEditCategoryModal();
        });

        expect(result.current.modalState.isEditCategoryModalOpen).toBe(true);
        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should not open edit category modal when another modal is already open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openDeleteCategoryModal();
        });

        act(() => {
            result.current.openModalActions.openEditCategoryModal();
        });

        expect(result.current.modalState.isEditCategoryModalOpen).toBe(false);
        expect(result.current.modalState.isDeleteCategoryModalOpen).toBe(true);
    });

    it('should close edit category modal', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openEditCategoryModal();
        });

        act(() => {
            result.current.closeModalActions.closeEditCategoryModal();
        });

        expect(result.current.modalState.isEditCategoryModalOpen).toBe(false);
        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should open delete category modal when no other modals are open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openDeleteCategoryModal();
        });

        expect(result.current.modalState.isDeleteCategoryModalOpen).toBe(true);
        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should not open delete category modal when another modal is already open', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openAddItemModal();
        });

        act(() => {
            result.current.openModalActions.openDeleteCategoryModal();
        });

        expect(result.current.modalState.isDeleteCategoryModalOpen).toBe(false);
        expect(result.current.modalState.isAddModalOpen).toBe(true);
    });

    it('should close delete category modal', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openDeleteCategoryModal();
        });

        act(() => {
            result.current.closeModalActions.closeDeleteCategoryModal();
        });

        expect(result.current.modalState.isDeleteCategoryModalOpen).toBe(false);
        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should correctly detect any modal opened - boolean values', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openAddItemModal();
        });

        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should correctly detect any modal opened - non-null values', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openEditItemModal('test');
        });

        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should correctly detect no modals opened when all are closed', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openAddItemModal();
        });

        expect(result.current.isAnyModalOpened).toBe(true);

        act(() => {
            result.current.closeModalActions.closeAddItemModal();
        });

        expect(result.current.isAnyModalOpened).toBe(false);
    });

    it('should update multiple state properties at once', () => {
        const { result } = renderHook(() => useModalsState<string>());

        act(() => {
            result.current.openModalActions.openEditItemModal('test-item');
        });

        act(() => {
            result.current.openModalActions.openAddCategoryModal();
        });

        expect(result.current.modalState.isAddModalOpen).toBe(false);
        expect(result.current.modalState.itemToEdit).toBe('test-item');
        expect(result.current.modalState.isAddCategoryModalOpen).toBe(false);
        expect(result.current.isAnyModalOpened).toBe(true);
    });

    it('should work with different generic types', () => {
        interface TestItem {
            id: number;
            name: string;
        }

        const { result } = renderHook(() => useModalsState<TestItem>());
        const testItem: TestItem = { id: 1, name: 'Test' };

        act(() => {
            result.current.openModalActions.openEditItemModal(testItem);
        });

        expect(result.current.modalState.itemToEdit).toEqual(testItem);
    });

    it('should maintain action reference stability when dependencies do not change', () => {
        const { result, rerender } = renderHook(() => useModalsState<string>());

        const initialCloseActions = result.current.closeModalActions;
        const initialOpenActions = result.current.openModalActions;

        rerender();

        expect(result.current.closeModalActions).toBe(initialCloseActions);
        expect(result.current.openModalActions).toBe(initialOpenActions);
    });
});
