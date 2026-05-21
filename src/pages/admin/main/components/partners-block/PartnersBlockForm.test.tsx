import { MainPage } from '@/types/admin/main-page';
import '@/utils/test-mocks/setup-form-mocks';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PartnersBlockForm } from './PartnersBlockForm';

const mockInitialData: MainPage = {
    id: 1,
    title: 'Титульний заголовок',
    description: 'Титульний опис',
    image: null,
    mainAboutUs: null,
    impactStatistics: null,
    mainPartners: {
        id: 1,
        title: 'Наші надійні партнери',
        description: 'Опис партнерів нашого фонду',
    },
};

describe('PartnersBlockForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with empty default values when initialData is null', () => {
        render(<PartnersBlockForm initialData={null} />);

        const titleInput = screen.getByTestId('partners-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('partners-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('renders with empty default values when initialData.mainPartners is null', () => {
        render(<PartnersBlockForm initialData={{ ...mockInitialData, mainPartners: null }} />);

        const titleInput = screen.getByTestId('partners-block-title') as HTMLInputElement;

        expect(titleInput.value).toBe('');
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('populates fields correctly from initialData.mainPartners', async () => {
        render(<PartnersBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('partners-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('partners-block-description') as HTMLTextAreaElement;

        await waitFor(() => {
            expect(titleInput.value).toBe('Наші надійні партнери');
            expect(descriptionInput.value).toBe('Опис партнерів нашого фонду');
        });

        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('enables submit button when form becomes dirty and is valid', async () => {
        render(<PartnersBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('partners-block-title');
        fireEvent.change(titleInput, { target: { value: 'Новий заголовок Партнерів' } });

        await waitFor(() => {
            expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
        });
    });

    it('disables submit button when a required field is cleared', async () => {
        render(<PartnersBlockForm initialData={mockInitialData} />);

        const descriptionInput = screen.getByTestId('partners-block-description');

        fireEvent.change(descriptionInput, { target: { value: '   ' } });
        fireEvent.blur(descriptionInput);

        await waitFor(() => {
            expect(screen.getByTestId('submit-btn')).toBeDisabled();
        });
    });

    it('allows submitting the form without throwing errors', async () => {
        render(<PartnersBlockForm initialData={mockInitialData} />);

        const descriptionInput = screen.getByTestId('partners-block-description');
        fireEvent.change(descriptionInput, { target: { value: 'Оновлений текст про наших нових партнерів' } });

        const submitBtn = screen.getByTestId('submit-btn');
        await waitFor(() => expect(submitBtn).not.toBeDisabled());

        expect(() => fireEvent.click(submitBtn)).not.toThrow();
    });
});
