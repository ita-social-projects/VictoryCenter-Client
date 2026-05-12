import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TitleBlockForm } from './TitleBlockForm';
import { MainPage } from '@/types/admin/main-page';

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

const mockInitialData: MainPage = {
    id: 1,
    title: 'Початковий заголовок',
    description: 'Початковий опис',
    image: null,
    mainAboutUs: null,
    mainPartners: null,
    impactStatistics: null,
};

describe('TitleBlockForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with empty default values when initialData is null', () => {
        render(<TitleBlockForm initialData={null} />);

        const titleInput = screen.getByTestId('title-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('title-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('populates fields with initialData', async () => {
        render(<TitleBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('title-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('title-block-description') as HTMLTextAreaElement;

        await waitFor(() => {
            expect(titleInput.value).toBe('Початковий заголовок');
            expect(descriptionInput.value).toBe('Початковий опис');
        });

        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('enables submit button when form is dirty and valid', async () => {
        render(<TitleBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('title-block-title');
        fireEvent.change(titleInput, { target: { value: 'Новий змінений заголовок' } });

        await waitFor(() => {
            expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
        });
    });

    it('disables submit button when required fields are cleared', async () => {
        render(<TitleBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('title-block-title');
        fireEvent.change(titleInput, { target: { value: '   ' } });
        fireEvent.blur(titleInput);

        await waitFor(() => {
            expect(screen.getByTestId('submit-btn')).toBeDisabled();
        });
    });

    it('disables submit button when ImageUploadForm sets an error', async () => {
        render(<TitleBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('title-block-title');
        fireEvent.change(titleInput, { target: { value: 'Новий змінений заголовок' } });
        await waitFor(() => expect(screen.getByTestId('submit-btn')).not.toBeDisabled());

        fireEvent.click(screen.getByTestId('trigger-image-error'));
        await waitFor(() => expect(screen.getByTestId('submit-btn')).toBeDisabled());

        fireEvent.click(screen.getByTestId('clear-image-error'));
        await waitFor(() => expect(screen.getByTestId('submit-btn')).not.toBeDisabled());
    });

    it('allows submitting the form without throwing errors', async () => {
        render(<TitleBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('title-block-title');
        fireEvent.change(titleInput, { target: { value: 'Фінальний заголовок' } });

        const submitBtn = screen.getByTestId('submit-btn');
        await waitFor(() => expect(submitBtn).not.toBeDisabled());

        expect(() => fireEvent.click(submitBtn)).not.toThrow();
    });
});
