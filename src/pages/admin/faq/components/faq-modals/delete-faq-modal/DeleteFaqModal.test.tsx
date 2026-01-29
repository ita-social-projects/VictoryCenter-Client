import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteFaqModal } from './DeleteFaqModal';
import { FaqApi } from '@/services/api/admin/faq/faq-api';
import { FAQ_TEXT } from '@/const/admin/faq';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

jest.mock('@/services/api/admin/faq/faq-api');
const mockFaqApi = FaqApi as jest.Mocked<typeof FaqApi>;

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ isOpen, children }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null);
    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;
    return { Modal };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled} data-testid={`btn-${children}`}>
            {children}
        </button>
    ),
}));

const mockFaq = {
    id: 1,
    questionText: 'Question',
    answerText: 'Answer',
    status: 1 as any,
    pages: [],
    localizations: [],
};

describe('DeleteFaqModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onDeleteFaq: jest.fn(),
        faqToDelete: mockFaq,
    };

    const renderModal = (props = {}) => render(<DeleteFaqModal {...defaultProps} {...props} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with title and buttons', () => {
        renderModal();

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent(FAQ_TEXT.FORM.TITLE.DELETE_FAQ);
        expect(screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.CANCEL}`)).toBeInTheDocument();
        expect(screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.DELETE}`)).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    //
    it('calls API and callbacks on successful delete', async () => {
        mockFaqApi.delete.mockResolvedValue(undefined);
        renderModal();

        const deleteBtn = screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.DELETE}`);
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockFaqApi.delete).toHaveBeenCalledWith(expect.anything(), mockFaq.id);
            expect(defaultProps.onDeleteFaq).toHaveBeenCalledWith(mockFaq);
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('displays error message on API failure', async () => {
        mockFaqApi.delete.mockRejectedValue(new Error('Network error'));
        renderModal();

        const deleteBtn = screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.DELETE}`);
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(screen.getByText(FAQ_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_FAQ)).toBeInTheDocument();
        });

        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('disables buttons while submitting', async () => {
        mockFaqApi.delete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
        renderModal();

        const deleteBtn = screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.DELETE}`);
        const cancelBtn = screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.CANCEL}`);

        fireEvent.click(deleteBtn);

        expect(deleteBtn).toBeDisabled();
        expect(cancelBtn).toBeDisabled();

        await waitFor(() => {
            expect(mockFaqApi.delete).toHaveBeenCalled();
        });
    });

    it('prevents closing the modal while submitting', () => {
        mockFaqApi.delete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));
        renderModal();

        fireEvent.click(screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.DELETE}`));

        fireEvent.click(screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.CANCEL}`));

        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('clears error and closes modal when cancelled', () => {
        renderModal();
        const cancelBtn = screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.CANCEL}`);

        fireEvent.click(cancelBtn);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not attempt to delete if faqToDelete is null', async () => {
        renderModal({ faqToDelete: null });

        const deleteBtn = screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.DELETE}`);
        fireEvent.click(deleteBtn);

        expect(mockFaqApi.delete).not.toHaveBeenCalled();
        expect(deleteBtn).not.toBeDisabled();
    });

    it('clears previous error when retrying delete', async () => {
        mockFaqApi.delete.mockRejectedValueOnce(new Error('Fail'));
        renderModal();

        const deleteBtn = screen.getByTestId(`btn-${COMMON_TEXT_ADMIN.BUTTON.DELETE}`);
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(screen.getByText(FAQ_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_FAQ)).toBeInTheDocument();
        });

        mockFaqApi.delete.mockResolvedValueOnce(undefined);
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(defaultProps.onDeleteFaq).toHaveBeenCalled();
        });
    });
});
