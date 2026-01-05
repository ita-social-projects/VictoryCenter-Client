import { render, screen, fireEvent } from '@testing-library/react';
import { DonateInput } from './DonateInput';
import { DONATE_TEXT } from '@/const/admin/donate';

describe('DonateInput component', () => {
    test('renders with label and placeholder', () => {
        render(<DonateInput label="Name" name="name" placeholder="Enter name" />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });

    test('renders with default placeholder if none provided', () => {
        render(<DonateInput label="Name" name="name" />);
        expect(screen.getByPlaceholderText(DONATE_TEXT.PLACEHOLDER.DEFAULT)).toBeInTheDocument();
    });

    test('renders required asterisk when isRequired', () => {
        render(<DonateInput label="Name" name="name" isRequired />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('updates value on change', () => {
        const handleChange = jest.fn();
        render(<DonateInput label="Name" name="name" onValueChange={handleChange} />);
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'Test' } });
        expect(textarea).toHaveValue('Test');
        expect(handleChange).toHaveBeenCalled();
    });

    test('onlyNumbers mode filters non-numeric input', () => {
        render(<DonateInput label="Number" name="number" onlyNumbers />);
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'abc123' } });
        expect(textarea).toHaveValue('123');
    });

    test('shows clear button when focused and has value', () => {
        render(<DonateInput label="Name" name="name" />);
        const textarea = screen.getByRole('textbox');
        fireEvent.focus(textarea);
        fireEvent.change(textarea, { target: { value: 'Hello' } });
        const clearButton = screen.getByRole('button');
        expect(clearButton).toBeInTheDocument();
        fireEvent.click(clearButton);
        expect(textarea).toHaveValue('');
    });

    test('respects external value prop', () => {
        render(<DonateInput label="Name" name="name" value="External" />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('External');
    });

    test('textarea is read-only if editable is false', () => {
        render(<DonateInput label="Name" name="name" editable={false} />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('readOnly');
    });

    test('shows warning and blocks input when maxLength is exceeded (standard mode)', () => {
        const warningText = 'Max limit reached';
        render(<DonateInput name="test" maxLength={5} maxLimitWarning={warningText} />);
        const textarea = screen.getByRole('textbox');

        fireEvent.change(textarea, { target: { value: '12345' } });
        expect(textarea).toHaveValue('12345');
        expect(screen.queryByText(warningText)).not.toBeInTheDocument();

        fireEvent.change(textarea, { target: { value: '123456' } });

        expect(textarea).toHaveValue('12345');
        expect(screen.getByText(warningText)).toBeInTheDocument();
    });

    test('allows input with spaces exceeding maxLength visual count but respecting valid char count when ignoreSpacesInCount is true', () => {
        const warningText = 'Limit exceeded';
        render(<DonateInput name="test" maxLength={3} ignoreSpacesInCount maxLimitWarning={warningText} />);
        const textarea = screen.getByRole('textbox');

        fireEvent.change(textarea, { target: { value: 'A B C' } });
        expect(textarea).toHaveValue('A B C');
        expect(screen.queryByText(warningText)).not.toBeInTheDocument();

        fireEvent.change(textarea, { target: { value: 'A B C D' } });

        expect(textarea).toHaveValue('A B C');
        expect(screen.getByText(warningText)).toBeInTheDocument();
    });

    test('truncates pasted content correctly respecting ignoreSpacesInCount logic', () => {
        const warningText = 'Limit exceeded';
        render(<DonateInput name="test" maxLength={3} ignoreSpacesInCount maxLimitWarning={warningText} />);
        const textarea = screen.getByRole('textbox');

        fireEvent.change(textarea, { target: { value: '1 2 3 4 5' } });

        expect(textarea).toHaveValue('1 2 3');
        expect(screen.getByText(warningText)).toBeInTheDocument();
    });

    test('clear button has error class when local limit warning is active', () => {
        render(<DonateInput name="test" maxLength={2} maxLimitWarning="Err" />);
        const textarea = screen.getByRole('textbox');

        fireEvent.focus(textarea);

        fireEvent.change(textarea, { target: { value: '123' } });

        const clearButton = screen.getByRole('button', { name: /clear input/i });
        expect(clearButton).toBeInTheDocument();
        expect(clearButton).toHaveClass('error');
    });

    test('removes warning when input becomes valid again', () => {
        const warningText = 'Limit reached';
        render(<DonateInput name="test" maxLength={5} maxLimitWarning={warningText} />);
        const textarea = screen.getByRole('textbox');

        fireEvent.change(textarea, { target: { value: '123456' } });
        expect(screen.getByText(warningText)).toBeInTheDocument();

        fireEvent.change(textarea, { target: { value: '1234' } });
        expect(screen.queryByText(warningText)).not.toBeInTheDocument();
    });
});
