import { MAIN_PAGE_FORM_DEFAULTS, MainPageFormValues } from '@/types/admin/main-page';
import { MainPageValidationSchema } from '@/validation/admin/main-page-schema/main-page-schema';
import { yupResolver } from '@hookform/resolvers/yup';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PartnersBlockForm } from './PartnersBlockForm';

const TestWrapper = ({
    children,
    defaultValues,
}: {
    children: React.ReactNode;
    defaultValues?: Partial<MainPageFormValues>;
}) => {
    const methods = useForm<MainPageFormValues>({
        defaultValues: { ...MAIN_PAGE_FORM_DEFAULTS, ...defaultValues },
        resolver: yupResolver(MainPageValidationSchema),
        mode: 'onChange',
    });

    React.useEffect(() => {
        if (defaultValues?.partnersTitleUa === 'Новий заголовок Партнерів') {
            methods.setValue('partnersTitleUa', 'Новий заголовок Партнерів', {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [methods, defaultValues]);

    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PartnersBlockForm', () => {
    const mockOnPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default empty values', () => {
        const { container } = render(
            <TestWrapper>
                <PartnersBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </TestWrapper>,
        );

        const titleInput = container.querySelector('#partners-block-title') as HTMLInputElement;
        const descriptionInput = container.querySelector('#partners-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
    });

    it('populates fields correctly from form context defaultValues', () => {
        const { container } = render(
            <TestWrapper
                defaultValues={{
                    partnersTitleUa: 'Наші надійні партнери',
                    partnersDescriptionUa: 'Опис партнерів нашого фонду',
                }}
            >
                <PartnersBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </TestWrapper>,
        );

        const titleInput = container.querySelector('#partners-block-title') as HTMLInputElement;
        const descriptionInput = container.querySelector('#partners-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('Наші надійні партнери');
        expect(descriptionInput.value).toBe('Опис партнерів нашого фонду');
    });

    it('disables the publish button based on the isPublishDisabled prop', () => {
        render(
            <TestWrapper>
                <PartnersBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </TestWrapper>,
        );

        const publishBtn = screen.getByRole('button', { name: /опублікувати/i });
        expect(publishBtn).toBeDisabled();
    });

    it('enables the publish button when isPublishDisabled is false', () => {
        render(
            <TestWrapper>
                <PartnersBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </TestWrapper>,
        );

        const publishBtn = screen.getByRole('button', { name: /опублікувати/i });
        expect(publishBtn).not.toBeDisabled();
    });

    it('calls onPublish when the button is clicked', () => {
        render(
            <TestWrapper>
                <PartnersBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </TestWrapper>,
        );

        const publishBtn = screen.getByRole('button', { name: /опублікувати/i });
        fireEvent.click(publishBtn);

        expect(mockOnPublish).toHaveBeenCalledTimes(1);
    });

    it('shows validation error when required field is cleared', async () => {
        const { container } = render(
            <TestWrapper
                defaultValues={{
                    partnersTitleUa: 'Наші надійні партнери',
                    partnersDescriptionUa: 'Опис партнерів нашого фонду',
                }}
            >
                <PartnersBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </TestWrapper>,
        );

        const titleInput = container.querySelector('#partners-block-title') as HTMLInputElement;

        fireEvent.change(titleInput, { target: { value: '' } });
        fireEvent.blur(titleInput);

        await waitFor(() => {
            const errorMessage = screen.getByText(/Поле обов'язкове/i);
            expect(errorMessage).toBeInTheDocument();
        });
    });

    it('renders translated fields as disabled and hides publish button in read-only mode', () => {
        const { container } = render(
            <TestWrapper
                defaultValues={{
                    partnersTitleEn: 'Partners title',
                    partnersDescriptionEn: 'Partners description',
                }}
            >
                <PartnersBlockForm isPublishDisabled={false} onPublish={mockOnPublish} isReadOnly />
            </TestWrapper>,
        );

        const titleInput = container.querySelector('#partners-block-title') as HTMLInputElement;
        const descriptionInput = container.querySelector('#partners-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('Partners title');
        expect(titleInput).toBeDisabled();
        expect(descriptionInput.value).toBe('Partners description');
        expect(descriptionInput).toBeDisabled();
        expect(screen.queryByRole('button', { name: /опублікувати/i })).not.toBeInTheDocument();
    });
});
