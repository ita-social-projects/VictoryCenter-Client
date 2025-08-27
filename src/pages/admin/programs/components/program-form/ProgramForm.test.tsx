import { createRef } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProgramForm, ProgramFormRef, ProgramFormValues } from './ProgramForm';
import { PROGRAM_VALIDATION } from '../../../../../const/admin/programs';
import { InputLabelProps } from '../../../../../components/admin/input-label/InputLabel';
import { ProgramCategory } from '../../../../../types/admin/programs';
import { Image } from '../../../../../types/common/image';
import { VisibilityStatus } from '../../../../../types/admin/common';

jest.mock(
    '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup',
    () => ({
        InputWithCharacterLimitGroup: (props: any) => (
            <div data-testid={`input-group-${props.id}`}>
                <label htmlFor={props.id}>
                    {props.label} {props.isRequired && '*'}
                </label>
                <input
                    id={props.id}
                    name={props.name}
                    value={props.value}
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    disabled={props.disabled}
                    maxLength={props.maxLength}
                    data-testid={`input-${props.name}`}
                />
                {props.error && <div data-testid={`error-${props.id}`}>{props.error}</div>}
            </div>
        ),
    }),
);

jest.mock(
    '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: (props: any) => (
            <div data-testid={`textarea-group-${props.id}`}>
                <label htmlFor={props.id}>
                    {props.label} {props.isRequired && '*'}
                </label>
                <textarea
                    id={props.id}
                    name={props.name}
                    value={props.value}
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    disabled={props.disabled}
                    maxLength={props.maxLength}
                    rows={props.rows}
                    data-testid={`textarea-${props.name}`}
                />
                {props.error && <div data-testid={`error-${props.id}`}>{props.error}</div>}
            </div>
        ),
    }),
);

jest.mock('../../../../../components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup', () => ({
    MultiSelectInputGroup: (props: any) => (
        <div data-testid={`multiselect-group-${props.id}`}>
            <label htmlFor={props.id}>
                {props.label} {props.isRequired && '*'}
            </label>
            <select
                multiple
                id={props.id}
                data-testid="categories-select"
                value={props.value.map((v: any) => v.id)}
                onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, (option) => Number(option.value));
                    const selectedOptions = props.options.filter((opt: any) => selectedIds.includes(opt.id));
                    props.onChange(selectedOptions);
                }}
                onBlur={props.onBlur}
                disabled={props.disabled}
            >
                <option value="">{props.placeholder}</option>
                {props.options.map((opt: any) => (
                    <option key={props.getOptionId(opt)} value={props.getOptionId(opt)}>
                        {props.getOptionName(opt)}
                    </option>
                ))}
            </select>
            {props.error && <div data-testid={`error-${props.id}`}>{props.error}</div>}
        </div>
    ),
}));

jest.mock('../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: (props: any) => (
        <div data-testid={`photo-group-${props.id}`}>
            <label htmlFor={props.id}>
                {props.label} {props.isRequired && '*'}
            </label>
            <input
                type="file"
                id={props.id}
                name={props.name}
                data-testid="img-input"
                onChange={(e) => props.onChange(e.target.files?.[0])}
                disabled={props.disabled}
            />
            {props.error && <div data-testid={`error-${props.id}`}>{props.error}</div>}
        </div>
    ),
}));

