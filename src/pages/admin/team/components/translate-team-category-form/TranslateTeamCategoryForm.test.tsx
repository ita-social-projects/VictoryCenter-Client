import React, { createRef } from 'react';
import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    TranslateTeamCategoryForm,
    TranslateTeamCategoryFormRef,
    TranslateTeamCategoryFormValues,
} from './TranslateTeamCategoryForm';
import { TeamCategory } from '@/types/admin/team-category';
import { VisibilityStatus } from '@/types/admin/common';
import { TEAM_CATEGORY_VALIDATION_FUNCTIONS } from '@/validation/admin/team-category-schema/team-category-schema';

jest.mock('@/validation/admin/team-category-schema/team-category-schema', () => ({
    TEAM_CATEGORY_VALIDATION_FUNCTIONS: {
        validateName: jest.fn(() => undefined),
        validateDescription: jest.fn(() => undefined),
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

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, onBlur, disabled, name, id, error }: any) => (
            <div>
                <textarea
                    data-testid={`textarea-${name ?? id}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
                {error && <span data-testid={`error-${name ?? id}`}>{error}</span>}
            </div>
        ),
    }),
);

const mockCategories: TeamCategory[] = [
    {
        id: 1,
        name: 'Category 1',
        description: 'Description 1',
        localizations: [],
        teamMembersCount: 2,
    },
    {
        id: 2,
        name: 'Category 2',
        description: 'Description 2',
        localizations: [],
        teamMembersCount: 1,
    },
];

const validationMock = TEAM_CATEGORY_VALIDATION_FUNCTIONS as jest.Mocked<typeof TEAM_CATEGORY_VALIDATION_FUNCTIONS>;

describe('TranslateTeamCategoryForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        validationMock.validateName.mockReturnValue(undefined);
        validationMock.validateDescription.mockReturnValue(undefined);
    });

    const renderForm = (props: Partial<React.ComponentProps<typeof TranslateTeamCategoryForm>> = {}) => {
        const ref = createRef<TranslateTeamCategoryFormRef>();
        const defaultProps: React.ComponentProps<typeof TranslateTeamCategoryForm> = {
            onSubmit: jest.fn(),
            categories: mockCategories,
        };

        const view = render(<TranslateTeamCategoryForm ref={ref} {...defaultProps} {...props} />);

        return {
            ref,
            onSubmit: props.onSubmit ?? defaultProps.onSubmit,
            ...view,
        };
    };

    it('renders category, name and description fields', () => {
        renderForm();

        expect(screen.getByTestId('category-select')).toBeInTheDocument();
        expect(screen.getByTestId('input-name')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
    });

    it('fills fields from initialData', () => {
        const initialData: TranslateTeamCategoryFormValues = {
            name: 'Existing name',
            description: 'Existing description',
        };

        renderForm({ initialData });

        expect(screen.getByTestId('input-name')).toHaveValue('Existing name');
        expect(screen.getByTestId('textarea-description')).toHaveValue('Existing description');
    });

    it('pre-selects the category when selectedCategory prop is provided', () => {
        renderForm({ selectedCategory: mockCategories[1] });

        expect(screen.getByTestId('category-select')).toHaveValue('2');
        expect(screen.getByTestId('input-name')).toBeEnabled();
        expect(screen.getByTestId('textarea-description')).toBeEnabled();
    });

    it('disables text inputs until category is selected', () => {
        renderForm();

        expect(screen.getByTestId('input-name')).toBeDisabled();
        expect(screen.getByTestId('textarea-description')).toBeDisabled();

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });

        expect(screen.getByTestId('input-name')).toBeEnabled();
        expect(screen.getByTestId('textarea-description')).toBeEnabled();
    });

    it('calls onCategoryChange with selected category and null on clear', () => {
        const onCategoryChange = jest.fn();

        renderForm({ onCategoryChange });

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '2' } });
        expect(onCategoryChange).toHaveBeenCalledWith(mockCategories[1]);

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '' } });
        expect(onCategoryChange).toHaveBeenLastCalledWith(null);
    });

    it('updates name and description values on change', () => {
        renderForm();

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });
        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Translated name' } });
        fireEvent.change(screen.getByTestId('textarea-description'), {
            target: { value: 'Translated description' },
        });

        expect(screen.getByTestId('input-name')).toHaveValue('Translated name');
        expect(screen.getByTestId('textarea-description')).toHaveValue('Translated description');
    });

    it('validates name and description on blur', () => {
        renderForm();

        fireEvent.blur(screen.getByTestId('input-name'));
        fireEvent.blur(screen.getByTestId('textarea-description'));

        expect(validationMock.validateName).toHaveBeenCalled();
        expect(validationMock.validateDescription).toHaveBeenCalled();
    });

    it('shows validation errors returned by validation functions', async () => {
        validationMock.validateName.mockReturnValue('Name error');
        validationMock.validateDescription.mockReturnValue('Description error');

        renderForm();

        fireEvent.blur(screen.getByTestId('input-name'));
        fireEvent.blur(screen.getByTestId('textarea-description'));

        await waitFor(() => {
            expect(screen.getByTestId('error-name')).toHaveTextContent('Name error');
            expect(screen.getByTestId('error-description')).toHaveTextContent('Description error');
        });
    });

    it('calls onValidationChange from form manager updates', async () => {
        const onValidationChange = jest.fn();

        renderForm({ onValidationChange });

        await waitFor(() => {
            expect(onValidationChange).toHaveBeenCalledWith(true);
        });
    });

    it('reports dirty state relative to initialData', async () => {
        const onDirtyChange = jest.fn();
        const initialData: TranslateTeamCategoryFormValues = {
            name: 'Base name',
            description: 'Base description',
        };

        renderForm({ initialData, onDirtyChange });

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
        fireEvent.change(screen.getByTestId('textarea-description'), {
            target: { value: 'Final description' },
        });

        await ref.current?.submit(VisibilityStatus.Draft);

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'Final name',
            description: 'Final description',
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
        const form = container.querySelector('#translate-category-form') as HTMLFormElement;

        const event = createEvent.submit(form);
        event.preventDefault = jest.fn();

        fireEvent(form, event);

        expect(event.preventDefault).toHaveBeenCalled();
    });
});
