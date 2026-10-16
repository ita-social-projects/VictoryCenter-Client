import { render, screen, fireEvent } from '@testing-library/react';
import React, { useRef } from 'react';
import { TranslateEventForm, TranslateEventFormRef, TranslateEventFormProps } from './TranslateEventForm';
import { EVENTS_TEXT } from '@/const/admin/events';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ label, value, onChange, name, id, disabled }: any) => (
        <div data-testid={`input-group-${name}`}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                data-testid={`input-${name}`}
            />
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ label, value, onChange, name, id, disabled }: any) => (
            <div data-testid={`textarea-group-${name}`}>
                <label htmlFor={id}>{label}</label>
                <textarea
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    data-testid={`textarea-${name}`}
                />
            </div>
        ),
    }),
);

describe('TranslateEventForm', () => {
    const defaultProps: TranslateEventFormProps = {
        onSubmit: jest.fn(),
    };

    const FormWrapper = (props: Partial<TranslateEventFormProps> & { formRef?: React.Ref<TranslateEventFormRef> }) => {
        return <TranslateEventForm {...defaultProps} {...props} ref={props.formRef} />;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all fields with correct labels', () => {
        render(<FormWrapper />);

        expect(screen.getByLabelText(EVENTS_TEXT.FORM.LABEL.TITLE)).toBeInTheDocument();
        expect(screen.getByLabelText(EVENTS_TEXT.FORM.LABEL.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByLabelText(EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION)).toBeInTheDocument();
    });

    it('initializes with empty values by default', () => {
        render(<FormWrapper />);

        expect(screen.getByTestId('input-title')).toHaveValue('');
        expect(screen.getByTestId('textarea-description')).toHaveValue('');
        expect(screen.getByTestId('input-additionalDescription')).toHaveValue('');
    });

    it('initializes with initialData when provided', () => {
        const initialData = {
            title: 'Test Title',
            description: 'Test Description',
            additionalDescription: 'Test Additional',
        };

        render(<FormWrapper initialData={initialData} />);

        expect(screen.getByTestId('input-title')).toHaveValue('Test Title');
        expect(screen.getByTestId('textarea-description')).toHaveValue('Test Description');
        expect(screen.getByTestId('input-additionalDescription')).toHaveValue('Test Additional');
    });

    it('updates input values when typing', () => {
        render(<FormWrapper />);

        const titleInput = screen.getByTestId('input-title');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });

        expect(titleInput).toHaveValue('New Title');
    });

    it('calls onValidationChange when form validity changes', () => {
        const onValidationChange = jest.fn();
        render(<FormWrapper onValidationChange={onValidationChange} />);

        expect(onValidationChange).toHaveBeenCalledWith(false);

        fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Valid Title' } });
        expect(onValidationChange).toHaveBeenCalledWith(false);

        fireEvent.change(screen.getByTestId('textarea-description'), { target: { value: 'Valid Description' } });
        expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it('calls onDirtyChange when form is modified', () => {
        const onDirtyChange = jest.fn();
        render(<FormWrapper onDirtyChange={onDirtyChange} />);

        expect(onDirtyChange).toHaveBeenCalledWith(false);

        fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'New' } });

        expect(onDirtyChange).toHaveBeenCalledWith(true);
    });

    it('does not submit when the form is invalid', () => {
        const onSubmit = jest.fn();
        const ref = React.createRef<TranslateEventFormRef>();

        render(<TranslateEventForm {...defaultProps} onSubmit={onSubmit} ref={ref} />);

        ref.current?.submit();

        expect(onSubmit).not.toHaveBeenCalled();
        expect(ref.current?.isValid()).toBe(false);
    });

    it('submits correctly when the form is valid', () => {
        const onSubmit = jest.fn();
        const ref = React.createRef<TranslateEventFormRef>();

        const initialData = {
            title: 'Valid Title',
            description: 'Valid Description',
            additionalDescription: '',
        };

        render(<TranslateEventForm {...defaultProps} onSubmit={onSubmit} initialData={initialData} ref={ref} />);

        ref.current?.submit();

        expect(onSubmit).toHaveBeenCalledWith(initialData);
        expect(ref.current?.isValid()).toBe(true);
    });
});
