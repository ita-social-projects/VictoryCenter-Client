import React, { createRef } from 'react';
import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    TranslateProgramCategoryForm,
    TranslateProgramCategoryFormRef,
    TranslateProgramCategoryFormValues,
} from './TranslateProgramCategoryForm';
import { ProgramCategory } from '@/types/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import { PROGRAM_CATEGORY_VALIDATION_FUNCTIONS } from '@/validation/admin/program-category-schema/program-category-schema';

jest.mock('@/validation/admin/program-category-schema/program-category-schema', () => ({
    PROGRAM_CATEGORY_VALIDATION_FUNCTIONS: {
        validateName: jest.fn(() => undefined),
    },
}));

jest.mock('@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup', () => ({
    SingleSelectInputGroup: ({ options, value, onChange, disabled, getOptionId, getOptionName }: any) => (
        <select
            data-testid="category-select"
            value={value ? String(getOptionId(value)) : ''}
            onChange={(e) => {
                if (!e.target.value) {
                    onChange?.(null);
                    return;
                }
                const selectedOption = options.find((option: any) => String(getOptionId(option)) === e.target.value);
                onChange?.(selectedOption ?? null);
            }}
            disabled={disabled}
        >
            <option value="">Select category</option>
            {options.map((option: any) => (
                <option key={getOptionId(option)} value={String(getOptionId(option))}>
                    {getOptionName(option)}
                </option>
            ))}
        </select>
    ),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, disabled, name, id, error }: any) => (
        <div>
            <input
                data-testid={`input-${name ?? id}`}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
            />
            {error && <span data-testid={`error-${name ?? id}`}>{error}</span>}
        </div>
    ),
}));

const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Category 1', programsCount: 2 },
    { id: 2, name: 'Category 2', programsCount: 1 },
];

const validationMock = PROGRAM_CATEGORY_VALIDATION_FUNCTIONS as jest.Mocked<
    typeof PROGRAM_CATEGORY_VALIDATION_FUNCTIONS
>;

describe('TranslateProgramCategoryForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        validationMock.validateName.mockReturnValue(undefined);
    });

    const renderForm = (props: Partial<React.ComponentProps<typeof TranslateProgramCategoryForm>> = {}) => {
        const ref = createRef<TranslateProgramCategoryFormRef>();
        const defaultProps: React.ComponentProps<typeof TranslateProgramCategoryForm> = {
            onSubmit: jest.fn(),
            categories: mockCategories,
        };

        const view = render(<TranslateProgramCategoryForm ref={ref} {...defaultProps} {...props} />);

        return {
            ref,
            onSubmit: props.onSubmit ?? defaultProps.onSubmit,
            ...view,
        };
    };

    it('renders category and name fields', () => {
        renderForm();

        expect(screen.getByTestId('category-select')).toBeInTheDocument();
        expect(screen.getByTestId('input-name')).toBeInTheDocument();
    });

    it('starts with an unselected category and an empty, disabled name field', () => {
        renderForm();

        expect(screen.getByTestId('category-select')).toHaveValue('');
        expect(screen.getByTestId('input-name')).toHaveValue('');
        expect(screen.getByTestId('input-name')).toBeDisabled();
    });

    it('disables the name field until a category is selected', () => {
        renderForm();

        expect(screen.getByTestId('input-name')).toBeDisabled();

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });

        expect(screen.getByTestId('input-name')).toBeEnabled();
    });

    it('fills the name field from initialData', () => {
        renderForm({ initialData: { categoryId: 1, name: 'Existing translation' } });

        expect(screen.getByTestId('input-name')).toHaveValue('Existing translation');
    });

    it('pre-selects the category when selectedCategory prop is provided', () => {
        renderForm({ selectedCategory: mockCategories[1] });

        expect(screen.getByTestId('category-select')).toHaveValue('2');
        expect(screen.getByTestId('input-name')).toBeEnabled();
    });

    it('calls onCategoryChange with the selected category and null on clear', () => {
        const onCategoryChange = jest.fn();

        renderForm({ onCategoryChange });

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '2' } });
        expect(onCategoryChange).toHaveBeenCalledWith(mockCategories[1]);

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '' } });
        expect(onCategoryChange).toHaveBeenLastCalledWith(null);
    });

    it('updates the name value on change', () => {
        renderForm();

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });
        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Translated name' } });

        expect(screen.getByTestId('input-name')).toHaveValue('Translated name');
    });

    it('validates name on blur', () => {
        renderForm();

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });
        fireEvent.blur(screen.getByTestId('input-name'));

        expect(validationMock.validateName).toHaveBeenCalled();
    });

    it('shows validation errors returned by the validation function', async () => {
        validationMock.validateName.mockReturnValue('Name error');

        renderForm();

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });
        fireEvent.blur(screen.getByTestId('input-name'));

        await waitFor(() => {
            expect(screen.getByTestId('error-name')).toHaveTextContent('Name error');
        });
    });

    it('calls onValidationChange from form manager updates', async () => {
        const onValidationChange = jest.fn();

        renderForm({ onValidationChange });

        await waitFor(() => {
            expect(onValidationChange).toHaveBeenCalledWith(true);
        });
    });

    it('reports dirty state relative to initialData, not merely category selection', async () => {
        const onDirtyChange = jest.fn();
        const initialData: TranslateProgramCategoryFormValues = { categoryId: 1, name: '' };

        renderForm({ initialData, selectedCategory: mockCategories[0], onDirtyChange });

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenCalledWith(false);
        });

        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Changed name' } });

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenLastCalledWith(true);
        });
    });

    it('submits data via ref.submit and forwards only form data to onSubmit', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });
        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Final name' } });

        await ref.current?.submit(VisibilityStatus.Draft);

        expect(onSubmit).toHaveBeenCalledWith({
            categoryId: 1,
            name: 'Final name',
        });
    });

    it('exposes isValid and isDirty through ref', () => {
        const { ref } = renderForm();

        expect(ref.current?.isValid()).toBe(true);
        expect(ref.current?.isDirty()).toBe(false);
    });

    it('disables category selector when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(screen.getByTestId('category-select')).toBeDisabled();
    });

    it('prevents default form submission behavior', () => {
        const { container } = renderForm();
        const form = container.querySelector('#translate-program-category-form') as HTMLFormElement;

        const event = createEvent.submit(form);
        event.preventDefault = jest.fn();

        fireEvent(form, event);

        expect(event.preventDefault).toHaveBeenCalled();
    });
});
