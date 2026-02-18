import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeamPageModals, TeamPageModalsProps } from './TeamPageModals';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { TeamCategory } from '@/types/admin/team-category';
import { TeamMember } from '@/types/admin/team-members';
import { TeamMemberModalProps } from '@/pages/admin/team/components/team-member-modal/TeamMemberModal';
import { DeleteTeamMemberModalProps } from '@/pages/admin/team/components/delete-team-member-modal/DeleteTeamMemberModal';
import { LocalizationLanguage } from '@/types/common/language';

jest.mock('../team-member-modal/TeamMemberModal', () => ({
    TeamMemberModal: ({
        mode,
        isOpen,
        onClose,
        onAddMember,
        onEditMember,
        memberToEdit,
        categories,
    }: TeamMemberModalProps) => (
        <div data-testid="team-member-modal">
            <span data-testid="modal-mode">{mode}</span>
            <span data-testid="modal-is-open">{isOpen.toString()}</span>
            <span data-testid="modal-categories-count">{categories.length}</span>
            {memberToEdit && <span data-testid="modal-member-to-edit">{memberToEdit.id}</span>}
            <button data-testid="modal-close-btn" onClick={onClose}>
                Close
            </button>
            {onAddMember && (
                <button data-testid="modal-add-btn" onClick={() => onAddMember(mockTeamMember)}>
                    Add
                </button>
            )}
            {onEditMember && (
                <button data-testid="modal-edit-btn" onClick={() => onEditMember(mockTeamMember)}>
                    Edit
                </button>
            )}
        </div>
    ),
}));

jest.mock('../delete-team-member-modal/DeleteTeamMemberModal', () => ({
    DeleteTeamMemberModal: ({ isOpen, onClose, memberToDelete, onDeleteMember }: DeleteTeamMemberModalProps) => (
        <div data-testid="delete-team-member-modal">
            <span data-testid="delete-modal-is-open">{isOpen.toString()}</span>
            {memberToDelete && <span data-testid="delete-modal-member">{memberToDelete.id}</span>}
            <button data-testid="delete-modal-close-btn" onClick={onClose}>
                Close
            </button>
            {onDeleteMember && (
                <button data-testid="delete-modal-confirm-btn" onClick={() => onDeleteMember(memberToDelete!)}>
                    Delete
                </button>
            )}
        </div>
    ),
}));

jest.mock('../translate-team-member-modal/TranslateTeamMemberModal', () => ({
    TranslateTeamMemberModal: ({ isOpen, onClose, onTranslateMember, memberToTranslate, translatedLanguages }: any) => (
        <div data-testid="translate-team-member-modal">
            <span data-testid="translate-modal-is-open">{isOpen.toString()}</span>
            {memberToTranslate && <span data-testid="translate-modal-member">{memberToTranslate.id}</span>}
            <span data-testid="translate-modal-language">{translatedLanguages?.[0]?.code}</span>

            <button data-testid="translate-modal-close-btn" onClick={onClose}>
                Close
            </button>

            {onTranslateMember && memberToTranslate && (
                <button data-testid="translate-modal-confirm-btn" onClick={() => onTranslateMember(memberToTranslate)}>
                    Translate
                </button>
            )}
        </div>
    ),
}));

jest.mock('../team-category-modal/TeamCategoryModal', () => ({
    TeamCategoryModal: ({ mode, isOpen, onClose, onAddCategory, onEditCategory, categories }: any) => (
        <div data-testid="team-category-modal">
            <span data-testid="category-modal-mode">{mode}</span>
            <span data-testid="category-modal-is-open">{isOpen.toString()}</span>
            <span data-testid="category-modal-categories-count">{categories.length}</span>
            <button data-testid="category-modal-close-btn" onClick={onClose}>
                Close
            </button>
            {onAddCategory && (
                <button data-testid="category-modal-add-btn" onClick={() => onAddCategory(mockTeamCategory)}>
                    Add Category
                </button>
            )}
            {onEditCategory && (
                <button data-testid="category-modal-edit-btn" onClick={() => onEditCategory(mockTeamCategory)}>
                    Edit Category
                </button>
            )}
        </div>
    ),
}));

