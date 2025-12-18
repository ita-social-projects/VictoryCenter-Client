import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CommonMemberFields, CommonFields, CommonErrors } from './CommonMemberFields';
import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({ value, onChange, onBlur, disabled, id }: any) => (
        <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
    ),
}));

jest.mock('@/components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: ({ value, onChange, onBlur, disabled, id }: any) => (
        <textarea data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
    ),
}));

describe('CommonMemberFields', () => {
    const defaultFormState: CommonFields = {
        fullName: '',
        description: '',
    };

    const defaultErrors: CommonErrors = {};

    const renderComponent = (overrides?: Partial<React.ComponentProps<typeof CommonMemberFields>>) => {
        const props = {
            formState: defaultFormState,
            errors: defaultErrors,
            isSubmitting: false,
            formDisabled: false,
            handleFullNameChange: jest.fn(),
            handleFullNameBlur: jest.fn(),
            handleDescriptionChange: jest.fn(),
            handleDescriptionBlur: jest.fn(),
            ...overrides,
        };

        render(<CommonMemberFields {...props} />);
        return props;
    };

    it('renders full name and description fields with labels', () => {
        renderComponent();

        expect(screen.getByText(TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME)).toBeInTheDocument();

        expect(screen.getByText(TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION)).toBeInTheDocument();

        expect(screen.getByTestId('fullName')).toBeInTheDocument();
        expect(screen.getByTestId('description')).toBeInTheDocument();
    });

    it('passes values from formState to inputs', () => {
        renderComponent({
            formState: {
                fullName: 'John Doe',
                description: 'Some description',
            },
        });

        expect(screen.getByTestId('fullName')).toHaveValue('John Doe');
        expect(screen.getByTestId('description')).toHaveValue('Some description');
    });

    it('calls change and blur handlers for full name', () => {
        const view = renderComponent();

        const input = screen.getByTestId('fullName');

        fireEvent.change(input, { target: { value: 'Jane' } });
        fireEvent.blur(input);

        expect(view.handleFullNameChange).toHaveBeenCalled();
        expect(view.handleFullNameBlur).toHaveBeenCalled();
    });

    it('calls change and blur handlers for description', () => {
        const view = renderComponent();

        const textarea = screen.getByTestId('description');

        fireEvent.change(textarea, { target: { value: 'Text' } });
        fireEvent.blur(textarea);

        expect(view.handleDescriptionChange).toHaveBeenCalled();
        expect(view.handleDescriptionBlur).toHaveBeenCalled();
    });

    it('disables inputs when submitting', () => {
        renderComponent({
            isSubmitting: true,
        });

        expect(screen.getByTestId('fullName')).toBeDisabled();
        expect(screen.getByTestId('description')).toBeDisabled();
    });

    it('disables inputs when formDisabled is true', () => {
        renderComponent({
            formDisabled: true,
        });

        expect(screen.getByTestId('fullName')).toBeDisabled();
        expect(screen.getByTestId('description')).toBeDisabled();
    });

    it('shows validation errors when provided', () => {
        renderComponent({
            errors: {
                fullName: 'Invalid full name',
                description: 'Description too short',
            },
        });

        expect(screen.getByText('Invalid full name')).toBeInTheDocument();
        expect(screen.getByText('Description too short')).toBeInTheDocument();
    });
});
