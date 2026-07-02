import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { MetricEditActions } from './MetricEditActions';

jest.mock('@/components/admin/button/Button', () => ({
    __esModule: true,
    Button: ({ children, disabled, onClick }: any) => (
        <button type="button" disabled={disabled} onClick={onClick}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onClose, onConfirm, onCancel, title }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="mock-modal">
                <p>{title}</p>
                <button onClick={onClose}>Close</button>
                <button onClick={onConfirm}>Yes</button>
                <button onClick={onCancel}>No</button>
            </div>
        );
    },
}));

describe('MetricEditActions', () => {
    const defaultProps = {
        isFormDirty: false,
        isValid: true,
        onCancel: jest.fn(),
        onSave: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Save Button Logic', () => {
        it('is disabled when form is not dirty', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={false} isValid={true} />);
            const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
            expect(saveButton).toBeDisabled();
        });

        it('is disabled when form is not valid', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={true} isValid={false} />);
            const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
            expect(saveButton).toBeDisabled();
        });

        it('is enabled when form is dirty and valid', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={true} isValid={true} />);
            const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
            expect(saveButton).not.toBeDisabled();
        });

        it('calls onSave when clicked', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={true} isValid={true} />);
            const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });

            fireEvent.click(saveButton);
            expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cancel Button Logic', () => {
        it('calls onCancel immediately if form is NOT dirty', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={false} />);
            const cancelButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL });

            fireEvent.click(cancelButton);

            expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
        });

        it('opens confirmation modal if form IS dirty', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={true} />);
            const cancelButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL });

            fireEvent.click(cancelButton);

            expect(defaultProps.onCancel).not.toHaveBeenCalled();
            expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
            expect(screen.getByText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.CANCEL_MODAL_TITLE)).toBeInTheDocument();
        });
    });

    describe('Confirmation Modal Logic', () => {
        it('calls onCancel and closes modal when "Yes" is clicked', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={true} />);

            fireEvent.click(screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL }));

            fireEvent.click(screen.getByText('Yes'));

            expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
        });

        it('does NOT call onCancel and closes modal when "No" is clicked', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={true} />);

            fireEvent.click(screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL }));

            fireEvent.click(screen.getByText('No'));

            expect(defaultProps.onCancel).not.toHaveBeenCalled();
            expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
        });

        it('does NOT call onCancel and closes modal when dismissed', () => {
            render(<MetricEditActions {...defaultProps} isFormDirty={true} />);

            fireEvent.click(screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL }));
            fireEvent.click(screen.getByText('Close'));

            expect(defaultProps.onCancel).not.toHaveBeenCalled();
            expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
        });
    });
});
