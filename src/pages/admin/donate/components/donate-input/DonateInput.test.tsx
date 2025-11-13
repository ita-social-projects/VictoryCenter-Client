import { render, screen, fireEvent } from '@testing-library/react';
import { DonateInput } from './DonateInput';
import { DONATE_TEXT } from '../../../../../const/admin/donate';

describe('Input component', () => {
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
        render(<DonateInput label="Name" name="name" handleChange={handleChange} />);
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
});