jest.mock('../delete-team-category-modal/DeleteTeamCategoryModal', () => ({
    DeleteTeamCategoryModal: ({ isOpen, onClose, onConfirm, categories }: any) => (
        <div data-testid="delete-team-category-modal">
            <span data-testid="delete-category-modal-is-open">{isOpen.toString()}</span>
            <span data-testid="delete-category-modal-categories-count">{categories.length}</span>
            <button data-testid="delete-category-modal-close-btn" onClick={onClose}>
                Close
            </button>
            {onConfirm && (
                <button data-testid="delete-category-modal-confirm-btn" onClick={() => onConfirm(1)}>
                    Delete Category
                </button>
            )}
        </div>
    ),
}));

jest.mock('../translate-team-category-modal/TranslateTeamCategoryModal', () => ({
    TranslateTeamCategoryModal: ({
        isOpen,
        onClose,
        onTranslateCategory,
        categoryToTranslate,
        translatedLanguages,
    }: any) => (
        <div data-testid="translate-team-category-modal">
            <span data-testid="translate-category-modal-is-open">{isOpen.toString()}</span>
            {categoryToTranslate && (
                <span data-testid="translate-category-modal-category">{categoryToTranslate.id}</span>
            )}
            <span data-testid="translate-category-modal-language">{translatedLanguages?.[0]?.code}</span>
            <button data-testid="translate-category-modal-close-btn" onClick={onClose}>
                Close
            </button>
            {onTranslateCategory && categoryToTranslate && (
                <button
                    data-testid="translate-category-modal-confirm-btn"
                    onClick={() => onTranslateCategory(categoryToTranslate)}
                >
                    Translate Category
                </button>
            )}
        </div>
    ),
}));

const mockTeamMember: TeamMember = {
    id: 1,
    image: null,
    fullName: 'John Doe',
    description: 'Test member',
    status: VisibilityStatus.Published,
    categoryId: 1,
    localizations: [],
};

const mockTeamCategory: TeamCategory = {
    id: 1,
    name: 'Test Category',
    description: 'Test category description',
    localizations: [],
    teamMembersCount: 5,
};

const mockCategories: TeamCategory[] = [
    mockTeamCategory,
    {
        id: 2,
        name: 'Another Category',
        description: 'Another test category',
        localizations: [],
        teamMembersCount: 3,
    },
];

const createMockModalsStateControl = (
    overrides: Partial<UseModalsStateResult<TeamMember>['modalState']> = {},
): UseModalsStateResult<TeamMember> => ({
    modalState: {
        isAddModalOpen: false,
        itemToDelete: null,
        itemToEdit: null,
        itemToTranslate: null,
        itemToEditTranslation: null,
        isAddCategoryModalOpen: false,
        isCategoryToEditTranslation: false,
        isCategoryToTranslate: false,
        isEditCategoryModalOpen: false,
        isDeleteCategoryModalOpen: false,
        isAddSectionModalOpen: false,
        ...overrides,
    },
    closeModalActions: {
        closeAddItemModal: jest.fn(),
        closeEditItemModal: jest.fn(),
        closeDeleteItemModal: jest.fn(),
        closeTranslateItemModal: jest.fn(),
        closeEditTranslationModal: jest.fn(),
        closeAddCategoryModal: jest.fn(),
        closeEditCategoryModal: jest.fn(),
        closeDeleteCategoryModal: jest.fn(),
        closeAddSectionModal: jest.fn(),
        closeTranslateCategoryModal: jest.fn(),
        closeEditCategoryTranslationModal: jest.fn(),
    },
    openModalActions: {
        openAddItemModal: jest.fn(),
        openEditItemModal: jest.fn(),
        openDeleteItemModal: jest.fn(),
        openTranslateItemModal: jest.fn(),
        openEditTranslationModal: jest.fn(),
        openAddCategoryModal: jest.fn(),
        openEditCategoryModal: jest.fn(),
        openDeleteCategoryModal: jest.fn(),
        openAddSectionModal: jest.fn(),
        openTranslateCategoryModal: jest.fn(),
        openEditCategoryTranslationModal: jest.fn(),
    },
    isAnyModalOpened: false,
});

