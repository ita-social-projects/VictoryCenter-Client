// SingleSelectInput.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SingleSelectInput } from './SingleSelectInput';

jest.mock('@assets/icons/chevron-down.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="arrow-down-icon" />,
}));

jest.mock('@assets/icons/chevron-up.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="arrow-up-icon" />,
}));

interface Option {
    id: number;
    name: string;
}

const options: Option[] = [
    { id: 1, name: 'Option A' },
    { id: 2, name: 'Option B' },
];

const getOptionId = (opt: Option) => opt.id;
const getOptionName = (opt: Option) => opt.name;

describe('SingleSelectInput', () => {
    const user = userEvent;
    let onChange: jest.Mock;
    let onBlur: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
        onBlur = jest.fn();
    });

    const renderSelect = (props = {}) =>
        render(
            <SingleSelectInput<Option>
                options={options}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder="Select an option"
                {...props}
            />,
        );

    it('executes toggleDropdown while button is disabled (covers line 32)', () => {
        renderSelect({ disabled: true });
        const button = screen.getByRole('button');

        // IMPORTANT: userEvent intentionally doesn't click disabled buttons.
        // Use fireEvent.click to programmatically dispatch a click event so the component's onClick runs,
        // allowing the toggleDropdown function to evaluate `if (!disabled)` (this covers line 32).
        fireEvent.click(button);

        // nothing should open
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders placeholder and applies placeholder class (covers line 64 and placeholder branch of classNames)', () => {
        renderSelect();
        const display = screen.getByText('Select an option');

        // placeholder branch of displayLabel -> should render placeholder text
        expect(display).toBeInTheDocument();

        // the classNames call should produce 'option-value-placeholder' in placeholder case
        expect(display).toHaveClass('option-value-placeholder');
        expect(display).not.toHaveClass('option-value');
    });

    it('renders selected value and applies value class (covers selected branch of classNames)', () => {
        renderSelect({ value: options[0] });
        const display = screen.getByText('Option A');

        // when value exists displayLabel !== placeholder -> should have 'option-value'
        expect(display).toHaveClass('option-value');
        expect(display).not.toHaveClass('option-value-placeholder');
    });

    // Extra modern tests (user interactions) for completeness and remaining branches:
    it('opens and closes via clicks (userEvent) and selects option', async () => {
        renderSelect({ onChange });
        const button = screen.getByRole('button');

        await user.click(button);
        expect(screen.getByRole('listbox')).toBeInTheDocument();

        await user.click(screen.getByText('Option A'));
        expect(onChange).toHaveBeenCalledWith(options[0]);
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('selects via keyboard Enter and Space', async () => {
        renderSelect({ onChange });
        await user.click(screen.getByRole('button'));

        const optA = screen.getByText('Option A');
        optA.focus();
        await user.keyboard('{Enter}');
        expect(onChange).toHaveBeenCalledWith(options[0]);

        // reopen and test Space
        await user.click(screen.getByRole('button'));
        const optB = screen.getByText('Option B');
        optB.focus();
        await user.keyboard(' ');
        expect(onChange).toHaveBeenCalledWith(options[1]);
    });

    it('calls onBlur when clicking outside', async () => {
        renderSelect({ onBlur });
        await user.click(screen.getByRole('button'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();

        await user.click(document.body);
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(onBlur).toHaveBeenCalled();
    });

    it('covers toggleDropdown disabled check (line 32)', () => {
        render(
            <SingleSelectInput<Option>
                options={options}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder="Select an option"
                disabled={true}
            />,
        );
        const button = screen.getByRole('button');

        fireEvent.click(button);

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('covers displayLabel calculation (line 64)', () => {
        const { rerender } = render(
            <SingleSelectInput<Option>
                options={options}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder="Select an option"
            />,
        );

        expect(screen.getByText('Select an option')).toBeInTheDocument();

        rerender(
            <SingleSelectInput<Option>
                options={options}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder="Select an option"
                value={options[0]}
            />,
        );

        expect(screen.getByText('Option A')).toBeInTheDocument();
    });

    it('covers handleKeyDown with other keys (lines 106-111)', async () => {
        const onChange = jest.fn();
        render(
            <SingleSelectInput<Option>
                options={options}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder="Select an option"
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole('button'));
        const option = screen.getByRole('option', { name: 'Option A' });

        fireEvent.keyDown(option, { key: 'Tab' });

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('displays correct arrow icon based on open/closed state', async () => {
        render(
            <SingleSelectInput<Option>
                options={options}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder="Select an option"
                onChange={onChange}
            />,
        );

        expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument();

        await user.click(screen.getByRole('button'));
        expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument();

        await user.click(screen.getByRole('button'));
        expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument();
    });
});
