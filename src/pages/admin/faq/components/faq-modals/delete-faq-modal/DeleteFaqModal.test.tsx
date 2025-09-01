import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteFaqModal } from './DeleteFaqModal';

jest.mock('../../../../../../components/common/modal/Modal', () => {
    const Modal = ({ isOpen, children }: any) => (isOpen ? <div data-testid="delete-faq-modal">{children}</div> : null);
    Modal.Title = ({ children }: any) => <div>{children}</div>;
    Modal.Content = ({ children }: any) => <div>{children}</div>;
    Modal.Actions = ({ children }: any) => <div>{children}</div>;
    return { __esModule: true, Modal };
});
jest.mock('../../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));
jest.mock('../../../../../../const/admin/common', () => ({
    COMMON_TEXT_ADMIN: { BUTTON: { CANCEL: 'Cancel', DELETE: 'Delete' } },
}));
jest.mock('../../../../../../const/admin/faq', () => ({
    FAQ_TEXT: {
        FORM: {
            TITLE: { DELETE_FAQ: 'Delete FAQ' },
            MESSAGE: { FAIL_TO_DELETE_FAQ: 'Delete failed' },
        },
    },
}));
jest.mock('../../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));
jest.mock('../../../../../../services/api/admin/faq/faq-api', () => ({
    FaqApi: { delete: jest.fn() },
}));

const mockFaq = { id: 1, questionText: 'Q', answerText: 'A', status: 1, pages: [] };

describe('DeleteFaqModal', () => {
    it('renders modal with title and buttons', () => {
        render(<DeleteFaqModal isOpen={true} onClose={jest.fn()} onDeleteFaq={jest.fn()} faqToDelete={mockFaq} />);
        expect(screen.getByText('Delete FAQ')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked', () => {
        const onClose = jest.fn();
        render(<DeleteFaqModal isOpen={true} onClose={onClose} onDeleteFaq={jest.fn()} faqToDelete={mockFaq} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onDeleteFaq and onClose when delete succeeds', async () => {
        const onDeleteFaq = jest.fn();
        const onClose = jest.fn();
        const { FaqApi } = require('../../../../../../services/api/admin/faq/faq-api');
        FaqApi.delete.mockResolvedValueOnce();
        render(<DeleteFaqModal isOpen={true} onClose={onClose} onDeleteFaq={onDeleteFaq} faqToDelete={mockFaq} />);
        fireEvent.click(screen.getByText('Delete'));
        await waitFor(() => {
            expect(FaqApi.delete).toHaveBeenCalled();
            expect(onDeleteFaq).toHaveBeenCalledWith(mockFaq);
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('shows error when delete fails', async () => {
        const { FaqApi } = require('../../../../../../services/api/admin/faq/faq-api');
        FaqApi.delete.mockRejectedValueOnce(new Error('fail'));
        render(<DeleteFaqModal isOpen={true} onClose={jest.fn()} onDeleteFaq={jest.fn()} faqToDelete={mockFaq} />);
        fireEvent.click(screen.getByText('Delete'));
        await waitFor(() => {
            expect(screen.getByText('Delete failed')).toBeInTheDocument();
        });
    });
});
