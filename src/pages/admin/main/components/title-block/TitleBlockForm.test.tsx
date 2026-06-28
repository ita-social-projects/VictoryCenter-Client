import { MainPageFormValues } from '@/types/admin/main-page';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { TitleBlockForm } from './TitleBlockForm';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    __esModule: true,
    InputWithCharacterLimitGroup: require('@/utils/test-mocks/main-page-mocks').MockInputWithCharacterLimitGroup,
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        __esModule: true,
        TextAreaWithCharacterLimitGroup: require('@/utils/test-mocks/main-page-mocks')
            .MockTextAreaWithCharacterLimitGroup,
    }),
);

jest.mock('@/components/admin/button/Button', () => ({
    __esModule: true,
    Button: require('@/utils/test-mocks/main-page-mocks').MockSubmitButton,
}));

jest.mock('@/pages/admin/main/components/common/image-upload-form/ImageUploadForm', () => ({
    __esModule: true,
    ImageUploadForm: require('@/utils/test-mocks/main-page-mocks').MockImageUploadForm,
}));

const FormWrapper = ({
    children,
    defaultValues,
}: {
    children: React.ReactNode;
    defaultValues?: Partial<MainPageFormValues>;
}) => {
    const methods = useForm<MainPageFormValues>({
        defaultValues: {
            titleUa: '',
            descriptionUa: '',
            titleEn: '',
            descriptionEn: '',
            ...defaultValues,
        } as MainPageFormValues,
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('TitleBlockForm', () => {
    const mockOnPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with correct initial values from form context', () => {
        render(
            <FormWrapper defaultValues={{ titleUa: 'Початковий заголовок', descriptionUa: 'Початковий опис' }}>
                <TitleBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const titleInput = screen.getByTestId('title-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('title-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('Початковий заголовок');
        expect(descriptionInput.value).toBe('Початковий опис');
    });

    it('disables submit button when isPublishDisabled is true', () => {
        render(
            <FormWrapper>
                <TitleBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).toBeDisabled();
    });

    it('enables submit button when isPublishDisabled is false and no image error', () => {
        render(
            <FormWrapper>
                <TitleBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).not.toBeDisabled();
    });

    it('disables submit button when ImageUploadForm sets an error (local state check)', () => {
        render(
            <FormWrapper>
                <TitleBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).not.toBeDisabled();

        fireEvent.click(screen.getByTestId('trigger-image-error'));
        expect(submitBtn).toBeDisabled();

        fireEvent.click(screen.getByTestId('clear-image-error'));
        expect(submitBtn).not.toBeDisabled();
    });

    it('calls onPublish callback when the publish button is clicked', async () => {
        render(
            <FormWrapper>
                <TitleBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');

        expect(submitBtn).not.toBeDisabled();

        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockOnPublish).toHaveBeenCalledTimes(1);
        });
    });

    it('updates input values when typed into', () => {
        render(
            <FormWrapper>
                <TitleBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const titleInput = screen.getByTestId('title-block-title') as HTMLInputElement;

        fireEvent.change(titleInput, { target: { value: 'Новий змінений заголовок' } });

        expect(titleInput.value).toBe('Новий змінений заголовок');
    });

    it('renders translated fields as disabled and hides publish button in read-only mode', () => {
        render(
            <FormWrapper defaultValues={{ titleEn: 'English title', descriptionEn: 'English description' }}>
                <TitleBlockForm isPublishDisabled={false} onPublish={mockOnPublish} isReadOnly />
            </FormWrapper>,
        );

        const titleInput = screen.getByTestId('title-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('title-block-description') as HTMLTextAreaElement;

        expect(titleInput).toHaveValue('English title');
        expect(titleInput).toBeDisabled();
        expect(descriptionInput).toHaveValue('English description');
        expect(descriptionInput).toBeDisabled();
        expect(screen.getByTestId('image-upload-form')).toHaveAttribute('data-disabled', 'true');
        expect(screen.queryByTestId('submit-btn')).not.toBeInTheDocument();
    });
});
