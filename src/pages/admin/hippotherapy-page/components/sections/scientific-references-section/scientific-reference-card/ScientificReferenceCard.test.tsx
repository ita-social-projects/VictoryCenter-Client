import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScientificReferenceCard, ScientificReferenceCardProps } from './ScientificReferenceCard';

describe('ScientificReferenceCard', () => {
    let mockOnNameChange: jest.Mock;
    let mockOnUrlChange: jest.Mock;
    let mockOnNameBlur: jest.Mock;
    let mockOnUrlBlur: jest.Mock;

    const defaultProps: ScientificReferenceCardProps = {
        localId: 'ref-1',
        name: 'Test citation',
        url: 'https://example.com/citation',
        onNameChange: jest.fn(),
        onUrlChange: jest.fn(),
        onNameBlur: jest.fn(),
        onUrlBlur: jest.fn(),
    };

    beforeEach(() => {
        mockOnNameChange = jest.fn();
        mockOnUrlChange = jest.fn();
        mockOnNameBlur = jest.fn();
        mockOnUrlBlur = jest.fn();
    });

    const renderComponent = (props: Partial<ScientificReferenceCardProps> = {}) =>
        render(
            <ScientificReferenceCard
                {...defaultProps}
                onNameChange={mockOnNameChange}
                onUrlChange={mockOnUrlChange}
                onNameBlur={mockOnNameBlur}
                onUrlBlur={mockOnUrlBlur}
                {...props}
            />,
        );

    it('shows the name and url as editable fields, with a static expand placeholder button', () => {
        renderComponent();

        expect(screen.getByDisplayValue('Test citation')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com/citation')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Expand reference' })).toBeInTheDocument();
    });

    it('calls onNameChange with the localId when the name field is edited', () => {
        renderComponent();

        fireEvent.change(screen.getByDisplayValue('Test citation'), { target: { value: 'Updated citation' } });

        expect(mockOnNameChange).toHaveBeenCalledWith('ref-1', 'Updated citation');
    });

    it('calls onUrlChange with the localId when the url field is edited', () => {
        renderComponent();

        fireEvent.change(screen.getByDisplayValue('https://example.com/citation'), {
            target: { value: 'https://example.com/updated' },
        });

        expect(mockOnUrlChange).toHaveBeenCalledWith('ref-1', 'https://example.com/updated');
    });

    it('calls onNameBlur with the localId', () => {
        renderComponent();

        fireEvent.blur(screen.getByDisplayValue('Test citation'));

        expect(mockOnNameBlur).toHaveBeenCalledWith('ref-1');
    });

    it('calls onUrlBlur with the localId', () => {
        renderComponent();

        fireEvent.blur(screen.getByDisplayValue('https://example.com/citation'));

        expect(mockOnUrlBlur).toHaveBeenCalledWith('ref-1');
    });

    it('shows a name error when provided', () => {
        renderComponent({ nameError: 'Name is required' });

        expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('shows a url error when provided', () => {
        renderComponent({ urlError: 'URL is required' });

        expect(screen.getByText('URL is required')).toBeInTheDocument();
    });

    it('does not render the delete button when canDelete is false', () => {
        renderComponent({ canDelete: false });

        expect(screen.queryByLabelText('Delete reference')).not.toBeInTheDocument();
    });

    it('focuses the name field on mount when autoFocus is true', () => {
        renderComponent({ autoFocus: true });

        expect(screen.getByDisplayValue('Test citation')).toHaveFocus();
    });

    it('disables inputs and buttons when disabled is true', () => {
        renderComponent({ disabled: true });

        expect(screen.getByDisplayValue('Test citation')).toBeDisabled();
        expect(screen.getByDisplayValue('https://example.com/citation')).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Expand reference' })).toBeDisabled();
        expect(screen.getByLabelText('Delete reference')).toBeDisabled();
    });
});
