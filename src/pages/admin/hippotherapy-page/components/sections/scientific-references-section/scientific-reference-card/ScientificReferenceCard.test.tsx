import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ScientificReferenceCard, ScientificReferenceCardProps } from './ScientificReferenceCard';

describe('ScientificReferenceCard', () => {
    let mockOnNameChange: jest.Mock;
    let mockOnUrlChange: jest.Mock;
    let mockOnNameBlur: jest.Mock;
    let mockOnUrlBlur: jest.Mock;
    let mockOnToggleExpand: jest.Mock;
    let mockOnDelete: jest.Mock;

    const defaultProps: ScientificReferenceCardProps = {
        localId: 'ref-1',
        name: 'Test citation',
        url: 'https://example.com/citation',
        isExpanded: false,
        onToggleExpand: jest.fn(),
        onDelete: jest.fn(),
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
        mockOnToggleExpand = jest.fn();
        mockOnDelete = jest.fn();
    });

    const renderComponent = (props: Partial<ScientificReferenceCardProps> = {}) =>
        render(
            <ScientificReferenceCard
                {...defaultProps}
                onToggleExpand={mockOnToggleExpand}
                onDelete={mockOnDelete}
                onNameChange={mockOnNameChange}
                onUrlChange={mockOnUrlChange}
                onNameBlur={mockOnNameBlur}
                onUrlBlur={mockOnUrlBlur}
                {...props}
            />,
        );

    it('shows only the name field when collapsed', () => {
        renderComponent();

        expect(screen.getByDisplayValue('Test citation')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('https://example.com/citation')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Expand reference' })).toBeInTheDocument();
    });

    it('shows the name and url fields when expanded', () => {
        renderComponent({ isExpanded: true });

        expect(screen.getByDisplayValue('Test citation')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com/citation')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Collapse reference' })).toBeInTheDocument();
    });

    it('shows the url error while collapsed', () => {
        renderComponent({ urlError: 'URL is required' });

        expect(screen.getByText('URL is required')).toBeInTheDocument();

        expect(screen.queryByDisplayValue('https://example.com/citation')).not.toBeInTheDocument();
    });

    it('calls onToggleExpand with the localId when the expand button is clicked', () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: 'Expand reference' }));

        expect(mockOnToggleExpand).toHaveBeenCalledWith('ref-1');
    });

    it('calls onNameChange with the localId when the name field is edited', () => {
        renderComponent();

        fireEvent.change(screen.getByDisplayValue('Test citation'), { target: { value: 'Updated citation' } });

        expect(mockOnNameChange).toHaveBeenCalledWith('ref-1', 'Updated citation');
    });

    it('calls onUrlChange with the localId when the url field is edited', () => {
        renderComponent({ isExpanded: true });

        fireEvent.change(screen.getByDisplayValue('https://example.com/citation'), {
            target: { value: 'https://example.com/updated' },
        });

        expect(mockOnUrlChange).toHaveBeenCalledWith('ref-1', 'https://example.com/updated');
    });

    it('calls onNameBlur with the localId', () => {
        renderComponent({ isExpanded: true });

        fireEvent.blur(screen.getByDisplayValue('Test citation'));

        expect(mockOnNameBlur).toHaveBeenCalledWith('ref-1');
    });

    it('calls onUrlBlur with the localId', () => {
        renderComponent({ isExpanded: true });

        fireEvent.blur(screen.getByDisplayValue('https://example.com/citation'));

        expect(mockOnUrlBlur).toHaveBeenCalledWith('ref-1');
    });

    it('shows a name error when provided', () => {
        renderComponent({ nameError: 'Name is required' });

        expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('shows a url error when provided', () => {
        renderComponent({ urlError: 'URL is required', isExpanded: true });

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
        renderComponent({ disabled: true, isExpanded: true });

        expect(screen.getByDisplayValue('Test citation')).toBeDisabled();
        expect(screen.getByDisplayValue('https://example.com/citation')).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Collapse reference' })).toBeDisabled();
        expect(screen.getByLabelText('Delete reference')).toBeDisabled();
    });

    it('collapses consecutive spaces in the name while typing', () => {
        renderComponent();

        fireEvent.change(screen.getByDisplayValue('Test citation'), { target: { value: '  Hello   world ' } });

        expect(mockOnNameChange).toHaveBeenCalledWith('ref-1', 'Hello world ');
    });

    it('calls onDelete with the localId when the delete button is clicked', () => {
        renderComponent();

        fireEvent.click(screen.getByLabelText('Delete reference'));

        expect(mockOnDelete).toHaveBeenCalledWith('ref-1');
    });

    it('does not render the translate button when onTranslateClick is not provided', () => {
        renderComponent();

        expect(
            screen.queryByLabelText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION),
        ).not.toBeInTheDocument();
    });

    it('renders the translate button and calls onTranslateClick when clicked', () => {
        const mockOnTranslateClick = jest.fn();
        renderComponent({ onTranslateClick: mockOnTranslateClick });

        const translateButton = screen.getByLabelText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION);
        expect(translateButton).toBeInTheDocument();
        expect(translateButton).toBeEnabled();

        fireEvent.click(translateButton);
        expect(mockOnTranslateClick).toHaveBeenCalledTimes(1);
    });

    it('disables the translate button when isTranslateDisabled is true', () => {
        const mockOnTranslateClick = jest.fn();
        renderComponent({ onTranslateClick: mockOnTranslateClick, isTranslateDisabled: true });

        const translateButton = screen.getByLabelText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION);
        expect(translateButton).toBeDisabled();

        fireEvent.click(translateButton);
        expect(mockOnTranslateClick).not.toHaveBeenCalled();
    });

    it('disables the translate button when disabled is true', () => {
        const mockOnTranslateClick = jest.fn();
        renderComponent({ onTranslateClick: mockOnTranslateClick, disabled: true });

        const translateButton = screen.getByLabelText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION);
        expect(translateButton).toBeDisabled();
    });
});
