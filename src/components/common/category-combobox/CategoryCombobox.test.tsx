import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryCombobox, CategoryComboboxOption } from './CategoryCombobox';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('./CategoryCombobox.scss', () => ({}));
jest.mock('@/components/common/select/Select.scss', () => ({}));

jest.mock('@/assets/icons/chevron-down.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-down-icon" />,
}));

jest.mock('@/assets/icons/chevron-up.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-up-icon" />,
}));

const OPTIONS: CategoryComboboxOption[] = [
    { id: 1, name: 'Program A' },
    { id: 2, name: 'Program B' },
];

describe('CategoryCombobox', () => {
    const renderCombobox = (overrides: Partial<React.ComponentProps<typeof CategoryCombobox>> = {}) =>
        render(
            <CategoryCombobox
                options={OPTIONS}
                inputValue=""
                onInputValueChange={jest.fn()}
                onOptionSelect={jest.fn()}
                placeholder="Оберіть програму"
                {...overrides}
            />,
        );

    it('renders an input with the placeholder', () => {
        renderCombobox();

        expect(screen.getByPlaceholderText('Оберіть програму')).toBeInTheDocument();
    });

    it('opens the dropdown and shows all options on focus', () => {
        const { container } = renderCombobox();
        const input = screen.getByPlaceholderText('Оберіть програму');

        fireEvent.focus(input);

        expect(container.querySelector('.select')).toHaveClass('select-opened');
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Program B')).toBeInTheDocument();
    });

    it('calls onInputValueChange while typing and filters the option list', () => {
        const onInputValueChange = jest.fn();
        const { rerender } = renderCombobox({ onInputValueChange });
        const input = screen.getByPlaceholderText('Оберіть програму');

        fireEvent.change(input, { target: { value: 'B' } });

        expect(onInputValueChange).toHaveBeenCalledWith('B');

        rerender(
            <CategoryCombobox
                options={OPTIONS}
                inputValue="B"
                onInputValueChange={onInputValueChange}
                onOptionSelect={jest.fn()}
                placeholder="Оберіть програму"
            />,
        );

        expect(screen.getByText('Program B')).toBeInTheDocument();
        expect(screen.queryByText('Program A')).not.toBeInTheDocument();
    });

    it('shows the not found message when nothing matches the query', () => {
        renderCombobox({ inputValue: 'XXXXXXXX' });

        const input = screen.getByPlaceholderText('Оберіть програму');
        fireEvent.focus(input);

        expect(screen.getByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND)).toBeInTheDocument();
    });

    it('accepts a custom notFoundMessage', () => {
        renderCombobox({ inputValue: 'XXXXXXXX', notFoundMessage: 'Нічого' });

        fireEvent.focus(screen.getByPlaceholderText('Оберіть програму'));

        expect(screen.getByText('Нічого')).toBeInTheDocument();
    });

    it('does not drop free-typed text that has no matching option', () => {
        renderCombobox({ inputValue: 'XXXXXXXX' });

        expect(screen.getByDisplayValue('XXXXXXXX')).toBeInTheDocument();
    });

    it('calls onOptionSelect and closes the dropdown when an option is clicked', () => {
        const onOptionSelect = jest.fn();
        const { container } = renderCombobox({ onOptionSelect });
        const input = screen.getByPlaceholderText('Оберіть програму');

        fireEvent.focus(input);
        fireEvent.click(screen.getByText('Program B'));

        expect(onOptionSelect).toHaveBeenCalledWith({ id: 2, name: 'Program B' });
        expect(container.querySelector('.select')).toHaveClass('select-closed');
    });

    it('navigates options with ArrowDown/ArrowUp and selects the highlighted one on Enter', () => {
        const onOptionSelect = jest.fn();
        renderCombobox({ onOptionSelect });
        const input = screen.getByPlaceholderText('Оберіть програму');

        fireEvent.focus(input);
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowUp' });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onOptionSelect).toHaveBeenCalledWith({ id: 1, name: 'Program A' });
    });

    it('closes the dropdown on Enter when nothing is highlighted', () => {
        const { container } = renderCombobox({ inputValue: 'XXXXXXXX' });
        const input = screen.getByPlaceholderText('Оберіть програму');

        fireEvent.focus(input);
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(container.querySelector('.select')).toHaveClass('select-closed');
    });

    it('closes the dropdown on Escape', () => {
        const { container } = renderCombobox();
        const input = screen.getByPlaceholderText('Оберіть програму');

        fireEvent.focus(input);
        expect(container.querySelector('.select')).toHaveClass('select-opened');

        fireEvent.keyDown(input, { key: 'Escape' });
        expect(container.querySelector('.select')).toHaveClass('select-closed');
    });

    it('closes the dropdown when clicking outside', () => {
        const { container } = render(
            <div>
                <CategoryCombobox
                    options={OPTIONS}
                    inputValue=""
                    onInputValueChange={jest.fn()}
                    onOptionSelect={jest.fn()}
                    placeholder="Оберіть програму"
                />
                <button type="button">outside</button>
            </div>,
        );
        const input = screen.getByPlaceholderText('Оберіть програму');

        fireEvent.focus(input);
        expect(container.querySelector('.select')).toHaveClass('select-opened');

        fireEvent.mouseDown(screen.getByText('outside'));
        expect(container.querySelector('.select')).toHaveClass('select-closed');
    });

    it('does not open the dropdown when disabled', () => {
        const { container } = renderCombobox({ disabled: true });
        const input = screen.getByPlaceholderText('Оберіть програму');

        expect(input).toBeDisabled();

        fireEvent.click(container.querySelector('.select-head') as HTMLElement);
        expect(container.querySelector('.select')).toHaveClass('select-closed');
        expect(screen.queryByText('Program A')).not.toBeInTheDocument();
    });

    it('forwards the container node through selectContainerRef', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(
            <CategoryCombobox
                options={OPTIONS}
                inputValue=""
                onInputValueChange={jest.fn()}
                onOptionSelect={jest.fn()}
                selectContainerRef={ref}
            />,
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
        expect(ref.current).toHaveClass('select');
    });

    it('associates the head label with the input so clicking anywhere on it focuses the input natively', () => {
        const { container } = renderCombobox();
        const input = screen.getByPlaceholderText('Оберіть програму');
        const label = container.querySelector('.select-head') as HTMLLabelElement;

        expect(label.tagName).toBe('LABEL');
        expect(label).toHaveAttribute('for', input.id);
        expect(input.id).not.toBe('');
    });

    it('uses the explicit id prop for both the input and its label association when provided', () => {
        const { container } = render(
            <CategoryCombobox
                id="add-program-expense-category"
                options={OPTIONS}
                inputValue=""
                onInputValueChange={jest.fn()}
                onOptionSelect={jest.fn()}
                placeholder="Оберіть програму"
            />,
        );
        const input = screen.getByPlaceholderText('Оберіть програму');
        const label = container.querySelector('.select-head') as HTMLLabelElement;

        expect(input).toHaveAttribute('id', 'add-program-expense-category');
        expect(label).toHaveAttribute('for', 'add-program-expense-category');
    });
});
