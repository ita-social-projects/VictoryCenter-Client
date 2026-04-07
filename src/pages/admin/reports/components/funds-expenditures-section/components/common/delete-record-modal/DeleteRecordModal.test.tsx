import { fireEvent, render, screen } from '@testing-library/react';
import { DeleteRecordModal } from './DeleteRecordModal';

describe('DeleteRecordModal', () => {
    it('should render title and default button labels when open', () => {
        render(
            <DeleteRecordModal
                isOpen
                title="Delete record?"
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        expect(screen.getByText('Delete record?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ні' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Так' })).toBeInTheDocument();
    });

    it('should use provided button labels', () => {
        render(
            <DeleteRecordModal
                isOpen
                title="Delete record?"
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('should call onConfirm when confirm button is clicked', () => {
        const onConfirm = jest.fn();

        render(
            <DeleteRecordModal
                isOpen
                title="Delete record?"
                onConfirm={onConfirm}
                onCancel={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Так' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
        const onCancel = jest.fn();

        render(
            <DeleteRecordModal
                isOpen
                title="Delete record?"
                onConfirm={jest.fn()}
                onCancel={onCancel}
                onClose={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Ні' }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable both buttons when isButtonsDisabled is true', () => {
        render(
            <DeleteRecordModal
                isOpen
                title="Delete record?"
                isButtonsDisabled
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: 'Ні' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Так' })).toBeDisabled();
    });

    it('should not render when closed', () => {
        render(
            <DeleteRecordModal
                isOpen={false}
                title="Delete record?"
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        expect(screen.queryByText('Delete record?')).not.toBeInTheDocument();
    });
});
