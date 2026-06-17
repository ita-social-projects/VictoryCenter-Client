import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { MainPageFormValues } from '@/types/admin/main-page';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { AboutUsBlockForm } from './AboutUsBlockForm';

const FormWrapper = ({
    children,
    defaultValues,
}: {
    children: React.ReactNode;
    defaultValues?: Partial<MainPageFormValues>;
}) => {
    const methods = useForm<MainPageFormValues>({
        defaultValues: {
            aboutUsTitleUa: '',
            aboutUsDescriptionUa: '',
            aboutUsTitleEn: '',
            aboutUsDescriptionEn: '',
            ...defaultValues,
        } as MainPageFormValues,
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('AboutUsBlockForm', () => {
    const mockOnPublish = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with correct initial values from form context', () => {
        render(
            <FormWrapper defaultValues={{ aboutUsTitleUa: 'Про нас заголовок', aboutUsDescriptionUa: 'Про нас опис' }}>
                <AboutUsBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const titleInput = document.querySelector('#about-us-block-title') as HTMLInputElement;
        const descriptionInput = document.querySelector('#about-us-block-description') as HTMLTextAreaElement;

        expect(titleInput?.value).toBe('Про нас заголовок');
        expect(descriptionInput?.value).toBe('Про нас опис');
    });

    it('disables submit button when isPublishDisabled is true', () => {
        render(
            <FormWrapper>
                <AboutUsBlockForm isPublishDisabled={true} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.PUBLISH });
        expect(submitBtn).toBeDisabled();
    });

    it('enables submit button when isPublishDisabled is false', () => {
        render(
            <FormWrapper>
                <AboutUsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.PUBLISH });
        expect(submitBtn).not.toBeDisabled();
    });

    it('calls onPublish callback when the publish button is clicked', () => {
        render(
            <FormWrapper>
                <AboutUsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const submitBtn = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.PUBLISH });
        fireEvent.click(submitBtn);

        expect(mockOnPublish).toHaveBeenCalledTimes(1);
    });

    it('updates input values when typed into', () => {
        render(
            <FormWrapper defaultValues={{ aboutUsTitleUa: '' }}>
                <AboutUsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const titleInput = document.querySelector('#about-us-block-title') as HTMLInputElement;

        fireEvent.change(titleInput, { target: { value: 'Новий заголовок' } });

        expect(titleInput.value).toBe('Новий заголовок');
    });

    it('renders translated fields as disabled and hides publish button in read-only mode', () => {
        render(
            <FormWrapper
                defaultValues={{
                    aboutUsTitleEn: 'About us title',
                    aboutUsDescriptionEn: 'About us description',
                }}
            >
                <AboutUsBlockForm isPublishDisabled={false} onPublish={mockOnPublish} isReadOnly />
            </FormWrapper>,
        );

        const titleInput = document.querySelector('#about-us-block-title') as HTMLInputElement;
        const descriptionInput = document.querySelector('#about-us-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('About us title');
        expect(titleInput).toBeDisabled();
        expect(descriptionInput.value).toBe('About us description');
        expect(descriptionInput).toBeDisabled();
        expect(screen.queryByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.PUBLISH })).not.toBeInTheDocument();
    });
});
