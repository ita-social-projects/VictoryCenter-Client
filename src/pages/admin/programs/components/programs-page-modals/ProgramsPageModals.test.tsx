import { render, screen } from '@testing-library/react';
import { ProgramsPageModals } from './ProgramsPageModals';
import { Program, ProgramCategory } from '@app-types/admin/programs';
import { UseModalsStateResult } from '@hooks/admin/use-modals-state/useModalsState';
import { VisibilityStatus } from '@app-types/admin/common';
import { ProgramModalProps } from '@pages/admin/programs/components/programs-page-modals/program-modal/ProgramModal';
import { DeleteProgramModalProps } from '@pages/admin/programs/components/programs-page-modals/delete-program-modal/DeleteProgramModal';
import { ProgramCategoryModalProps } from '@pages/admin/programs/components/program-category-modals/ProgramCategoryModal';

jest.mock('./program-modal/ProgramModal', () => ({
    ProgramModal: ({ isOpen, mode }: ProgramModalProps) => {
        const modeString = mode === 0 ? 'add' : 'edit'; // 0 = ModalMode.Add, 1 = ModalMode.Edit
        return isOpen ? <div data-testid={`program-modal-${modeString}`} /> : null;
    },
}));

jest.mock('./delete-program-modal/DeleteProgramModal', () => ({
    DeleteProgramModal: ({ isOpen }: DeleteProgramModalProps) =>
        isOpen ? <div data-testid="delete-program-modal" /> : null,
}));

jest.mock('../program-category-modals/ProgramCategoryModal', () => ({
    ProgramCategoryModal: ({ isOpen, mode }: ProgramCategoryModalProps) =>
        isOpen ? <div data-testid={`program-category-modal-${mode}`} /> : null,
}));

jest.mock('../program-category-modals/DeleteCategoryModal', () => ({
    DeleteCategoryModal: ({ isOpen }: DeleteProgramModalProps) =>
        isOpen ? <div data-testid="delete-category-modal" /> : null,
}));

