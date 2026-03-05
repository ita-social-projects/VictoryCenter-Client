import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    ReportsMediaBlock,
    ReportsMediaBlockProps,
    ReportsMediaBlockValues,
    ReportsMediaBlockErrors,
    ReportsMediaBlockValidationFunctions,
} from './ReportsMediaBlock';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { Image, ImageValues } from '@/types/common/image';

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            label,
            id,
            name,
            value,
            onChange,
            onBlur,
            maxLength,
            disabled,
            error,
            isRequired,
        }: {
            label: string;
            id: string;
            name: string;
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
            maxLength: number;
            disabled: boolean;
            error?: string;
            isRequired?: boolean;
        }) => (
            <div>
                <label htmlFor={id}>
                    {isRequired && '*'}
                    {label}
                </label>
                <textarea
                    data-testid={`mock-textarea-${id}`}
                    maxLength={maxLength}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
                {error && <span data-testid={`mock-textarea-error-${id}`}>{error}</span>}
            </div>
        ),
    }),
);

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({
        onChange,
        label,
        setError,
        disabled,
        value,
    }: {
        onChange: (val: ImageValues | null) => void;
        label: string;
        setError: (err: string | null) => void;
        disabled: boolean;
        value: ImageValues | null;
    }) => (
        <div data-testid="mock-image-input">
            <span>{label}</span>
            <span data-testid="mock-image-disabled">{disabled ? 'disabled' : 'enabled'}</span>
            <span data-testid="mock-image-value">{value ? 'has-value' : 'no-value'}</span>
            <button
                data-testid="mock-image-upload"
                onClick={() => onChange({ base64: 'data:image/png;base64,abc123', mimeType: 'image/png' })}
            >
                Upload
            </button>
            <button data-testid="mock-image-clear" onClick={() => onChange(null)}>
                Clear
            </button>
            <button data-testid="mock-image-set-error" onClick={() => setError('Image too large')}>
                Set Error
            </button>
            <button data-testid="mock-image-clear-error" onClick={() => setError(null)}>
                Clear Error
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: ({ error }: { error?: string }) => (error ? <span data-testid="mock-input-error">{error}</span> : null),
}));

jest.mock('./ReportsMediaBlock.module.scss', () => ({
    root: 'root',
    'root-editing': 'root-editing',
    content: 'content',
    inputs: 'inputs',
    header: 'header',
    'title-wrapper': 'title-wrapper',
    title: 'title',
    description: 'description',
    'title-input': 'title-input',
    'total-amount-input': 'total-amount-input',
    image: 'image',
    'image-wrapper': 'image-wrapper',
}));

