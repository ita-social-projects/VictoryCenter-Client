import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockButton, MockCategoryBar, MockConfirmationModal, MockLocalizationModal, MockSelect } from './test-mocks';

describe('test-mocks utilities', () => {
    it('renders category bar and handles category selection', () => {
        const onCategorySelect = jest.fn();
        const categories = [
            { id: 1, name: 'First' },
            { id: 2, name: 'Second' },
        ];

        render(
            <MockCategoryBar
                categories={categories}
                selectedCategory={categories[0]}
                getCategoryDisplayName={(category: { name: string }) => category.name}
                onCategorySelect={onCategorySelect}
            />,
        );

        expect(screen.getByTestId('tab-1')).toHaveClass('selected');

        fireEvent.click(screen.getByTestId('tab-2'));
        expect(onCategorySelect).toHaveBeenCalledWith(categories[1]);
    });

    it('renders button with default and custom test ids', () => {
        const { rerender } = render(<MockButton>Save</MockButton>);
        expect(screen.getByTestId('button')).toHaveTextContent('Save');

        rerender(<MockButton data-testid="custom-button">Update</MockButton>);
        expect(screen.getByTestId('custom-button')).toHaveTextContent('Update');
    });

    it('renders confirmation modal only when open and handles actions', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        const { rerender } = render(<MockConfirmationModal isOpen={false} onConfirm={onConfirm} onCancel={onCancel} />);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();

        rerender(<MockConfirmationModal isOpen onConfirm={onConfirm} onCancel={onCancel} />);
        fireEvent.click(screen.getByTestId('confirm-close'));
        fireEvent.click(screen.getByTestId('cancel-close'));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('handles localization modal close flow for clean and dirty forms', () => {
        const onClose = jest.fn();
        const onSave = jest.fn();
        const checkIsDirty = jest.fn().mockReturnValue(false);
        const { rerender } = render(
            <MockLocalizationModal
                isOpen
                onClose={onClose}
                onSave={onSave}
                isSubmitting={false}
                isFormValid
                checkIsDirty={checkIsDirty}
                title="Title"
            >
                Content
            </MockLocalizationModal>,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(onClose).toHaveBeenCalledTimes(1);

        checkIsDirty.mockReturnValue(true);
        rerender(
            <MockLocalizationModal
                isOpen
                onClose={onClose}
                onSave={onSave}
                isSubmitting={false}
                isFormValid
                checkIsDirty={checkIsDirty}
                title="Title"
            >
                Content
            </MockLocalizationModal>,
        );

        fireEvent.keyDown(screen.getByTestId('modal'), { key: 'Escape' });
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('cancel-close'));
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('modal'));
        fireEvent.click(screen.getByTestId('confirm-close'));
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('disables save button and parses select values', () => {
        const onValueChange = jest.fn();
        render(
            <>
                <MockLocalizationModal
                    isOpen
                    onClose={jest.fn()}
                    onSave={jest.fn()}
                    isSubmitting
                    isFormValid={false}
                    checkIsDirty={() => false}
                    title="Title"
                >
                    Content
                </MockLocalizationModal>
                <MockSelect onValueChange={onValueChange} data-testid="mock-select">
                    <MockSelect.Option value={{ id: 1 }} name="Object option" />
                    <MockSelect.Option value="plain" name="Plain option" />
                </MockSelect>
            </>,
        );

        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();

        fireEvent.change(screen.getByTestId('mock-select'), {
            target: { value: JSON.stringify({ id: 1 }) },
        });
        fireEvent.change(screen.getByTestId('mock-select'), {
            target: { value: 'plain' },
        });

        expect(onValueChange).toHaveBeenNthCalledWith(1, { id: 1 });
        expect(onValueChange).toHaveBeenNthCalledWith(2, 'plain');
    });
});
