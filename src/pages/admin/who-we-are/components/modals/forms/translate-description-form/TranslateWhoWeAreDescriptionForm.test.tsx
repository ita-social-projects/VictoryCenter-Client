import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    TranslateWhoWeAreDescriptionForm,
    TranslateWhoWeAreDescriptionFormRef,
} from './TranslateWhoWeAreDescriptionForm';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ id, value, onChange, onBlur, onFocus, disabled, error }: any) => (
        <div>
            <textarea
                data-testid={`rich-text-${id}`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                disabled={disabled}
            />
            {error && <span data-testid={`error-${id}`}>{error}</span>}
        </div>
    ),
}));

jest.mock('@/validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

const { WHO_WE_ARE_VALIDATION_FUNCTIONS } = jest.requireMock('@/validation/admin/who-we-are-schema/WhoWeAreSchema') as {
    WHO_WE_ARE_VALIDATION_FUNCTIONS: { validateText: jest.Mock };
};

const validationMock = WHO_WE_ARE_VALIDATION_FUNCTIONS;

describe('TranslateWhoWeAreDescriptionForm', () => {
    const renderForm = (props: Partial<React.ComponentProps<typeof TranslateWhoWeAreDescriptionForm>> = {}) => {
        const ref = createRef<TranslateWhoWeAreDescriptionFormRef>();
        const defaultProps: React.ComponentProps<typeof TranslateWhoWeAreDescriptionForm> = {
            onSubmit: jest.fn(),
            limits: { descriptionLimit: 500 },
        };

        render(<TranslateWhoWeAreDescriptionForm ref={ref} {...defaultProps} {...props} />);

        return {
            ref,
            onSubmit: props.onSubmit ?? defaultProps.onSubmit,
        };
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the description field', () => {
        renderForm();

        expect(screen.getByTestId('rich-text-description')).toBeInTheDocument();
    });

    it('fills the description from initialData', () => {
        renderForm({
            initialData: {
                description: '<p>Existing description</p>',
            },
        });

        expect(screen.getByTestId('rich-text-description')).toHaveValue('<p>Existing description</p>');
    });

    it('updates the description value and marks form as dirty', async () => {
        const onDirtyChange = jest.fn();
        renderForm({ onDirtyChange });

        fireEvent.change(screen.getByTestId('rich-text-description'), {
            target: { value: '<p>Updated description</p>' },
        });

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenCalledWith(true);
        });
    });

    it('shows validation error on blur', async () => {
        jest.useFakeTimers();
        validationMock.validateText.mockReturnValue('Required');

        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        const descriptionField = screen.getByTestId('rich-text-description');
        fireEvent.blur(descriptionField);

        await waitFor(() => {
            expect(screen.getByTestId('error-description')).toHaveTextContent('Required');
        });

        jest.useRealTimers();
    });

    it('validates on focus when form is ready', async () => {
        jest.useFakeTimers();
        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        fireEvent.focus(screen.getByTestId('rich-text-description'));

        await waitFor(() => {
            expect(validationMock.validateText).toHaveBeenCalled();
        });

        jest.useRealTimers();
    });

    it('validates on change when form is ready', async () => {
        jest.useFakeTimers();
        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        fireEvent.change(screen.getByTestId('rich-text-description'), {
            target: { value: '<p>Ready change</p>' },
        });

        await waitFor(() => {
            expect(validationMock.validateText).toHaveBeenCalledWith('Ready change');
        });

        jest.useRealTimers();
    });

    it('uses empty description fallback on blur when description is undefined', async () => {
        jest.useFakeTimers();
        renderForm({
            initialData: { description: undefined as unknown as string },
        });

        act(() => {
            jest.runAllTimers();
        });

        fireEvent.blur(screen.getByTestId('rich-text-description'));

        await waitFor(() => {
            expect(validationMock.validateText).toHaveBeenCalledWith('');
        });

        jest.useRealTimers();
    });

    it('disables description input when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(screen.getByTestId('rich-text-description')).toBeDisabled();
    });

    it('submits form data via ref', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByTestId('rich-text-description'), {
            target: { value: '<p>Valid description</p>' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ description: '<p>Valid description</p>' });
    });

    it('handles focus/change/blur sequence before explicit timer flush', () => {
        jest.useFakeTimers();
        renderForm();

        const descriptionField = screen.getByTestId('rich-text-description');

        fireEvent.focus(descriptionField);
        fireEvent.change(descriptionField, { target: { value: '<p>Updated too early</p>' } });
        fireEvent.blur(descriptionField);

        expect(screen.getByTestId('rich-text-description')).toHaveValue('<p>Updated too early</p>');
        jest.useRealTimers();
    });

    it('submits with empty string when description is undefined in initial data', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: { description: '' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ description: '' });
    });
});
