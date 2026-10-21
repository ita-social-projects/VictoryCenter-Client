import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_TEXT, HippotherapyTranslationFieldConfig } from '@/const/admin/hippotherapy-page';
import { VisibilityStatus } from '@/types/admin/common';
import {
    TranslateHippotherapySectionForm,
    TranslateHippotherapySectionFormRef,
} from './TranslateHippotherapySectionForm';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');

const FIELDS: HippotherapyTranslationFieldConfig[] = [
    { name: 'quoteText', label: 'Опис', maxLength: 300, isRequired: true },
    { name: 'authorName', label: 'Додатковий опис', maxLength: 50, isRequired: false },
];

const MIN_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(HIPPOTHERAPY_PAGE_TEXT.MIN_TEXT_LENGTH);
const VALID_TEXT = 'Valid translated quote';

const quoteInput = () => screen.getByTestId('mock-rich-input-test-quoteText');
const authorInput = () => screen.getByTestId('mock-rich-input-test-authorName');

const renderForm = (props: Partial<React.ComponentProps<typeof TranslateHippotherapySectionForm>> = {}) => {
    const ref = createRef<TranslateHippotherapySectionFormRef>();
    const handlers = {
        onSubmit: jest.fn(),
        onValidationChange: jest.fn(),
        onDirtyChange: jest.fn(),
    };

    render(
        <TranslateHippotherapySectionForm ref={ref} fields={FIELDS} fieldIdPrefix="test" {...handlers} {...props} />,
    );

    return { ref, ...handlers };
};

describe('TranslateHippotherapySectionForm', () => {
    it('renders an empty field with its label and character limit for every configured field', () => {
        renderForm();

        expect(screen.getByLabelText('Опис')).toBe(quoteInput());
        expect(screen.getByLabelText('Додатковий опис')).toBe(authorInput());
        expect(quoteInput()).toHaveValue('');
        expect(authorInput()).toHaveValue('');
        expect(quoteInput()).toHaveAttribute('maxLength', '300');
        expect(authorInput()).toHaveAttribute('maxLength', '50');
    });

    it('starts invalid and not dirty because the required field is empty', () => {
        const { onValidationChange, onDirtyChange } = renderForm();

        expect(onValidationChange).toHaveBeenLastCalledWith(false);
        expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    });

    it('becomes valid and dirty once the required field has valid text', () => {
        const { onValidationChange, onDirtyChange } = renderForm();

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });

        expect(onValidationChange).toHaveBeenLastCalledWith(true);
        expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    });

    it('does not show an error while typing in a field that has not been left yet', () => {
        renderForm();

        fireEvent.change(quoteInput(), { target: { value: 'Short' } });

        expect(screen.queryByText(MIN_ERROR)).not.toBeInTheDocument();
    });

    it('shows the error after the field is left and updates it live afterwards', () => {
        renderForm();

        fireEvent.change(quoteInput(), { target: { value: 'Short' } });
        fireEvent.blur(quoteInput());
        expect(screen.getByText(MIN_ERROR)).toBeInTheDocument();

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });
        expect(screen.queryByText(MIN_ERROR)).not.toBeInTheDocument();
    });

    it('shows the required error when the required field is left empty', () => {
        renderForm();

        fireEvent.blur(quoteInput());

        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it('accepts an empty optional field but validates it once text is entered', () => {
        renderForm();

        fireEvent.blur(authorInput());
        expect(screen.queryByText(MIN_ERROR)).not.toBeInTheDocument();

        fireEvent.change(authorInput(), { target: { value: 'Short' } });
        fireEvent.blur(authorInput());
        expect(screen.getByText(MIN_ERROR)).toBeInTheDocument();
    });

    it('is not dirty when the entered text is cleared again', () => {
        const { ref } = renderForm();

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });
        expect(ref.current?.isDirty()).toBe(true);

        fireEvent.change(quoteInput(), { target: { value: '<p><br></p>' } });
        expect(ref.current?.isDirty()).toBe(false);
    });

    it('fills the fields from initialData', () => {
        renderForm({ initialData: { quoteText: 'Existing quote text', authorName: 'Existing author' } });

        expect(quoteInput()).toHaveValue('Existing quote text');
        expect(authorInput()).toHaveValue('Existing author');
    });

    it('submits the entered values through the ref', async () => {
        const { ref, onSubmit } = renderForm();

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });
        fireEvent.change(authorInput(), { target: { value: 'Valid author name' } });

        await act(async () => {
            await ref.current?.submit(VisibilityStatus.Published);
        });

        expect(onSubmit).toHaveBeenCalledWith(
            { quoteText: VALID_TEXT, authorName: 'Valid author name' },
            VisibilityStatus.Published,
        );
    });

    it('disables every field when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(quoteInput()).toBeDisabled();
        expect(authorInput()).toBeDisabled();
    });

    it('renders a character-limited textarea when field type is textarea', () => {
        const textareaField: HippotherapyTranslationFieldConfig = {
            name: 'name',
            label: 'Назва',
            maxLength: 150,
            minLength: 5,
            isRequired: true,
            type: 'textarea',
        };

        render(
            <TranslateHippotherapySectionForm
                fields={[textareaField]}
                fieldIdPrefix="research-test"
                onSubmit={jest.fn()}
            />,
        );

        const textarea = screen.getByLabelText('Назва', { exact: false });
        expect(textarea.tagName.toLowerCase()).toBe('textarea');
        expect(textarea).toHaveAttribute('maxLength', '150');

        fireEvent.change(textarea, { target: { value: 'Valid citation name' } });
        expect(textarea).toHaveValue('Valid citation name');
    });

    it('renders a character-limited text input when field type is text', () => {
        const textField: HippotherapyTranslationFieldConfig = {
            name: 'title',
            label: 'Заголовок',
            maxLength: 50,
            minLength: 5,
            isRequired: true,
            type: 'text',
        };

        render(
            <TranslateHippotherapySectionForm fields={[textField]} fieldIdPrefix="text-test" onSubmit={jest.fn()} />,
        );

        const input = screen.getByLabelText('Заголовок', { exact: false });
        expect(input.tagName.toLowerCase()).toBe('input');
        expect(input).toHaveAttribute('maxLength', '50');

        fireEvent.change(input, { target: { value: 'Valid title' } });
        expect(input).toHaveValue('Valid title');
    });
});