describe('ReportsMediaBlock', () => {
    const mockOnValuesChange = jest.fn();
    const mockValidateTitle = jest.fn();
    const mockValidateTotalAmount = jest.fn();

    const defaultValues: ReportsMediaBlockValues = {
        title: 'Test Title',
        totalAmount: 250000,
        image: null,
        imageId: null,
    };

    const defaultErrors: ReportsMediaBlockErrors = {};

    const defaultValidationFunctions: ReportsMediaBlockValidationFunctions = {
        validateTitle: mockValidateTitle,
        validateTotalAmount: mockValidateTotalAmount,
    };

    const defaultProps: ReportsMediaBlockProps = {
        values: defaultValues,
        errors: defaultErrors,
        windowTitle: 'Вікно 1: Зібрано коштів',
        windowDescription: 'Фото «Репрезентативне фото»',
        descriptionTitle: 'Зібрані кошти',
        imageWidth: 600,
        imageHeight: 500,
        imageUrl: 'https://example.com/default.png',
        isEditing: false,
        isValueEditable: true,
        totalAmountMaxLength: 15,
        validationFunctions: defaultValidationFunctions,
        onValuesChange: mockOnValuesChange,
    };

    const renderComponent = (overrideProps: Partial<ReportsMediaBlockProps> = {}) =>
        render(<ReportsMediaBlock {...defaultProps} {...overrideProps} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render window title and description', () => {
            renderComponent();

            expect(screen.getByText('Вікно 1: Зібрано коштів')).toBeInTheDocument();
            expect(screen.getByText('Фото «Репрезентативне фото»')).toBeInTheDocument();
        });

        it('should render title input with correct value', () => {
            renderComponent();

            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            expect(titleInput).toHaveValue('Test Title');
        });

        it('should render total amount input with correct value', () => {
            renderComponent();

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            expect(valueInput).toHaveValue('250000');
        });

        it('should render description title as label', () => {
            renderComponent();

            expect(screen.getByText('Зібрані кошти')).toBeInTheDocument();
        });

        it('should render image input', () => {
            renderComponent();

            expect(screen.getByTestId('mock-image-input')).toBeInTheDocument();
        });

        it('should render image input label', () => {
            renderComponent();

            expect(screen.getByText(COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE)).toBeInTheDocument();
        });
    });

    describe('Editing state', () => {
        it('should not apply editing class when isEditing is false', () => {
            const { container } = renderComponent({ isEditing: false });

            const root = container.firstChild as HTMLElement;
            expect(root).toHaveClass('root');
            expect(root).not.toHaveClass('root-editing');
        });

        it('should apply editing class when isEditing is true', () => {
            const { container } = renderComponent({ isEditing: true });

            const root = container.firstChild as HTMLElement;
            expect(root).toHaveClass('root');
            expect(root).toHaveClass('root-editing');
        });

        it('should disable title input when not editing', () => {
            renderComponent({ isEditing: false });

            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            expect(titleInput).toBeDisabled();
        });

        it('should enable title input when editing', () => {
            renderComponent({ isEditing: true });

            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            expect(titleInput).not.toBeDisabled();
        });

        it('should disable total amount input when not editing', () => {
            renderComponent({ isEditing: false, isValueEditable: true });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            expect(valueInput).toBeDisabled();
        });

        it('should disable total amount input when editing but isValueEditable is false', () => {
            renderComponent({ isEditing: true, isValueEditable: false });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            expect(valueInput).toBeDisabled();
        });

        it('should enable total amount input when editing and isValueEditable is true', () => {
            renderComponent({ isEditing: true, isValueEditable: true });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            expect(valueInput).not.toBeDisabled();
        });

        it('should disable image input when not editing', () => {
            renderComponent({ isEditing: false });

            expect(screen.getByTestId('mock-image-disabled')).toHaveTextContent('disabled');
        });

        it('should enable image input when editing', () => {
            renderComponent({ isEditing: true });

            expect(screen.getByTestId('mock-image-disabled')).toHaveTextContent('enabled');
        });
    });

    describe('Title handling', () => {
        it('should call onValuesChange with updated title and validation error on change', () => {
            const titleError = 'Title is too short';
            mockValidateTitle.mockReturnValue(titleError);
            renderComponent({ isEditing: true });

            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            fireEvent.change(titleInput, { target: { value: 'New' } });

            expect(mockValidateTitle).toHaveBeenCalledWith('New');
            expect(mockOnValuesChange).toHaveBeenCalledWith({ ...defaultValues, title: 'New' }, { title: titleError });
        });

        it('should call onValuesChange with no error when title is valid on change', () => {
            mockValidateTitle.mockReturnValue(undefined);
            renderComponent({ isEditing: true });

            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            fireEvent.change(titleInput, { target: { value: 'Valid Title Text' } });

            expect(mockValidateTitle).toHaveBeenCalledWith('Valid Title Text');
            expect(mockOnValuesChange).toHaveBeenCalledWith(
                { ...defaultValues, title: 'Valid Title Text' },
                { title: undefined },
            );
        });

        it('should validate title on blur', () => {
            const titleError = "Заголовок обов'язковий";
            mockValidateTitle.mockReturnValue(titleError);
            renderComponent({ isEditing: true });

            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            fireEvent.blur(titleInput);

            expect(mockValidateTitle).toHaveBeenCalledWith('Test Title');
            expect(mockOnValuesChange).toHaveBeenCalledWith({ ...defaultValues }, { title: titleError });
        });
    });

    describe('Total amount handling', () => {
        it('should call onValuesChange with updated numeric value on change', () => {
            mockValidateTotalAmount.mockReturnValue(undefined);
            renderComponent({ isEditing: true, isValueEditable: true });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            fireEvent.change(valueInput, { target: { value: '300000' } });

            expect(mockValidateTotalAmount).toHaveBeenCalledWith(300000);
            expect(mockOnValuesChange).toHaveBeenCalledWith(
                { ...defaultValues, totalAmount: 300000 },
                { totalAmount: undefined },
            );
        });

        it('should call onValuesChange with validation error for invalid value', () => {
            const valueError = 'Значення повинно бути числом';
            mockValidateTotalAmount.mockReturnValue(valueError);
            renderComponent({ isEditing: true, isValueEditable: true });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            fireEvent.change(valueInput, { target: { value: 'abc' } });

            expect(mockOnValuesChange).toHaveBeenCalledWith(
                { ...defaultValues, totalAmount: NaN },
                { totalAmount: valueError },
            );
        });

        it('should validate total amount on blur', () => {
            mockValidateTotalAmount.mockReturnValue(undefined);
            renderComponent({ isEditing: true, isValueEditable: true });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            fireEvent.blur(valueInput);

            expect(mockValidateTotalAmount).toHaveBeenCalledWith(250000);
            expect(mockOnValuesChange).toHaveBeenCalledWith({ ...defaultValues }, { totalAmount: undefined });
        });

        it('should work without validateTotalAmount function', () => {
            renderComponent({
                isEditing: true,
                isValueEditable: true,
                validationFunctions: { validateTitle: mockValidateTitle },
            });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            fireEvent.change(valueInput, { target: { value: '500' } });

            expect(mockOnValuesChange).toHaveBeenCalledWith(
                { ...defaultValues, totalAmount: 500 },
                { totalAmount: undefined },
            );
        });

        it('should set totalAmount maxLength from props', () => {
            renderComponent({ totalAmountMaxLength: 10 });

            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            expect(valueInput).toHaveAttribute('maxlength', '10');
        });
    });

    describe('Image handling', () => {
        it('should call onValuesChange with new image on upload', () => {
            renderComponent({ isEditing: true });

            fireEvent.click(screen.getByTestId('mock-image-upload'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(
                {
                    ...defaultValues,
                    image: { base64: 'data:image/png;base64,abc123', mimeType: 'image/png' },
                    imageId: null,
                },
                { image: undefined },
            );
        });

        it('should clear imageId when image is cleared', () => {
            const valuesWithImage: ReportsMediaBlockValues = {
                ...defaultValues,
                image: { base64: 'data:image/png;base64,abc123', mimeType: 'image/png' },
                imageId: 5,
            };
            renderComponent({ values: valuesWithImage, isEditing: true });

            fireEvent.click(screen.getByTestId('mock-image-clear'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(
                { ...valuesWithImage, image: null, imageId: null },
                { image: undefined },
            );
        });

        it('should preserve imageId when new image is uploaded and imageId exists', () => {
            const valuesWithImageId: ReportsMediaBlockValues = {
                ...defaultValues,
                imageId: 10,
            };
            renderComponent({ values: valuesWithImageId, isEditing: true });

            fireEvent.click(screen.getByTestId('mock-image-upload'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(
                {
                    ...valuesWithImageId,
                    image: { base64: 'data:image/png;base64,abc123', mimeType: 'image/png' },
                    imageId: 10,
                },
                { image: undefined },
            );
        });

        it('should call onValuesChange with image error from setError', () => {
            renderComponent({ isEditing: true });

            fireEvent.click(screen.getByTestId('mock-image-set-error'));

            expect(mockOnValuesChange).toHaveBeenCalledWith({ ...defaultValues }, { image: 'Image too large' });
        });

        it('should ignore null error from setError', () => {
            renderComponent({ isEditing: true });

            fireEvent.click(screen.getByTestId('mock-image-clear-error'));

            expect(mockOnValuesChange).not.toHaveBeenCalled();
        });

        it('should show user-uploaded image (with base64) in ImageInput', () => {
            const userImage: ImageValues = {
                base64: 'data:image/png;base64,userImage',
                mimeType: 'image/png',
            };
            renderComponent({ values: { ...defaultValues, image: userImage } });

            expect(screen.getByTestId('mock-image-value')).toHaveTextContent('has-value');
        });

        it('should not show server image (with url) in ImageInput', () => {
            const serverImage: Image = {
                id: 1,
                url: 'https://example.com/image.png',
                mimeType: 'image/png',
            };
            renderComponent({ values: { ...defaultValues, image: serverImage } });

            expect(screen.getByTestId('mock-image-value')).toHaveTextContent('no-value');
        });

        it('should show no-value when image is null', () => {
            renderComponent({ values: { ...defaultValues, image: null } });

            expect(screen.getByTestId('mock-image-value')).toHaveTextContent('no-value');
        });
    });

    describe('Error display', () => {
        it('should display title error', () => {
            renderComponent({ errors: { title: 'Title error message' } });

            expect(screen.getByText('Title error message')).toBeInTheDocument();
        });

        it('should display totalAmount error via TextAreaWithCharacterLimitGroup', () => {
            renderComponent({ errors: { totalAmount: 'Value error message' } });

            const errorEl = screen.getByTestId('mock-textarea-error-Вікно 1: Зібрано коштів-value');
            expect(errorEl).toHaveTextContent('Value error message');
        });

        it('should display image error', () => {
            renderComponent({ errors: { image: 'Image error message' } });

            expect(screen.getByText('Image error message')).toBeInTheDocument();
        });

        it('should not display errors when errors object is empty', () => {
            renderComponent({ errors: {} });

            expect(screen.queryAllByTestId('mock-input-error')).toHaveLength(0);
        });
    });
});
