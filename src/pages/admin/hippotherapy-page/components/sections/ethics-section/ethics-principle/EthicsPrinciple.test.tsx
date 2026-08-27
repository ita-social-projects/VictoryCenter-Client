import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EthicsPrinciple } from './EthicsPrinciple';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ label, onChange, onBlur, value, id, disabled, error }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => !disabled && onChange(e.target.value)}
                onBlur={() => !disabled && onBlur?.()}
                value={value}
                id={id}
                disabled={disabled}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

describe('EthicsPrinciple', () => {
    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
    });

    it('renders the value', () => {
        render(<EthicsPrinciple value="Principle one" fieldId="principle-0" onChange={onChange} />);

        expect(screen.getByTestId('mock-rich-input-principle-0')).toHaveValue('Principle one');
    });

    it('calls onChange without validating', () => {
        render(<EthicsPrinciple value="Principle one" fieldId="principle-0" onChange={onChange} />);

        fireEvent.change(screen.getByTestId('mock-rich-input-principle-0'), { target: { value: 'x' } });

        expect(onChange).toHaveBeenCalledWith('x');
        expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).not.toBeInTheDocument();
    });

    it('shows an error on blur when the value is empty', () => {
        render(<EthicsPrinciple value="" fieldId="principle-0" onChange={onChange} />);

        fireEvent.blur(screen.getByTestId('mock-rich-input-principle-0'));

        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it('disables the input when disabled is true', () => {
        render(<EthicsPrinciple value="Principle one" fieldId="principle-0" onChange={onChange} disabled />);

        expect(screen.getByTestId('mock-rich-input-principle-0')).toBeDisabled();
    });
});
