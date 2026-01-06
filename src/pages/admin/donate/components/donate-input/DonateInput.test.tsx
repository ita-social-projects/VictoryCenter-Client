import { render, screen, fireEvent } from '@testing-library/react';
import { DonateInput } from './DonateInput';
import { DONATE_TEXT } from '@/const/admin/donate';

const WARNING_MSG = 'Limit exceeded';
const DEFAULT_PROPS = { name: 'test-input', label: 'Test Label' };

const setup = (props = {}) => {
    const utils = render(<DonateInput {...DEFAULT_PROPS} {...props} />);
    const textarea = screen.getByRole('textbox');
    const changeValue = (val: string) => fireEvent.change(textarea, { target: { value: val } });

    return { ...utils, textarea, changeValue };
};

describe('DonateInput component', () => {
    test('renders with label and placeholder', () => {
        setup({ placeholder: 'Enter name' });
        expect(screen.getByText(DEFAULT_PROPS.label)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });

    test('renders with default placeholder if none provided', () => {
        setup();
        expect(screen.getByPlaceholderText(DONATE_TEXT.PLACEHOLDER.DEFAULT)).toBeInTheDocument();
    });

    test('renders required asterisk when isRequired', () => {
        setup({ isRequired: true });
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('updates value on change', () => {
        const handleChange = jest.fn();
        const { textarea, changeValue } = setup({ onValueChange: handleChange });

        changeValue('Test');
        expect(textarea).toHaveValue('Test');
        expect(handleChange).toHaveBeenCalledWith('Test');
    });

    test('onlyNumbers mode filters non-numeric input', () => {
        const { textarea, changeValue } = setup({ onlyNumbers: true });
        changeValue('abc123');
        expect(textarea).toHaveValue('123');
    });

    test('shows clear button when focused and has value', () => {
        const { textarea, changeValue } = setup();

        fireEvent.focus(textarea);
        changeValue('Hello');

        const clearButton = screen.getByRole('button');
        expect(clearButton).toBeInTheDocument();

        fireEvent.click(clearButton);
        expect(textarea).toHaveValue('');
    });

    test('respects external value prop', () => {
        const { textarea } = setup({ value: 'External' });
        expect(textarea).toHaveValue('External');
    });

    test('textarea is read-only if editable is false', () => {
        const { textarea } = setup({ editable: false });
        expect(textarea).toHaveAttribute('readOnly');
    });

    describe('Limit and Warning Logic', () => {
        const testLimitEnforcement = (
            props: any,
            steps: { input: string; expected: string; shouldWarn: boolean }[],
        ) => {
            const { textarea, changeValue } = setup({
                maxLimitWarning: WARNING_MSG,
                ...props,
            });

            steps.forEach(({ input, expected, shouldWarn }) => {
                changeValue(input);
                expect(textarea).toHaveValue(expected);

                if (shouldWarn) {
                    expect(screen.getByText(WARNING_MSG)).toBeInTheDocument();
                } else {
                    expect(screen.queryByText(WARNING_MSG)).not.toBeInTheDocument();
                }
            });
        };

        test('Standard Mode: blocks input when maxLength is exceeded', () => {
            testLimitEnforcement({ maxLength: 5 }, [
                { input: '12345', expected: '12345', shouldWarn: false },
                { input: '123456', expected: '12345', shouldWarn: true },
            ]);
        });

        test('Ignore Spaces Mode: allows spaces but blocks extra valid chars', () => {
            testLimitEnforcement({ maxLength: 3, ignoreSpacesInCount: true }, [
                { input: 'A B C', expected: 'A B C', shouldWarn: false },
                { input: 'A B C D', expected: 'A B C', shouldWarn: true },
            ]);
        });

        test('Smart Truncate: handles paste correctly respecting spaces', () => {
            testLimitEnforcement({ maxLength: 3, ignoreSpacesInCount: true }, [
                { input: '1 2 3 4 5', expected: '1 2 3', shouldWarn: true },
            ]);
        });

        test('Recovery: removes warning when input becomes valid again', () => {
            testLimitEnforcement({ maxLength: 5 }, [
                { input: '123456', expected: '12345', shouldWarn: true },
                { input: '1234', expected: '1234', shouldWarn: false },
            ]);
        });

        test('Visual: clear button has error class when warning is active', () => {
            const { textarea, changeValue } = setup({ maxLength: 2, maxLimitWarning: 'Err' });

            fireEvent.focus(textarea);
            changeValue('123');

            const clearButton = screen.getByRole('button', { name: /clear input/i });
            expect(clearButton).toHaveClass('error');
        });
    });
});