const mockEnglishLanguage: LocalizationLanguage = {
    id: 1,
    code: 'en',
    name: 'English',
};

const createDefaultProps = (
    modalsStateOverrides?: Partial<UseModalsStateResult<TeamMember>['modalState']>,
): TeamPageModalsProps => ({
    modalsStateControl: createMockModalsStateControl(modalsStateOverrides),
    categories: mockCategories,
    translatedLanguages: [mockEnglishLanguage],
    onAddTeamMember: jest.fn(),
    onEditTeamMember: jest.fn(),
    onDeleteTeamMember: jest.fn(),
    onTranslateTeamMember: jest.fn(),
    onAddTeamCategory: jest.fn(),
    onEditTeamCategory: jest.fn(),
    onDeleteTeamCategory: jest.fn(),
    selectedCategory: null,
    onTranslateTeamCategory: jest.fn(),
});

describe('TeamPageModals', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Structure', () => {
        it('passes categories to all modal components', () => {
            const props = createDefaultProps();
            render(<TeamPageModals {...props} />);

            const categoryCountElements = document.querySelectorAll('[data-testid*="categories-count"]');
            categoryCountElements.forEach((element) => {
                expect(element).toHaveTextContent('2');
            });
        });
    });

    describe('Team Member Modals', () => {
        describe('Add Team Member Modal', () => {
            it('passes correct props when add modal is closed', () => {
                const props = createDefaultProps({ isAddModalOpen: false });
                render(<TeamPageModals {...props} />);

                const addModal = document.querySelectorAll('[data-testid="team-member-modal"]')[0];
                expect(addModal.querySelector('[data-testid="modal-mode"]')).toHaveTextContent(
                    ModalMode.Add.toString(),
                );
                expect(addModal.querySelector('[data-testid="modal-is-open"]')).toHaveTextContent('false');
                expect(addModal.querySelector('[data-testid="modal-member-to-edit"]')).not.toBeInTheDocument();
            });

            it('passes correct props when add modal is open', () => {
                const props = createDefaultProps({ isAddModalOpen: true });
                render(<TeamPageModals {...props} />);

                const addModal = document.querySelectorAll('[data-testid="team-member-modal"]')[0];
                expect(addModal.querySelector('[data-testid="modal-mode"]')).toHaveTextContent(
                    ModalMode.Add.toString(),
                );
                expect(addModal.querySelector('[data-testid="modal-is-open"]')).toHaveTextContent('true');
            });

            it('calls closeAddItemModal when close button is clicked', () => {
                const props = createDefaultProps({ isAddModalOpen: true });
                render(<TeamPageModals {...props} />);

                const addModal = document.querySelectorAll('[data-testid="team-member-modal"]')[0];
                const closeBtn = addModal.querySelector('[data-testid="modal-close-btn"]') as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeAddItemModal).toHaveBeenCalledTimes(1);
            });

            it('calls onAddTeamMember when add button is clicked', () => {
                const props = createDefaultProps({ isAddModalOpen: true });
                render(<TeamPageModals {...props} />);

                const addModal = document.querySelectorAll('[data-testid="team-member-modal"]')[0];
                const addBtn = addModal.querySelector('[data-testid="modal-add-btn"]') as HTMLElement;
                addBtn.click();

                expect(props.onAddTeamMember).toHaveBeenCalledWith(mockTeamMember);
            });
        });

        describe('Edit Team Member Modal', () => {
            it('passes correct props when no item to edit', () => {
                const props = createDefaultProps({ itemToEdit: null });
                render(<TeamPageModals {...props} />);

                const editModal = document.querySelectorAll('[data-testid="team-member-modal"]')[1];
                expect(editModal.querySelector('[data-testid="modal-mode"]')).toHaveTextContent(
                    ModalMode.Edit.toString(),
                );
                expect(editModal.querySelector('[data-testid="modal-is-open"]')).toHaveTextContent('false');
                expect(editModal.querySelector('[data-testid="modal-member-to-edit"]')).not.toBeInTheDocument();
            });

            it('passes correct props when item to edit exists', () => {
                const props = createDefaultProps({ itemToEdit: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const editModal = document.querySelectorAll('[data-testid="team-member-modal"]')[1];
                expect(editModal.querySelector('[data-testid="modal-mode"]')).toHaveTextContent(
                    ModalMode.Edit.toString(),
                );
                expect(editModal.querySelector('[data-testid="modal-is-open"]')).toHaveTextContent('true');
                expect(editModal.querySelector('[data-testid="modal-member-to-edit"]')).toHaveTextContent(
                    mockTeamMember.id.toString(),
                );
            });

            it('calls closeEditItemModal when close button is clicked', () => {
                const props = createDefaultProps({ itemToEdit: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const editModal = document.querySelectorAll('[data-testid="team-member-modal"]')[1];
                const closeBtn = editModal.querySelector('[data-testid="modal-close-btn"]') as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeEditItemModal).toHaveBeenCalledTimes(1);
            });

            it('calls onEditTeamMember when edit button is clicked', () => {
                const props = createDefaultProps({ itemToEdit: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const editModal = document.querySelectorAll('[data-testid="team-member-modal"]')[1];
                const editBtn = editModal.querySelector('[data-testid="modal-edit-btn"]') as HTMLElement;
                editBtn.click();

                expect(props.onEditTeamMember).toHaveBeenCalledWith(mockTeamMember);
            });
        });

        describe('Delete Team Member Modal', () => {
            it('passes correct props when no item to delete', () => {
                const props = createDefaultProps({ itemToDelete: null });
                render(<TeamPageModals {...props} />);

                const deleteModal = document.querySelector('[data-testid="delete-team-member-modal"]');
                expect(deleteModal?.querySelector('[data-testid="delete-modal-is-open"]')).toHaveTextContent('false');
                expect(deleteModal?.querySelector('[data-testid="delete-modal-member"]')).not.toBeInTheDocument();
            });

            it('passes correct props when item to delete exists', () => {
                const props = createDefaultProps({ itemToDelete: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const deleteModal = document.querySelector('[data-testid="delete-team-member-modal"]');
                expect(deleteModal?.querySelector('[data-testid="delete-modal-is-open"]')).toHaveTextContent('true');
                expect(deleteModal?.querySelector('[data-testid="delete-modal-member"]')).toHaveTextContent(
                    mockTeamMember.id.toString(),
                );
            });

            it('calls closeDeleteItemModal when close button is clicked', () => {
                const props = createDefaultProps({ itemToDelete: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const deleteModal = document.querySelector('[data-testid="delete-team-member-modal"]');
                const closeBtn = deleteModal?.querySelector('[data-testid="delete-modal-close-btn"]') as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeDeleteItemModal).toHaveBeenCalledTimes(1);
            });

            it('calls onDeleteTeamMember when delete button is clicked', () => {
                const props = createDefaultProps({ itemToDelete: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const deleteModal = document.querySelector('[data-testid="delete-team-member-modal"]');
                const deleteBtn = deleteModal?.querySelector('[data-testid="delete-modal-confirm-btn"]') as HTMLElement;
                deleteBtn.click();

                expect(props.onDeleteTeamMember).toHaveBeenCalledWith(mockTeamMember);
            });
        });

        describe('Translate Team Member Modal', () => {
            it('does render translate modal in ADD mode', () => {
                const props = {
                    ...createDefaultProps({ itemToTranslate: mockTeamMember }),
                };

                render(<TeamPageModals {...props} />);
                expect(document.querySelector('[data-testid="translate-team-member-modal"]')).toBeInTheDocument();
            });

            it('renders and passes correct props when itemToTranslate exists', () => {
                const props = createDefaultProps({ itemToTranslate: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const modal = document.querySelector('[data-testid="translate-team-member-modal"]');
                expect(modal).toBeInTheDocument();
                expect(modal?.querySelector('[data-testid="translate-modal-is-open"]')).toHaveTextContent('true');
                expect(modal?.querySelector('[data-testid="translate-modal-member"]')).toHaveTextContent(
                    mockTeamMember.id.toString(),
                );
            });

            it('calls closeTranslateItemModal when close button is clicked', () => {
                const props = createDefaultProps({ itemToTranslate: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const closeBtn = document.querySelector('[data-testid="translate-modal-close-btn"]') as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeTranslateItemModal).toHaveBeenCalledTimes(1);
            });

            it('renders translate modal in ADD mode', () => {
                const props = createDefaultProps({ itemToTranslate: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const modal = document.querySelector('[data-testid="translate-team-member-modal"]');
                expect(modal).toBeInTheDocument();
            });

            it('renders translate modal in EDIT mode', () => {
                const props = createDefaultProps({ itemToEditTranslation: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const modal = document.querySelector('[data-testid="translate-team-member-modal"]');
                expect(modal).toBeInTheDocument();
            });

            it('calls closeEditTranslationModal when close button clicked in edit translate modal', () => {
                const props = createDefaultProps({ itemToEditTranslation: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const closeBtn = document.querySelector('[data-testid="translate-modal-close-btn"]') as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeEditTranslationModal).toHaveBeenCalledTimes(1);
            });

            it('calls onTranslateTeamMember when translate button is clicked', () => {
                const props = createDefaultProps({ itemToTranslate: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const translateBtn = document.querySelector(
                    '[data-testid="translate-modal-confirm-btn"]',
                ) as HTMLElement;
                translateBtn.click();

                expect(props.onTranslateTeamMember).toHaveBeenCalledWith(mockTeamMember);
            });

            it('calls onTranslateTeamMember in EDIT mode when confirm button is clicked', () => {
                const props = createDefaultProps({ itemToEditTranslation: mockTeamMember });
                render(<TeamPageModals {...props} />);

                const translateBtn = document.querySelector(
                    '[data-testid="translate-modal-confirm-btn"]',
                ) as HTMLElement;
                translateBtn.click();

                expect(props.onTranslateTeamMember).toHaveBeenCalledWith(mockTeamMember);
            });
        });
    });

    describe('Team Category Modals', () => {
        describe('Add Team Category Modal', () => {
            it('passes correct props when add category modal is closed', () => {
                const props = createDefaultProps({ isAddCategoryModalOpen: false });
                render(<TeamPageModals {...props} />);

                const addCategoryModal = document.querySelectorAll('[data-testid="team-category-modal"]')[0];
                expect(addCategoryModal.querySelector('[data-testid="category-modal-mode"]')).toHaveTextContent(
                    ModalMode.Add.toString(),
                );
                expect(addCategoryModal.querySelector('[data-testid="category-modal-is-open"]')).toHaveTextContent(
                    'false',
                );
            });

            it('calls closeAddCategoryModal when close button is clicked', () => {
                const props = createDefaultProps({ isAddCategoryModalOpen: true });
                render(<TeamPageModals {...props} />);

                const addCategoryModal = document.querySelectorAll('[data-testid="team-category-modal"]')[0];
                const closeBtn = addCategoryModal.querySelector(
                    '[data-testid="category-modal-close-btn"]',
                ) as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeAddCategoryModal).toHaveBeenCalledTimes(1);
            });

            it('calls onAddTeamCategory when add button is clicked', () => {
                const props = createDefaultProps({ isAddCategoryModalOpen: true });
                render(<TeamPageModals {...props} />);

                const addCategoryModal = document.querySelectorAll('[data-testid="team-category-modal"]')[0];
                const addBtn = addCategoryModal.querySelector('[data-testid="category-modal-add-btn"]') as HTMLElement;
                addBtn.click();

                expect(props.onAddTeamCategory).toHaveBeenCalledWith(mockTeamCategory);
            });
        });

        describe('Edit Team Category Modal', () => {
            it('calls closeEditCategoryModal when close button is clicked', () => {
                const props = createDefaultProps({ isEditCategoryModalOpen: true });
                render(<TeamPageModals {...props} />);

                const editCategoryModal = document.querySelectorAll('[data-testid="team-category-modal"]')[1];
                const closeBtn = editCategoryModal.querySelector(
                    '[data-testid="category-modal-close-btn"]',
                ) as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeEditCategoryModal).toHaveBeenCalledTimes(1);
            });

            it('calls onEditTeamCategory when edit button is clicked', () => {
                const props = createDefaultProps({ isEditCategoryModalOpen: true });
                render(<TeamPageModals {...props} />);

                const editCategoryModal = document.querySelectorAll('[data-testid="team-category-modal"]')[1];
                const editBtn = editCategoryModal.querySelector(
                    '[data-testid="category-modal-edit-btn"]',
                ) as HTMLElement;
                editBtn.click();

                expect(props.onEditTeamCategory).toHaveBeenCalledWith(mockTeamCategory);
            });
        });

        describe('Delete Team Category Modal', () => {
            it('passes correct props when delete category modal is closed', () => {
                const props = createDefaultProps({ isDeleteCategoryModalOpen: false });
                render(<TeamPageModals {...props} />);

                const deleteCategoryModal = document.querySelector('[data-testid="delete-team-category-modal"]');
                expect(
                    deleteCategoryModal?.querySelector('[data-testid="delete-category-modal-is-open"]'),
                ).toHaveTextContent('false');
            });

            it('passes correct props when delete category modal is open', () => {
                const props = createDefaultProps({ isDeleteCategoryModalOpen: true });
                render(<TeamPageModals {...props} />);

                const deleteCategoryModal = document.querySelector('[data-testid="delete-team-category-modal"]');
                expect(
                    deleteCategoryModal?.querySelector('[data-testid="delete-category-modal-is-open"]'),
                ).toHaveTextContent('true');
            });

            it('calls closeDeleteCategoryModal when close button is clicked', () => {
                const props = createDefaultProps({ isDeleteCategoryModalOpen: true });
                render(<TeamPageModals {...props} />);

                const deleteCategoryModal = document.querySelector('[data-testid="delete-team-category-modal"]');
                const closeBtn = deleteCategoryModal?.querySelector(
                    '[data-testid="delete-category-modal-close-btn"]',
                ) as HTMLElement;
                closeBtn.click();

                expect(props.modalsStateControl.closeModalActions.closeDeleteCategoryModal).toHaveBeenCalledTimes(1);
            });

            it('calls onDeleteTeamCategory when delete button is clicked', () => {
                const props = createDefaultProps({ isDeleteCategoryModalOpen: true });
                render(<TeamPageModals {...props} />);

                const deleteCategoryModal = document.querySelector('[data-testid="delete-team-category-modal"]');
                const deleteBtn = deleteCategoryModal?.querySelector(
                    '[data-testid="delete-category-modal-confirm-btn"]',
                ) as HTMLElement;
                deleteBtn.click();

                expect(props.onDeleteTeamCategory).toHaveBeenCalledWith(1);
            });
        });

        describe('Translate Team Category Modal', () => {
            it('does not render translate category modal when selectedCategory is null', () => {
                const props = createDefaultProps({ isCategoryToTranslate: true });
                render(<TeamPageModals {...props} />);

                expect(document.querySelector('[data-testid="translate-team-category-modal"]')).not.toBeInTheDocument();
            });

            it('renders translate category modal and handles close/confirm actions', () => {
                const props = {
                    ...createDefaultProps({ isCategoryToTranslate: true }),
                    selectedCategory: mockTeamCategory,
                };
                render(<TeamPageModals {...props} />);

                const modal = document.querySelector('[data-testid="translate-team-category-modal"]');
                expect(modal).toBeInTheDocument();
                expect(modal?.querySelector('[data-testid="translate-category-modal-is-open"]')).toHaveTextContent(
                    'true',
                );
                expect(modal?.querySelector('[data-testid="translate-category-modal-category"]')).toHaveTextContent(
                    mockTeamCategory.id.toString(),
                );

                const closeBtn = modal?.querySelector(
                    '[data-testid="translate-category-modal-close-btn"]',
                ) as HTMLElement;
                closeBtn.click();
                expect(props.modalsStateControl.closeModalActions.closeTranslateCategoryModal).toHaveBeenCalledTimes(1);

                const confirmBtn = modal?.querySelector(
                    '[data-testid="translate-category-modal-confirm-btn"]',
                ) as HTMLElement;
                confirmBtn.click();
                expect(props.onTranslateTeamCategory).toHaveBeenCalledWith(mockTeamCategory);
            });

            it('does not render edit-translation category modal when selectedCategory is null', () => {
                const props = createDefaultProps({ isCategoryToEditTranslation: true });
                render(<TeamPageModals {...props} />);

                expect(document.querySelector('[data-testid="translate-team-category-modal"]')).not.toBeInTheDocument();
            });

            it('renders edit-translation category modal and handles close/confirm actions', () => {
                const props = {
                    ...createDefaultProps({ isCategoryToEditTranslation: true }),
                    selectedCategory: mockTeamCategory,
                };
                render(<TeamPageModals {...props} />);

                const modal = document.querySelector('[data-testid="translate-team-category-modal"]');
                expect(modal).toBeInTheDocument();
                expect(modal?.querySelector('[data-testid="translate-category-modal-is-open"]')).toHaveTextContent(
                    'true',
                );
                expect(modal?.querySelector('[data-testid="translate-category-modal-category"]')).toHaveTextContent(
                    mockTeamCategory.id.toString(),
                );

                const closeBtn = modal?.querySelector(
                    '[data-testid="translate-category-modal-close-btn"]',
                ) as HTMLElement;
                closeBtn.click();
                expect(
                    props.modalsStateControl.closeModalActions.closeEditCategoryTranslationModal,
                ).toHaveBeenCalledTimes(1);

                const confirmBtn = modal?.querySelector(
                    '[data-testid="translate-category-modal-confirm-btn"]',
                ) as HTMLElement;
                confirmBtn.click();
                expect(props.onTranslateTeamCategory).toHaveBeenCalledWith(mockTeamCategory);
            });
        });
    });

    describe('Modal State Integration', () => {
        it('correctly maps modalState to individual modal isOpen props', () => {
            const props = createDefaultProps({
                isAddModalOpen: true,
                isAddCategoryModalOpen: true,
                isEditCategoryModalOpen: true,
                isDeleteCategoryModalOpen: true,
                itemToEdit: mockTeamMember,
                itemToDelete: mockTeamMember,
            });
            render(<TeamPageModals {...props} />);

            const addTeamMemberModal = document.querySelectorAll('[data-testid="team-member-modal"]')[0];
            expect(addTeamMemberModal.querySelector('[data-testid="modal-is-open"]')).toHaveTextContent('true');

            const editTeamMemberModal = document.querySelectorAll('[data-testid="team-member-modal"]')[1];
            expect(editTeamMemberModal.querySelector('[data-testid="modal-is-open"]')).toHaveTextContent('true');

            const deleteTeamMemberModal = document.querySelector('[data-testid="delete-team-member-modal"]');
            expect(deleteTeamMemberModal?.querySelector('[data-testid="delete-modal-is-open"]')).toHaveTextContent(
                'true',
            );

            const addCategoryModal = document.querySelectorAll('[data-testid="team-category-modal"]')[0];
            expect(addCategoryModal.querySelector('[data-testid="category-modal-is-open"]')).toHaveTextContent('true');

            const editCategoryModal = document.querySelectorAll('[data-testid="team-category-modal"]')[1];
            expect(editCategoryModal.querySelector('[data-testid="category-modal-is-open"]')).toHaveTextContent('true');

            const deleteCategoryModal = document.querySelector('[data-testid="delete-team-category-modal"]');
            expect(
                deleteCategoryModal?.querySelector('[data-testid="delete-category-modal-is-open"]'),
            ).toHaveTextContent('true');
        });

        it('handles null values correctly', () => {
            const props = createDefaultProps({
                itemToEdit: null,
                itemToDelete: null,
            });
            render(<TeamPageModals {...props} />);

            const editModal = document.querySelectorAll('[data-testid="team-member-modal"]')[1];
            expect(editModal.querySelector('[data-testid="modal-is-open"]')).toHaveTextContent('false');

            const deleteModal = document.querySelector('[data-testid="delete-team-member-modal"]');
            expect(deleteModal?.querySelector('[data-testid="delete-modal-is-open"]')).toHaveTextContent('false');
        });
    });
});