describe('ProgramForm', () => {
    const mockCategories: ProgramCategory[] = [
        { id: 1, name: 'Ветеранські', programsCount: 1 },
        { id: 2, name: 'Дитячі', programsCount: 1 },
    ];

    const mockFile: Image = {
        id: 1,
        url: 'https://localhost:8080',
        mimeType: 'image/jpg',
    };

    const mockInitialData: ProgramFormValues = {
        name: 'Існуюча програма',
        description: 'Існуючий опис',
        categories: [mockCategories[0]],
        img: mockFile,
        imgId: 1,
    };

    const formRef = createRef<ProgramFormRef>();
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render empty form and fetch categories on initial load', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);

        expect(screen.getByTestId('input-name')).toHaveValue('');
        expect(screen.getByTestId('textarea-description')).toHaveValue('');
        expect(screen.getByTestId('categories-select')).toHaveValue([]);
    });

    it('should render form with pre-filled initialData', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} initialData={mockInitialData} />);

        await waitFor(() => {
            expect(screen.getByTestId('input-name')).toHaveValue(mockInitialData.name);
            expect(screen.getByTestId('textarea-description')).toHaveValue(mockInitialData.description);
            expect(screen.getByTestId('categories-select')).toHaveValue([String(mockInitialData.categories[0].id)]);
        });
    });

    it('should disable all form fields if formDisabled is true', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} isFormDisabled={true} />);

        await waitFor(() => {
            expect(screen.getByTestId('input-name')).toBeDisabled();
            expect(screen.getByTestId('textarea-description')).toBeDisabled();
            expect(screen.getByTestId('categories-select')).toBeDisabled();
            expect(screen.getByTestId('img-input')).toBeDisabled();
        });
    });

    it('should reset form fields when initialData prop changes', async () => {
        const { rerender } = render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);
        await waitFor(() => expect(screen.getByTestId('input-name')).toHaveValue(''));

        rerender(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} initialData={mockInitialData} />);
        await waitFor(() => expect(screen.getByTestId('input-name')).toHaveValue(mockInitialData.name));

        rerender(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} initialData={null} />);
        await waitFor(() => expect(screen.getByTestId('input-name')).toHaveValue(''));
    });

    it('should show required errors for name and categories when saving as draft', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);

        await act(async () => {
            formRef.current?.submit(VisibilityStatus.Draft);
        });

        expect(await screen.findByTestId('error-name')).toHaveTextContent(PROGRAM_VALIDATION.name.getRequiredError());
        expect(await screen.findByTestId('error-categories')).toHaveTextContent(
            PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError(),
        );
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show required errors for all fields when publishing', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);

        await act(async () => {
            formRef.current?.submit(VisibilityStatus.Published);
        });

        expect(await screen.findByTestId('error-name')).toHaveTextContent(PROGRAM_VALIDATION.name.getRequiredError());
        expect(await screen.findByTestId('error-categories')).toHaveTextContent(
            PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError(),
        );
        expect(await screen.findByTestId('error-description')).toHaveTextContent(
            PROGRAM_VALIDATION.description.getRequiredWhenPublishingError(),
        );
        expect(await screen.findByTestId('error-img')).toHaveTextContent(
            PROGRAM_VALIDATION.img.getRequiredWhenPublishingError(),
        );
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show max length error for name', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);
        const nameInput = screen.getByTestId('input-name');

        fireEvent.change(nameInput, { target: { value: 'a'.repeat(PROGRAM_VALIDATION.name.max + 1) } });
        fireEvent.blur(nameInput);

        // Змінив селектор помилки для групи компонентів
        expect(await screen.findByTestId('error-name')).toHaveTextContent(PROGRAM_VALIDATION.name.getMaxError());
    });

    it('should show max length error for description', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);
        const descriptionInput = screen.getByTestId('textarea-description');

        fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(PROGRAM_VALIDATION.description.max + 1) } });
        fireEvent.blur(descriptionInput);

        expect(await screen.findByTestId('error-description')).toHaveTextContent(
            PROGRAM_VALIDATION.description.getMaxError(),
        );
    });

    it('should successfully submit valid data in "Draft" mode', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} categories={mockCategories} />);

        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Нова чернетка' } });
        fireEvent.change(screen.getByTestId('categories-select'), { target: { value: ['1'] } });

        await act(async () => {
            formRef.current?.submit(VisibilityStatus.Draft);
        });

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Нова чернетка',
                    categories: [mockCategories[0]],
                }),
                VisibilityStatus.Draft,
            );
        });
    });

    it('should successfully submit valid data in "Published" mode', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} categories={mockCategories} />);

        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Нова публікація' } });
        fireEvent.change(screen.getByTestId('categories-select'), { target: { value: ['2'] } });
        fireEvent.change(screen.getByTestId('textarea-description'), { target: { value: 'Дуже важливий опис' } });
        fireEvent.change(screen.getByTestId('img-input'), { target: { files: [mockFile] } });

        await act(async () => {
            formRef.current?.submit(VisibilityStatus.Published);
        });

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Нова публікація',
                    categories: [mockCategories[1]],
                    description: 'Дуже важливий опис',
                    img: mockFile,
                }),
                VisibilityStatus.Published,
            );
        });
    });

    it('should not submit if validation fails', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);

        await act(async () => {
            formRef.current?.submit(VisibilityStatus.Published);
        });

        await waitFor(() => {
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    it('should expose `isDirty` state via ref', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} />);

        // Initially not dirty
        expect(formRef.current?.isDirty()).toBe(false);

        // Change a field
        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'some change' } });

        // Now it should be dirty
        await waitFor(() => {
            expect(formRef.current?.isDirty()).toBe(true);
        });
    });

    it('should not be dirty if initialData is provided and no changes are made', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} initialData={mockInitialData} />);

        await waitFor(() => {
            expect(formRef.current?.isDirty()).toBe(false);
        });
    });

    it('should be dirty if initialData is provided and a change is made', async () => {
        render(<ProgramForm ref={formRef} onSubmit={mockOnSubmit} initialData={mockInitialData} />);

        await waitFor(() => {
            expect(formRef.current?.isDirty()).toBe(false);
        });

        fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Нова зміна' } });

        await waitFor(() => {
            expect(formRef.current?.isDirty()).toBe(true);
        });
    });
});