describe('ProgramsPageModals', () => {
    const mockProgram: Program = {
        id: 1,
        name: 'Test Program',
        description: 'Test Description',
        categories: [],
        status: VisibilityStatus.Published,
        image: null,
    };

    const mockCategories: ProgramCategory[] = [
        { id: 1, name: 'Category 1', programsCount: 5 },
        { id: 2, name: 'Category 2', programsCount: 3 },
    ];

    const mockCallbacks = {
        onAddProgram: jest.fn(),
        onEditProgram: jest.fn(),
        onDeleteProgram: jest.fn(),
        onAddCategory: jest.fn(),
        onEditCategory: jest.fn(),
        onDeleteCategory: jest.fn(),
    };

    const mockCloseModalActions = {
        closeAddItemModal: jest.fn(),
        closeEditItemModal: jest.fn(),
        closeDeleteItemModal: jest.fn(),
        closeAddCategoryModal: jest.fn(),
        closeEditCategoryModal: jest.fn(),
        closeDeleteCategoryModal: jest.fn(),
    };

    const createMockModalsState = (overrides = {}): UseModalsStateResult<Program> => ({
        modalState: {
            isAddModalOpen: false,
            itemToDelete: null,
            itemToEdit: null,
            isAddCategoryModalOpen: false,
            isEditCategoryModalOpen: false,
            isDeleteCategoryModalOpen: false,
            ...overrides,
        },
        closeModalActions: mockCloseModalActions,
        openModalActions: {
            openAddItemModal: jest.fn(),
            openEditItemModal: jest.fn(),
            openDeleteItemModal: jest.fn(),
            openAddCategoryModal: jest.fn(),
            openEditCategoryModal: jest.fn(),
            openDeleteCategoryModal: jest.fn(),
        },
        isAnyModalOpened: false,
    });

    const renderProgramsPageModals = (modalsStateControl: UseModalsStateResult<Program>) =>
        render(
            <ProgramsPageModals
                modalsStateControl={modalsStateControl}
                categories={mockCategories}
                {...mockCallbacks}
            />,
        );

    // Helper functions
    const getAddProgramModal = () => screen.queryByTestId('program-modal-add');
    const getEditProgramModal = () => screen.queryByTestId('program-modal-edit');
    const getDeleteProgramModal = () => screen.queryByTestId('delete-program-modal');
    const getAddCategoryModal = () => screen.queryByTestId('program-category-modal-add');
    const getEditCategoryModal = () => screen.queryByTestId('program-category-modal-edit');
    const getDeleteCategoryModal = () => screen.queryByTestId('delete-category-modal');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render nothing when all modals are closed', () => {
        const modalsState = createMockModalsState();
        renderProgramsPageModals(modalsState);

        expect(getAddProgramModal()).not.toBeInTheDocument();
        expect(getEditProgramModal()).not.toBeInTheDocument();
        expect(getDeleteProgramModal()).not.toBeInTheDocument();
        expect(getAddCategoryModal()).not.toBeInTheDocument();
        expect(getEditCategoryModal()).not.toBeInTheDocument();
        expect(getDeleteCategoryModal()).not.toBeInTheDocument();
    });

    it('should render add program modal when isAddModalOpen is true', () => {
        const modalsState = createMockModalsState({ isAddModalOpen: true });
        renderProgramsPageModals(modalsState);

        expect(getAddProgramModal()).toBeInTheDocument();
        expect(getEditProgramModal()).not.toBeInTheDocument();
        expect(getDeleteProgramModal()).not.toBeInTheDocument();
    });

    it('should render edit program modal when itemToEdit is set', () => {
        const modalsState = createMockModalsState({ itemToEdit: mockProgram });
        renderProgramsPageModals(modalsState);

        expect(getAddProgramModal()).not.toBeInTheDocument();
        expect(getEditProgramModal()).toBeInTheDocument();
        expect(getDeleteProgramModal()).not.toBeInTheDocument();
    });

    it('should render delete program modal when itemToDelete is set', () => {
        const modalsState = createMockModalsState({ itemToDelete: mockProgram });
        renderProgramsPageModals(modalsState);

        expect(getAddProgramModal()).not.toBeInTheDocument();
        expect(getEditProgramModal()).not.toBeInTheDocument();
        expect(getDeleteProgramModal()).toBeInTheDocument();
    });

    it('should render add category modal when isAddCategoryModalOpen is true', () => {
        const modalsState = createMockModalsState({ isAddCategoryModalOpen: true });
        renderProgramsPageModals(modalsState);

        expect(getAddCategoryModal()).toBeInTheDocument();
        expect(getEditCategoryModal()).not.toBeInTheDocument();
        expect(getDeleteCategoryModal()).not.toBeInTheDocument();
    });

    it('should render edit category modal when isEditCategoryModalOpen is true', () => {
        const modalsState = createMockModalsState({ isEditCategoryModalOpen: true });
        renderProgramsPageModals(modalsState);

        expect(getAddCategoryModal()).not.toBeInTheDocument();
        expect(getEditCategoryModal()).toBeInTheDocument();
        expect(getDeleteCategoryModal()).not.toBeInTheDocument();
    });

    it('should render delete category modal when isDeleteCategoryModalOpen is true', () => {
        const modalsState = createMockModalsState({ isDeleteCategoryModalOpen: true });
        renderProgramsPageModals(modalsState);

        expect(getAddCategoryModal()).not.toBeInTheDocument();
        expect(getEditCategoryModal()).not.toBeInTheDocument();
        expect(getDeleteCategoryModal()).toBeInTheDocument();
    });

    it('should render multiple modals simultaneously', () => {
        const modalsState = createMockModalsState({
            isAddModalOpen: true,
            itemToEdit: mockProgram,
            isAddCategoryModalOpen: true,
        });
        renderProgramsPageModals(modalsState);

        expect(getAddProgramModal()).toBeInTheDocument();
        expect(getEditProgramModal()).toBeInTheDocument();
        expect(getAddCategoryModal()).toBeInTheDocument();
        expect(getDeleteProgramModal()).not.toBeInTheDocument();
        expect(getEditCategoryModal()).not.toBeInTheDocument();
        expect(getDeleteCategoryModal()).not.toBeInTheDocument();
    });
});
