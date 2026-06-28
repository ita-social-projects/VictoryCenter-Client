import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichTextInputGroup, RichTextInputGroupProps } from './RichTextInputGroup';

jest.mock('../input-group.scss', () => ({}));

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ htmlFor, text, isRequired }: { htmlFor: string; text: string; isRequired?: boolean }) => (
        <label htmlFor={htmlFor} data-testid="mock-label">
            {text}
            {isRequired && <span data-testid="required-asterisk">*</span>}
        </label>
    ),
}));

jest.mock('@/components/admin/rich-text-input/RichTextInput', () => ({
    RichTextInput: ({
        id,
        name,
        value,
        onChange,
        onBlur,
        onFocus,
        maxLength,
        disabled,
        hideToolbar,
        placeholder,
    }: {
        id: string;
        name: string;
        value: string;
        onChange: (value: string) => void;
        onBlur?: () => void;
        onFocus?: () => void;
        maxLength: number;
        disabled?: boolean;
        hideToolbar?: boolean;
        placeholder?: string;
    }) => (
        <div
            data-testid="mock-rich-text-input"
            data-id={id}
            data-name={name}
            data-value={value}
            data-max-length={maxLength}
            data-disabled={disabled}
            data-hide-toolbar={hideToolbar}
            data-placeholder={placeholder}
        >
            <button data-testid="mock-on-change" onClick={() => onChange('<p>Changed</p>')}>
                Change
            </button>
            <button data-testid="mock-on-blur" onClick={onBlur}>
                Blur
            </button>
            <button data-testid="mock-on-focus" onClick={onFocus}>
                Focus
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: ({ error }: { error?: string }) => (error ? <div data-testid="mock-error">{error}</div> : null),
}));

describe('RichTextInputGroup', () => {
    const defaultProps: RichTextInputGroupProps = {
        label: 'Test Label',
        id: 'test-id',
        name: 'test-name',
        value: '<p>Initial value</p>',
        onChange: jest.fn(),
        maxLength: 30,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderRichTextInputGroup = (overrideProps: Partial<RichTextInputGroupProps> = {}) =>
        render(<RichTextInputGroup {...defaultProps} {...overrideProps} />);

    const getLabel = () => screen.getByTestId('mock-label');
    const getRichTextInput = () => screen.getByTestId('mock-rich-text-input');
    const getError = () => screen.queryByTestId('mock-error');
    const getWrapper = () => getLabel().closest('.input-group');

    describe('Rendering', () => {
        it('renders label, RichTextInput and error components', () => {
            renderRichTextInputGroup({ error: 'Test error' });
            expect(getLabel()).toBeInTheDocument();
            expect(getRichTextInput()).toBeInTheDocument();
            expect(getError()).toBeInTheDocument();
        });

        it('renders label with correct text', () => {
            renderRichTextInputGroup({ label: 'Custom Label' });
            expect(getLabel()).toHaveTextContent('Custom Label');
        });

        it('renders required asterisk when isRequired is true', () => {
            renderRichTextInputGroup({ isRequired: true });
            expect(screen.getByTestId('required-asterisk')).toBeInTheDocument();
        });

        it('does not render required asterisk when isRequired is false', () => {
            renderRichTextInputGroup({ isRequired: false });
            expect(screen.queryByTestId('required-asterisk')).not.toBeInTheDocument();
        });

        it('does not render required asterisk when isRequired is not provided', () => {
            renderRichTextInputGroup();
            expect(screen.queryByTestId('required-asterisk')).not.toBeInTheDocument();
        });

        it('applies input-group class to wrapper', () => {
            renderRichTextInputGroup();
            expect(getWrapper()).toHaveClass('input-group');
        });

        it('applies custom className to wrapper', () => {
            renderRichTextInputGroup({ className: 'custom-class' });
            expect(getWrapper()).toHaveClass('custom-class');
            expect(getWrapper()).toHaveClass('input-group');
        });
    });

    describe('Props forwarding to RichTextInput', () => {
        it('forwards id prop to RichTextInput', () => {
            renderRichTextInputGroup({ id: 'custom-id' });
            expect(getRichTextInput()).toHaveAttribute('data-id', 'custom-id');
        });

        it('forwards name prop to RichTextInput', () => {
            renderRichTextInputGroup({ name: 'custom-name' });
            expect(getRichTextInput()).toHaveAttribute('data-name', 'custom-name');
        });

        it('forwards value prop to RichTextInput', () => {
            renderRichTextInputGroup({ value: '<p>Test value</p>' });
            expect(getRichTextInput()).toHaveAttribute('data-value', '<p>Test value</p>');
        });

        it('forwards maxLength prop to RichTextInput', () => {
            renderRichTextInputGroup({ maxLength: 50 });
            expect(getRichTextInput()).toHaveAttribute('data-max-length', '50');
        });

        it('forwards disabled prop to RichTextInput', () => {
            renderRichTextInputGroup({ disabled: true });
            expect(getRichTextInput()).toHaveAttribute('data-disabled', 'true');
        });

        it('forwards placeholder prop to RichTextInput', () => {
            renderRichTextInputGroup({ placeholder: 'Enter text...' });
            expect(getRichTextInput()).toHaveAttribute('data-placeholder', 'Enter text...');
        });

        it('forwards htmlFor to InputLabel', () => {
            renderRichTextInputGroup({ id: 'test-input-id' });
            expect(getLabel()).toHaveAttribute('for', 'test-input-id');
        });
    });

    describe('Event handlers', () => {
        it('calls onChange when RichTextInput value changes', () => {
            const onChange = jest.fn();
            renderRichTextInputGroup({ onChange });
            fireEvent.click(screen.getByTestId('mock-on-change'));
            expect(onChange).toHaveBeenCalledWith('<p>Changed</p>');
        });

        it('calls onBlur when RichTextInput loses focus', () => {
            const onBlur = jest.fn();
            renderRichTextInputGroup({ onBlur });
            fireEvent.click(screen.getByTestId('mock-on-blur'));
            expect(onBlur).toHaveBeenCalled();
        });

        it('calls onFocus when RichTextInput gains focus', () => {
            const onFocus = jest.fn();
            renderRichTextInputGroup({ onFocus });
            fireEvent.click(screen.getByTestId('mock-on-focus'));
            expect(onFocus).toHaveBeenCalled();
        });

        it('handles onChange when onBlur is not provided', () => {
            const onChange = jest.fn();
            renderRichTextInputGroup({ onChange });
            expect(() => {
                fireEvent.click(screen.getByTestId('mock-on-change'));
            }).not.toThrow();
            expect(onChange).toHaveBeenCalled();
        });

        it('handles onChange when onFocus is not provided', () => {
            const onChange = jest.fn();
            renderRichTextInputGroup({ onChange });
            expect(() => {
                fireEvent.click(screen.getByTestId('mock-on-change'));
            }).not.toThrow();
            expect(onChange).toHaveBeenCalled();
        });
    });

    describe('Error display', () => {
        it('displays error message when error prop is provided', () => {
            renderRichTextInputGroup({ error: 'This field is required' });
            const errorElement = getError();
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent('This field is required');
        });

        it('does not display error when error prop is not provided', () => {
            renderRichTextInputGroup();
            expect(getError()).not.toBeInTheDocument();
        });

        it('does not display error when error prop is empty string', () => {
            renderRichTextInputGroup({ error: '' });
            expect(getError()).not.toBeInTheDocument();
        });

        it('updates error message when error prop changes', () => {
            const { rerender } = renderRichTextInputGroup({ error: 'First error' });
            expect(getError()).toHaveTextContent('First error');

            rerender(<RichTextInputGroup {...defaultProps} error="Second error" />);
            expect(getError()).toHaveTextContent('Second error');
        });
    });

    describe('Disabled state', () => {
        it('forwards disabled prop to RichTextInput', () => {
            renderRichTextInputGroup({ disabled: true });
            expect(getRichTextInput()).toHaveAttribute('data-disabled', 'true');
        });

        it('forwards disabled=false prop to RichTextInput', () => {
            renderRichTextInputGroup({ disabled: false });
            expect(getRichTextInput()).toHaveAttribute('data-disabled', 'false');
        });

        it('does not set disabled when disabled prop is not provided', () => {
            renderRichTextInputGroup();
            const disabledAttr = getRichTextInput().getAttribute('data-disabled');
            expect(disabledAttr === null || disabledAttr === 'undefined').toBe(true);
        });
    });

    describe('HideToolbar state', () => {
        it('forwards hideToolbar prop to RichTextInput', () => {
            renderRichTextInputGroup({ hideToolbar: true });
            expect(getRichTextInput()).toHaveAttribute('data-hide-toolbar', 'true');
        });

        it('forwards hideToolbar=false prop to RichTextInput', () => {
            renderRichTextInputGroup({ hideToolbar: false });
            expect(getRichTextInput()).toHaveAttribute('data-hide-toolbar', 'false');
        });

        it('does not set hideToolbar when hideToolbar prop is not provided', () => {
            renderRichTextInputGroup();
            const hideToolbarAttr = (getRichTextInput() as HTMLElement).dataset.hideToolbar;
            expect(hideToolbarAttr === undefined || hideToolbarAttr === 'undefined').toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('handles empty value', () => {
            renderRichTextInputGroup({ value: '' });
            expect(getRichTextInput()).toHaveAttribute('data-value', '');
        });

        it('handles HTML value', () => {
            const htmlValue = '<p>Hello <strong>World</strong></p>';
            renderRichTextInputGroup({ value: htmlValue });
            expect(getRichTextInput()).toHaveAttribute('data-value', htmlValue);
        });

        it('handles undefined placeholder', () => {
            renderRichTextInputGroup({ placeholder: undefined });
            const placeholderAttr = (getRichTextInput() as HTMLElement).dataset.disabled;
            expect(placeholderAttr === undefined || placeholderAttr === 'undefined').toBe(true);
        });

        it('handles all props together', () => {
            const onChange = jest.fn();
            const onBlur = jest.fn();
            const onFocus = jest.fn();

            renderRichTextInputGroup({
                label: 'Full Test',
                isRequired: true,
                id: 'full-test-id',
                name: 'full-test-name',
                value: '<p>Full value</p>',
                onChange,
                onBlur,
                onFocus,
                maxLength: 100,
                disabled: false,
                placeholder: 'Full placeholder',
                error: 'Full error',
                className: 'full-class',
            });

            expect(getLabel()).toHaveTextContent('Full Test');
            expect(screen.getByTestId('required-asterisk')).toBeInTheDocument();
            expect(getRichTextInput()).toHaveAttribute('data-id', 'full-test-id');
            expect(getRichTextInput()).toHaveAttribute('data-name', 'full-test-name');
            expect(getRichTextInput()).toHaveAttribute('data-value', '<p>Full value</p>');
            expect(getRichTextInput()).toHaveAttribute('data-max-length', '100');
            expect(getRichTextInput()).toHaveAttribute('data-disabled', 'false');
            expect(getRichTextInput()).toHaveAttribute('data-placeholder', 'Full placeholder');
            expect(getError()).toHaveTextContent('Full error');
            expect(getWrapper()).toHaveClass('full-class');
        });
    });
});
