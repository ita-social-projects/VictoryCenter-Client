import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { createRef } from 'react';
import { TranslateEventCategoryForm, TranslateEventCategoryFormRef } from './TranslateEventCategoryForm';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EVENT_CATEGORY_TEXT, EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup', () => ({
    SingleSelectInputGroup: ({ label, options, onChange, value, placeholder, disabled }: any) => (
        <div>
            <label htmlFor="mock-category-select">{label}</label>
            <select
                id="mock-category-select"
                data-testid="category-select"
                disabled={disabled}
                value={value?.id || ''}
                onChange={(e) => {
                    const selected = options.find((o: any) => String(o.id) === e.target.value) || null;
                    onChange(selected);
                }}
            >
                <option value="">{placeholder}</option>
                {options.map((opt: any) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ label, value, onChange, onBlur, error, disabled, maxLength }: any) => (
        <div>
            <label htmlFor="mock-name-input">{label}</label>
            <input
                id="mock-name-input"
                data-testid="name-input"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                maxLength={maxLength}
            />
            {error && <span data-testid="name-error">{error}</span>}
        </div>
    ),
}));

describe('TranslateEventCategoryForm', () => {
    const categories: EventCategoryDto[] = [
        { id: 1, name: 'Category A', relatedEventNewsCount: 0 },
        { id: 2, name: 'Category B', relatedEventNewsCount: 0 },
    ];

    const onSubmit = jest.fn();
    const onCategoryChange = jest.fn();
    const onValidationChange = jest.fn();
    const onDirtyChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders category select and name input with empty initial state', () => {
        render(<TranslateEventCategoryForm categories={categories} onSubmit={onSubmit} selectedCategory={null} />);

        expect(screen.getByText(EVENT_CATEGORY_TEXT.FORM.LABEL.CATEGORY)).toBeInTheDocument();
        expect(screen.getByText(EVENT_CATEGORY_TEXT.FORM.LABEL.NAME)).toBeInTheDocument();
        expect(screen.getByTestId('category-select')).toHaveValue('');
        expect(screen.getByTestId('name-input')).toHaveValue('');
    });

    it('calls onCategoryChange and marks form as dirty when a category is selected', () => {
        render(
            <TranslateEventCategoryForm
                categories={categories}
                onSubmit={onSubmit}
                onCategoryChange={onCategoryChange}
                onDirtyChange={onDirtyChange}
            />,
        );

        const select = screen.getByTestId('category-select');
        fireEvent.change(select, { target: { value: '1' } });

        expect(onCategoryChange).toHaveBeenCalledWith(categories[0]);
        expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    });

    it('updates name value, normalizes whitespace on blur, and validates required field', () => {
        render(
            <TranslateEventCategoryForm categories={categories} onSubmit={onSubmit} onDirtyChange={onDirtyChange} />,
        );

        const nameInput = screen.getByTestId('name-input');

        fireEvent.change(nameInput, { target: { value: '   Hello    World   ' } });
        expect(onDirtyChange).toHaveBeenLastCalledWith(true);

        fireEvent.blur(nameInput);
        expect(nameInput).toHaveValue('Hello World');
        expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();

        fireEvent.change(nameInput, { target: { value: '   ' } });
        fireEvent.blur(nameInput);

        expect(nameInput).toHaveValue('');
        expect(screen.getByTestId('name-error')).toHaveTextContent(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
    });

    it('displays max length error if name exceeds maximum allowed characters on blur', () => {
        render(<TranslateEventCategoryForm categories={categories} onSubmit={onSubmit} />);

        const nameInput = screen.getByTestId('name-input');
        const tooLongName = 'a'.repeat(EVENT_CATEGORY_VALIDATION.name.max + 1);

        fireEvent.change(nameInput, { target: { value: tooLongName } });
        fireEvent.blur(nameInput);

        expect(screen.getByTestId('name-error')).toHaveTextContent(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(EVENT_CATEGORY_VALIDATION.name.max),
        );
    });

    it('submits valid data via ref', async () => {
        const formRef = createRef<TranslateEventCategoryFormRef>();

        render(
            <TranslateEventCategoryForm
                ref={formRef}
                categories={categories}
                onSubmit={onSubmit}
                selectedCategory={categories[0]}
                onValidationChange={onValidationChange}
            />,
        );

        const nameInput = screen.getByTestId('name-input');
        fireEvent.change(nameInput, { target: { value: 'Valid Event Name' } });

        await act(async () => {
            await formRef.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ name: 'Valid Event Name' });
    });
});
