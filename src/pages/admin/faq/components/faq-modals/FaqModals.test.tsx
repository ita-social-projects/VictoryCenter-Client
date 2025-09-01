import { render, screen } from '@testing-library/react';
import { FaqModals } from './FaqModals';

jest.mock('./faq-modal/FaqModal', () => ({
    FaqModal: (props: any) => <div data-testid={`faq-modal-${props.mode}`}>{props.isOpen ? 'Open' : 'Closed'}</div>,
}));

jest.mock('./delete-faq-modal/DeleteFaqModal', () => ({
    DeleteFaqModal: (props: any) => <div data-testid="delete-faq-modal">{props.isOpen ? 'Open' : 'Closed'}</div>,
}));

const mockPages = [
    { id: 1, title: 'Page 1', slug: 'page-1' },
    { id: 2, title: 'Page 2', slug: 'page-2' },
];

const mockFaq = { id: 1, questionText: 'Q', answerText: 'A', status: 1, pages: mockPages };

const getModalsState = (add = false, edit = false, del = false) => ({
    modalState: {
        isAddModalOpen: add,
        itemToEdit: edit ? mockFaq : null,
        itemToDelete: del ? mockFaq : null,
        isAddCategoryModalOpen: false,
        isEditCategoryModalOpen: false,
        isDeleteCategoryModalOpen: false,
    },
    closeModalActions: {
        closeAddItemModal: jest.fn(),
        closeEditItemModal: jest.fn(),
        closeDeleteItemModal: jest.fn(),
        closeAddCategoryModal: jest.fn(),
        closeEditCategoryModal: jest.fn(),
        closeDeleteCategoryModal: jest.fn(),
    },
    openModalActions: {
        openAddItemModal: jest.fn(),
        openEditItemModal: jest.fn(),
        openDeleteItemModal: jest.fn(),
        openAddCategoryModal: jest.fn(),
        openEditCategoryModal: jest.fn(),
        openDeleteCategoryModal: jest.fn(),
    },
    isAnyModalOpened: add || edit || del,
});

describe('FaqModals', () => {
    it('renders add modal when isAddModalOpen is true', () => {
        render(
            <FaqModals
                modalsStateControl={getModalsState(true, false, false)}
                pages={mockPages}
                onAddFaq={jest.fn()}
                onEditFaq={jest.fn()}
                onDeleteFaq={jest.fn()}
            />,
        );
        expect(screen.getByTestId('faq-modal-add')).toHaveTextContent('Open');
        expect(screen.getByTestId('faq-modal-edit')).toHaveTextContent('Closed');
        expect(screen.getByTestId('delete-faq-modal')).toHaveTextContent('Closed');
    });

    it('renders edit modal when itemToEdit is set', () => {
        render(
            <FaqModals
                modalsStateControl={getModalsState(false, true, false)}
                pages={mockPages}
                onAddFaq={jest.fn()}
                onEditFaq={jest.fn()}
                onDeleteFaq={jest.fn()}
            />,
        );
        expect(screen.getByTestId('faq-modal-add')).toHaveTextContent('Closed');
        expect(screen.getByTestId('faq-modal-edit')).toHaveTextContent('Open');
        expect(screen.getByTestId('delete-faq-modal')).toHaveTextContent('Closed');
    });

    it('renders delete modal when itemToDelete is set', () => {
        render(
            <FaqModals
                modalsStateControl={getModalsState(false, false, true)}
                pages={mockPages}
                onAddFaq={jest.fn()}
                onEditFaq={jest.fn()}
                onDeleteFaq={jest.fn()}
            />,
        );
        expect(screen.getByTestId('faq-modal-add')).toHaveTextContent('Closed');
        expect(screen.getByTestId('faq-modal-edit')).toHaveTextContent('Closed');
        expect(screen.getByTestId('delete-faq-modal')).toHaveTextContent('Open');
    });
});
