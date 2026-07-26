import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportsMediaBlock, ReportsMediaBlockProps, ReportsMediaBlockValues } from './ReportsMediaBlock';

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
            maxLimitWarning,
        }: any) => (
            <div>
                <label htmlFor={id}>
                    {isRequired && '*'}
                    {label}
                </label>
                <textarea
                    data-testid={`mock-textarea-${id}`}
                    data-max-limit-warning={maxLimitWarning}
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
    ImageInput: ({ onChange, label, setError, disabled, value }: any) => (
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
    const mockOnTitleChange = jest.fn();
    const mockOnTitleBlur = jest.fn();
    const mockOnTitleEnChange = jest.fn();
    const mockOnTitleEnBlur = jest.fn();
    const mockOnTotalAmountChange = jest.fn();
    const mockOnImageChange = jest.fn();
    const mockOnImageError = jest.fn();

    const defaultValues: ReportsMediaBlockValues = {
        title: 'Test Title',
        titleEn: 'Test Title UK',
        totalAmount: 250000,
        image: null,
        imageId: null,
    };

    const defaultProps: ReportsMediaBlockProps = {
        values: defaultValues,
        windowTitle: 'Вікно 1: Зібрано коштів',
        windowDescription: 'Фото «Репрезентативне фото»',
        descriptionTitle: 'Зібрані кошти',
        imageWidth: 600,
        imageHeight: 500,
        imageUrl: 'https://example.com/default.png',
        isValueEditable: true,
        totalAmountMaxLength: 15,
        onTitleChange: mockOnTitleChange,
        onTitleBlur: mockOnTitleBlur,
        onTitleEnChange: mockOnTitleEnChange,
        onTitleEnBlur: mockOnTitleEnBlur,
        onTotalAmountChange: mockOnTotalAmountChange,
        onImageChange: mockOnImageChange,
        onImageError: mockOnImageError,
    };

    const renderComponent = (overrideProps: Partial<ReportsMediaBlockProps> = {}) =>
        render(<ReportsMediaBlock {...defaultProps} {...overrideProps} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering and props', () => {
        it('should render title input with correct value', () => {
            renderComponent();
            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            expect(titleInput).toHaveValue('Test Title');
        });

        it('should display errors when provided', () => {
            renderComponent({
                titleError: 'Title error message',
                totalAmountError: 'Amount error message',
                imageError: 'Image error message',
            });

            expect(screen.getByText('Title error message')).toBeInTheDocument();
            expect(screen.getByText('Amount error message')).toBeInTheDocument();
            expect(screen.getByText('Image error message')).toBeInTheDocument();
        });
    });

    describe('Title handling', () => {
        it('should call onTitleChange on change', () => {
            renderComponent();
            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            fireEvent.change(titleInput, { target: { value: 'New' } });
            expect(mockOnTitleChange).toHaveBeenCalledWith('New');
        });

        it('should NOT call onTitleBlur if the normalized value is identical to current value', () => {
            renderComponent();
            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            fireEvent.blur(titleInput);

            expect(mockOnTitleBlur).not.toHaveBeenCalled();
        });

        it('should call onTitleBlur if the normalized value is different', () => {
            renderComponent({ values: { ...defaultValues, title: '  Different  ' } });
            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title');
            fireEvent.blur(titleInput);

            expect(mockOnTitleBlur).toHaveBeenCalledWith('Different');
        });

        it('should call onTitleEnChange on change', () => {
            renderComponent();
            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title-en');
            fireEvent.change(titleInput, { target: { value: 'New EN' } });
            expect(mockOnTitleEnChange).toHaveBeenCalledWith('New EN');
        });

        it('should NOT call onTitleEnBlur if the normalized value is identical to current value', () => {
            renderComponent();
            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title-en');
            fireEvent.blur(titleInput);

            expect(mockOnTitleEnBlur).not.toHaveBeenCalled();
        });

        it('should call onTitleEnBlur if the normalized value is different', () => {
            renderComponent({ values: { ...defaultValues, titleEn: '  Different EN  ' } });
            const titleInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-title-en');
            fireEvent.blur(titleInput);

            expect(mockOnTitleEnBlur).toHaveBeenCalledWith('Different EN');
        });
    });

    describe('Total amount handling', () => {
        it('should call onTotalAmountChange on change', () => {
            renderComponent();
            const valueInput = screen.getByTestId('mock-textarea-Вікно 1: Зібрано коштів-value');
            fireEvent.change(valueInput, { target: { value: '300' } });
            expect(mockOnTotalAmountChange).toHaveBeenCalledWith('300');
        });
    });

    describe('Image handling', () => {
        it('should call onImageChange on upload', () => {
            renderComponent();
            fireEvent.click(screen.getByTestId('mock-image-upload'));
            expect(mockOnImageChange).toHaveBeenCalledWith({
                base64: 'data:image/png;base64,abc123',
                mimeType: 'image/png',
            });
        });

        it('should call onImageError when setError is called with an error', () => {
            renderComponent();
            fireEvent.click(screen.getByTestId('mock-image-set-error'));
            expect(mockOnImageError).toHaveBeenCalledWith('Image too large');
        });

        it('should ignore null error from setError', () => {
            renderComponent();
            fireEvent.click(screen.getByTestId('mock-image-clear-error'));
            expect(mockOnImageError).not.toHaveBeenCalled();
        });
    });
});
