import { renderHook } from '@testing-library/react';
import { useSectionFields, BaseSectionWithImage } from './use-section-hippotherapy-fields';
import { useHippotherapyImageField } from '@/hooks/admin/use-hippotherapy-image-field/useHippotherapyImageField';
import {
    useValidatedRichTextField,
    UseValidatedRichTextFieldParams,
} from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { useHippotherapyReadOnly } from '@/pages/admin/hippotherapy-page/context/HippotherapyReadOnlyContext';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';

jest.mock('@/hooks/admin/use-hippotherapy-image-field/useHippotherapyImageField');
const mockedUseHippotherapyImageField = useHippotherapyImageField as jest.Mock;

jest.mock('@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField');
const mockedUseValidatedRichTextField = useValidatedRichTextField as jest.Mock;

jest.mock('@/pages/admin/hippotherapy-page/context/HippotherapyReadOnlyContext');
const mockedUseHippotherapyReadOnly = useHippotherapyReadOnly as jest.Mock;

const createMockValue = (overrides: Partial<BaseSectionWithImage> = {}): BaseSectionWithImage => ({
    title: 'Test Title',
    description: 'Test Description',
    image: null,
    imageId: null,
    ...overrides,
});

const setup = (
    valueOverrides: Partial<BaseSectionWithImage> = {},
    options: {
        isReadOnly?: boolean;
        imageFieldReturn?: Partial<ReturnType<typeof useHippotherapyImageField>>;
    } = {},
) => {
    const mockOnChange = jest.fn();
    const mockOnImageError = jest.fn();
    const value = createMockValue(valueOverrides);

    mockedUseHippotherapyReadOnly.mockReturnValue(options.isReadOnly ?? false);

    mockedUseHippotherapyImageField.mockReturnValue({
        imageError: 'Mock Image Error',
        handleImageErrorChange: jest.fn(),
        handleImageChange: jest.fn(),
        ...options.imageFieldReturn,
    });

    mockedUseValidatedRichTextField.mockImplementation((params: UseValidatedRichTextFieldParams) => {
        return {
            error: params.value === value.title ? 'Mock Title Error' : 'Mock Description Error',
            handleChange: (newValue: string) => params.onChange(newValue),
            handleBlur: jest.fn(),
        };
    });

    const { result } = renderHook(() =>
        useSectionFields({
            value,
            onChange: mockOnChange,
            onImageError: mockOnImageError,
            languageCode: 'en',
        }),
    );

    return {
        result,
        mockOnChange,
        mockOnImageError,
        value,
    };
};

describe('useSectionFields', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes useHippotherapyImageField with correct parameters', () => {
        const { value, mockOnImageError } = setup();

        expect(mockedUseHippotherapyImageField).toHaveBeenCalledWith({
            value,
            onChange: expect.any(Function),
            onImageError: mockOnImageError,
        });
    });

    it('initializes useValidatedRichTextField for title with correct parameters', () => {
        const { value } = setup();

        expect(mockedUseValidatedRichTextField).toHaveBeenNthCalledWith(1, {
            value: value.title,
            onChange: expect.any(Function),
            minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
            languageCode: 'en',
        });
    });

    it('initializes useValidatedRichTextField for description with correct parameters', () => {
        const { value } = setup();

        expect(mockedUseValidatedRichTextField).toHaveBeenNthCalledWith(2, {
            value: value.description,
            onChange: expect.any(Function),
            languageCode: 'en',
        });
    });

    it('calls onChange with updated title when title handleChange is invoked', () => {
        const { result, mockOnChange, value } = setup();
        const newTitle = 'Updated Title';

        result.current.title.handleChange(newTitle);

        expect(mockOnChange).toHaveBeenCalledWith({
            ...value,
            title: newTitle,
        });
    });

    it('calls onChange with updated description when description handleChange is invoked', () => {
        const { result, mockOnChange, value } = setup();
        const newDescription = 'Updated Description';

        result.current.description.handleChange(newDescription);

        expect(mockOnChange).toHaveBeenCalledWith({
            ...value,
            description: newDescription,
        });
    });

    it('returns aggregated values from underlying hooks', () => {
        const customImageReturn = {
            imageError: 'Custom Error',
            handleImageErrorChange: jest.fn(),
            handleImageChange: jest.fn(),
        };

        const { result } = setup(
            {},
            {
                isReadOnly: true,
                imageFieldReturn: customImageReturn,
            },
        );

        expect(result.current.imageError).toBe('Custom Error');
        expect(result.current.handleImageErrorChange).toBe(customImageReturn.handleImageErrorChange);
        expect(result.current.handleImageChange).toBe(customImageReturn.handleImageChange);
        expect(result.current.isReadOnly).toBe(true);

        expect(result.current.title).toHaveProperty('error');
        expect(result.current.title).toHaveProperty('handleChange');
        expect(result.current.title).toHaveProperty('handleBlur');

        expect(result.current.description).toHaveProperty('error');
        expect(result.current.description).toHaveProperty('handleChange');
        expect(result.current.description).toHaveProperty('handleBlur');
    });
});
