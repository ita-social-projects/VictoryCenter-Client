import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { TranslateReportsCategoryForm } from './TranslateReportsCategoryForm';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ id, value, onChange, onBlur, disabled, error }: any) => (
        <>
            <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled ?? false} />
            {error && <span>{error}</span>}
        </>
    ),
}));

jest.mock('@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup', () => ({
    SingleSelectInputGroup: ({ id, options, onChange, disabled, placeholder }: any) => (
        <select
            data-testid={id}
            disabled={disabled ?? false}
            onChange={(e) => {
                const opt = options.find((o: any) => String(o.id) === e.target.value) ?? null;
                onChange(opt);
            }}
        >
            <option value="">{placeholder}</option>
            {options.map((o: any) => (
                <option key={o.id} value={o.id}>
                    {o.name}
                </option>
            ))}
        </select>
    ),
}));

const categoriesMock: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Category One', type: 'income', localizations: [] },
    { id: 2, name: 'Category Two', type: 'expense', localizations: [] },
];

const CATEGORY_SELECT = 'translate-category-select';
const NAME_INPUT = 'translate-category-name';
const REQUIRED_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
const MIN_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMin);
const MAX_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMax);

describe('TranslateReportsCategoryForm', () => {
    it('renders category select and name input', () => {
        render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} />);

        expect(screen.getByTestId(CATEGORY_SELECT)).toBeInTheDocument();
        expect(screen.getByTestId(NAME_INPUT)).toBeInTheDocument();
    });

    it('name input is disabled when no category is selected', () => {
        render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} />);

        expect(screen.getByTestId(NAME_INPUT)).toBeDisabled();
    });

    it('name input is enabled after category is selected', () => {
        render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} />);

        fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
        expect(screen.getByTestId(NAME_INPUT)).not.toBeDisabled();
    });

    it('calls onCategoryChange when category selection changes', () => {
        const onCategoryChange = jest.fn();
        render(
            <TranslateReportsCategoryForm
                categories={categoriesMock}
                onSubmit={jest.fn()}
                onCategoryChange={onCategoryChange}
            />,
        );

        fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
        expect(onCategoryChange).toHaveBeenCalled();
    });

    describe('name validation', () => {
        it('shows required error on blur when name is empty', () => {
            render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} />);

            fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(REQUIRED_ERROR)).toBeInTheDocument();
        });

        it('shows min length error on blur when name is too short', () => {
            render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} />);

            fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'ab' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(MIN_ERROR)).toBeInTheDocument();
        });

        it('shows max length error on blur when name is too long', () => {
            render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} />);

            const longName = 'a'.repeat(FUNDS_EXPENDITURES_VALIDATION.categoryNameMax + 1);
            fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: longName } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(MAX_ERROR)).toBeInTheDocument();
        });

        it('clears error when name becomes valid on re-blur', () => {
            render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} />);

            fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'ab' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Valid name here' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.queryByText(MIN_ERROR)).not.toBeInTheDocument();
        });
    });

    describe('onValidationChange', () => {
        it('reports valid when category selected and name is valid', () => {
            const onValidationChange = jest.fn();
            render(
                <TranslateReportsCategoryForm
                    categories={categoriesMock}
                    onSubmit={jest.fn()}
                    onValidationChange={onValidationChange}
                />,
            );

            fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Valid name here' } });

            expect(onValidationChange).toHaveBeenLastCalledWith(true);
        });

        it('reports invalid when name is too short', () => {
            const onValidationChange = jest.fn();
            render(
                <TranslateReportsCategoryForm
                    categories={categoriesMock}
                    onSubmit={jest.fn()}
                    onValidationChange={onValidationChange}
                />,
            );

            fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'ab' } });

            expect(onValidationChange).toHaveBeenLastCalledWith(false);
        });
    });

    describe('onDirtyChange', () => {
        it('reports dirty when name is changed from empty default', () => {
            const onDirtyChange = jest.fn();
            render(
                <TranslateReportsCategoryForm
                    categories={categoriesMock}
                    onSubmit={jest.fn()}
                    onDirtyChange={onDirtyChange}
                />,
            );

            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'some text' } });
            expect(onDirtyChange).toHaveBeenLastCalledWith(true);
        });

        it('reports not dirty when name matches initialData', () => {
            const onDirtyChange = jest.fn();
            render(
                <TranslateReportsCategoryForm
                    categories={categoriesMock}
                    onSubmit={jest.fn()}
                    initialData={{ name: 'existing name' }}
                    onDirtyChange={onDirtyChange}
                />,
            );

            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'existing name' } });
            expect(onDirtyChange).toHaveBeenLastCalledWith(false);
        });
    });

    it('pre-fills name input when initialData is provided', () => {
        render(
            <TranslateReportsCategoryForm
                categories={categoriesMock}
                onSubmit={jest.fn()}
                initialData={{ name: 'Pre-filled name' }}
            />,
        );

        expect(screen.getByTestId(NAME_INPUT)).toHaveValue('Pre-filled name');
    });

    it('disables inputs when formDisabled is true', () => {
        render(<TranslateReportsCategoryForm categories={categoriesMock} onSubmit={jest.fn()} formDisabled={true} />);

        expect(screen.getByTestId(CATEGORY_SELECT)).toBeDisabled();
        expect(screen.getByTestId(NAME_INPUT)).toBeDisabled();
    });

    it('calls onSubmit with form values when submitted via ref', async () => {
        const onSubmit = jest.fn();
        const ref = { current: null as any };

        render(<TranslateReportsCategoryForm ref={ref} categories={categoriesMock} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: '1' } });
        fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Valid name here' } });

        await waitFor(() => {
            if (ref.current?.isValid()) {
                ref.current.submit();
            }
        });

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Valid name here' }));
    });
});
