import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { SupportOptionsForm } from './SupportOptionsForm';
import { DONATE_TEXT } from '../../../../../../const/admin/donate';
import { BankCurrency } from '../../../../../../types/admin/donate';

jest.mock('../support-option-item/SupportOptionItem', () => ({
    ...jest.requireActual('../support-option-item/SupportOptionItem'),

    SupportOptionItem: ({ data, onSave, onDelete, onCancel, onModeChange }: any) => {
        const { SupportOptionItemMode } = jest.requireActual('../support-option-item/SupportOptionItem');

        return (
            <div data-testid={`support-option-${data?.id || 'new'}`}>
                <span>{data?.name || 'New Option'}</span>
                <button onClick={() => onSave?.('Test', '123')}>Save</button>
                {onDelete && <button onClick={onDelete}>Delete</button>}
                {onCancel && <button onClick={onCancel}>Cancel</button>}

                {onModeChange && (
                    <>
                        <button onClick={() => onModeChange(SupportOptionItemMode.Edit)}>Simulate Edit</button>
                        <button onClick={() => onModeChange(SupportOptionItemMode.View)}>Simulate View</button>
                    </>
                )}
            </div>
        );
    },
}));

jest.mock('../../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, className }: any) => (
        <button onClick={onClick} disabled={disabled} data-testid={className}>
            {children}
        </button>
    ),
}));

describe('SupportOptionsForm', () => {
    const mockSupportOptions = [
        { id: 1, name: 'Option 1', value: 'Value 1', currency: BankCurrency.Uah },
        { id: 2, name: 'Option 2', value: 'Value 2', currency: BankCurrency.Uah },
    ];

    const mockOnCreateOption = jest.fn().mockResolvedValue(undefined);
    const mockOnUpdateOption = jest.fn().mockResolvedValue(undefined);
    const mockOnDeleteOption = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with support options', () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.TITLE)).toBeInTheDocument();
    });

    it('shows not found block when no options and not loading', () => {
        render(
            <SupportOptionsForm
                supportOptions={[]}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        expect(screen.getByTestId('support-options-not-found')).toBeInTheDocument();
        expect(screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.NOT_FOUND)).toBeInTheDocument();
    });

    it('does not show not found when loading', () => {
        render(
            <SupportOptionsForm
                supportOptions={[]}
                isLoading={true}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        expect(screen.queryByTestId('support-options-not-found')).not.toBeInTheDocument();
    });

    it('clicking add first button shows new option form', () => {
        render(
            <SupportOptionsForm
                supportOptions={[]}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        fireEvent.click(screen.getByTestId('btn-add'));
        expect(screen.getByTestId('support-option-new')).toBeInTheDocument();
        expect(screen.queryByTestId('support-options-not-found')).not.toBeInTheDocument();
    });

    it('clicking add new button shows new option form', () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        fireEvent.click(screen.getByTestId('btn-add new'));
        expect(screen.getByTestId('support-option-new')).toBeInTheDocument();
    });

    it('calls onCreateOption when saving new option', async () => {
        render(
            <SupportOptionsForm
                supportOptions={[]}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        fireEvent.click(screen.getByTestId('btn-add'));

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockOnCreateOption).toHaveBeenCalledWith('Test', '123');
        });

        await waitFor(() => {
            expect(screen.queryByTestId('support-option-new')).not.toBeInTheDocument();
        });
    });

    it('calls onUpdateOption when saving existing option', async () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        const saveButton = screen.getAllByText('Save')[0];
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockOnUpdateOption).toHaveBeenCalledWith(1, 'Test', '123');
        });
    });

    it('calls onDeleteOption when deleting option', async () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        const deleteButton = screen.getAllByText('Delete')[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockOnDeleteOption).toHaveBeenCalledWith(1);
        });
    });

    it('hides new option form when cancel is clicked', () => {
        render(
            <SupportOptionsForm
                supportOptions={[]}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        fireEvent.click(screen.getByTestId('btn-add'));
        expect(screen.getByTestId('support-option-new')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByTestId('support-option-new')).not.toBeInTheDocument();
    });

    it('disables add new button when loading', () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={true}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        const addButton = screen.getByTestId('btn-add new');
        expect(addButton).toBeDisabled();
    });

    it('hides add new button when adding', () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        fireEvent.click(screen.getByTestId('btn-add new'));
        expect(screen.queryByTestId('btn-add new')).not.toBeInTheDocument();
    });

    it('shows loader when loading with no items', () => {
        render(
            <SupportOptionsForm
                supportOptions={[]}
                isLoading={true}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        expect(screen.queryByTestId('support-options-not-found')).not.toBeInTheDocument();
    });

    it('does not show loader when loading with existing items', () => {
        const mockOptions = [{ id: 1, name: 'Option 1', value: 'Value 1', currency: BankCurrency.Uah }];

        render(
            <SupportOptionsForm
                supportOptions={mockOptions}
                isLoading={true}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        expect(screen.queryByAltText('Завантаження...')).not.toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('does not show loader when not loading', () => {
        render(
            <SupportOptionsForm
                supportOptions={[]}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        expect(screen.queryByAltText('Завантаження...')).not.toBeInTheDocument();
        expect(screen.getByTestId('support-options-not-found')).toBeInTheDocument();
    });

    it('disables add new button when an item is in edit mode', () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        const addButton = screen.getByTestId('btn-add new');
        expect(addButton).not.toBeDisabled();

        const firstItem = screen.getByTestId('support-option-1');

        const simulateEditButton = within(firstItem).getByText('Simulate Edit');
        fireEvent.click(simulateEditButton);

        expect(addButton).toBeDisabled();
    });

    it('re-enables add new button when an item exits edit mode', () => {
        render(
            <SupportOptionsForm
                supportOptions={mockSupportOptions}
                isLoading={false}
                onCreateOption={mockOnCreateOption}
                onUpdateOption={mockOnUpdateOption}
                onDeleteOption={mockOnDeleteOption}
            />,
        );

        const addButton = screen.getByTestId('btn-add new');

        const firstItem = screen.getByTestId('support-option-1');
        const simulateEditButton = within(firstItem).getByText('Simulate Edit');
        const simulateViewButton = within(firstItem).getByText('Simulate View');

        fireEvent.click(simulateEditButton);
        expect(addButton).toBeDisabled();

        fireEvent.click(simulateViewButton);
        expect(addButton).not.toBeDisabled();
    });
});
