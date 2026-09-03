import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventModal } from './EventModal';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EVENTS_TEXT } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { executeCancelCofirmationFlow, executeConfirmCloseFlow } from '@/utils/test-mocks/events-modals-mocks';

jest.mock('@/components/common/modal/Modal', () => ({
    Modal: require('@/utils/test-mocks/events-modals-mocks').MockModal,
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, error, name, id, label }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input name={name} id={id} value={value} onChange={onChange} />
            {error && <span data-testid="name-error">{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: require('@/utils/test-mocks/events-modals-mocks').MockButton,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: require('@/utils/test-mocks/events-modals-mocks').MockConfirmationModal,
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, error, name, id, label }: any) => (
            <div>
                <label htmlFor={id}>{label}</label>
                <textarea name={name} id={id} value={value} onChange={onChange} />
                {error && <span data-testid="description-error">{error}</span>}
            </div>
        ),
    }),
);

const currentCategory: EventCategoryDto | null = {
    id: 1,
    name: 'Category 1',
    relatedEventNewsCount: 0,
};

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentCategory,
};

describe('EventModal', () => {
    describe('elements rendering', () => {
        it('renders modal title', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent(EVENTS_TEXT.FORM.MODAL_TITLE);
        });

        it('renders link section title', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(EVENTS_TEXT.FORM.LINKS_SECTION_TITLE)).toBeInTheDocument();
        });

        it('renders all input fields', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.DESCRIPTION })).toBeInTheDocument();
            expect(
                screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION }),
            ).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_UKR })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_ENG })).toBeInTheDocument();
        });

        it('renders category chip when currentCategory is provided', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(currentCategory.name)).toBeInTheDocument();
        });

        it('does not render category chip when currentCategory is null', () => {
            render(<EventModal {...defaultProps} currentCategory={null} />);

            expect(screen.queryByText(currentCategory.name)).not.toBeInTheDocument();
        });

        it('renders modal buttons in disable state initially', () => {
            render(<EventModal {...defaultProps} />);

            const saveAsDraftButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT });
            const saveAsPublishedButton = screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
            });

            expect(saveAsDraftButton).toBeInTheDocument();
            expect(saveAsPublishedButton).toBeInTheDocument();

            expect(saveAsDraftButton).toBeDisabled();
            expect(saveAsPublishedButton).toBeDisabled();
        });
    });

    describe('close behavior', () => {
        it('calls onClose immediately when form is not dirty', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('shows confirmation modal when form has unsaved changes', () => {
            render(<EventModal {...defaultProps} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        it('does not close the modal when confirmation is cancelled', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            executeCancelCofirmationFlow(onClose);
        });

        it('closes the modal when unsaved changes are confirmed', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            executeConfirmCloseFlow(onClose);
        });
    });

    describe('modal opening', () => {
        it('resets form when modal is opened', () => {
            const { rerender } = render(<EventModal {...defaultProps} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            expect(titleInput).toHaveValue('New Event');

            rerender(<EventModal {...defaultProps} isOpen={false} />);

            rerender(<EventModal {...defaultProps} />);

            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.DESCRIPTION })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION })).toHaveValue(
                '',
            );
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_UKR })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_ENG })).toHaveValue('');
        });
    });
});
