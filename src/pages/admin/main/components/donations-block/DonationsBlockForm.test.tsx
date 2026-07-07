import { MainPageFormValues } from '@/types/admin/main-page';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { DonationsBlockForm } from './DonationsBlockForm';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    __esModule: true,
    RichTextInputGroup: ({ id, value, onChange, onBlur, disabled }: any) => (
        <textarea
            data-testid={id}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
        />
    ),
}));

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
            donationsTitleUa: '',
            donationsDescriptionUa: '',
            donationsTitleEn: '',
            donationsDescriptionEn: '',
            ...defaultValues,
        } as MainPageFormValues,
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('DonationsBlockForm', () => {
    const mockOnPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with correct initial values from form context', () => {
        render(
            <FormWrapper
                defaultValues={{ donationsTitleUa: 'Початковий заголовок', donationsDescriptionUa: 'Початковий опис' }}
            >
                <DonationsBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const titleInput = screen.getByTestId('donations-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('donations-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('Початковий заголовок');
        expect(descriptionInput.value).toBe('Початковий опис');
    });

    it('disables submit button when isPublishDisabled is true', () => {
        render(
            <FormWrapper>
                <DonationsBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).toBeDisabled();
    });

    it('enables submit button when isPublishDisabled is false and no image error', () => {
        render(
            <FormWrapper>
                <DonationsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).not.toBeDisabled();
    });

    it('disables submit button when ImageUploadForm sets an error (local state check)', () => {
        render(
            <FormWrapper>
                <DonationsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
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
                <DonationsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
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
                <DonationsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const titleInput = screen.getByTestId('donations-block-title') as HTMLInputElement;

        fireEvent.change(titleInput, { target: { value: 'Новий змінений заголовок' } });

        expect(titleInput.value).toBe('Новий змінений заголовок');
    });

    it('renders translated fields as disabled and hides publish button in read-only mode', () => {
        render(
            <FormWrapper
                defaultValues={{ donationsTitleEn: 'English title', donationsDescriptionEn: 'English description' }}
            >
                <DonationsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} isReadOnly />
            </FormWrapper>,
        );

        const titleInput = screen.getByTestId('donations-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('donations-block-description') as HTMLTextAreaElement;

        expect(titleInput).toHaveValue('English title');
        expect(titleInput).toBeDisabled();
        expect(descriptionInput).toHaveValue('English description');
        expect(descriptionInput).toBeDisabled();
        expect(screen.getByTestId('image-upload-form')).toHaveAttribute('data-disabled', 'true');
        expect(screen.queryByTestId('submit-btn')).not.toBeInTheDocument();
    });
});
