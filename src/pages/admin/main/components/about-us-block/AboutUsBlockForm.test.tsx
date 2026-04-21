import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AboutUsBlockForm } from './AboutUsBlockForm';
import { MainPage } from '@/types/admin/main-page';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    __esModule: true,
    InputWithCharacterLimitGroup: ({ id, value, onChange, onBlur }: any) => (
        <input data-testid={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        __esModule: true,
        TextAreaWithCharacterLimitGroup: ({ id, value, onChange, onBlur }: any) => (
            <textarea data-testid={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
        ),
    }),
);

jest.mock('@/components/admin/button/Button', () => ({
    __esModule: true,
    Button: ({ children, disabled, type }: any) => (
        <button data-testid="submit-btn" type={type} disabled={disabled}>
            {children}
        </button>
    ),
}));

const mockInitialData: MainPage = {
    id: 1,
    title: 'Титульний заголовок',
    description: 'Титульний опис',
    image: null,
    mainAboutUs: {
        id: 1,
        title: 'Про нас заголовок',
        description: 'Про нас опис',
    },
    mainPartners: null,
};

describe('AboutUsBlockForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with empty default values when initialData is null', () => {
        render(<AboutUsBlockForm initialData={null} />);

        const titleInput = screen.getByTestId('about-us-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('about-us-block-description') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');

        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('renders with empty default values when initialData.mainAboutUs is null', () => {
        render(<AboutUsBlockForm initialData={{ ...mockInitialData, mainAboutUs: null }} />);

        const titleInput = screen.getByTestId('about-us-block-title') as HTMLInputElement;

        expect(titleInput.value).toBe('');
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('populates fields correctly from initialData.mainAboutUs', async () => {
        render(<AboutUsBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('about-us-block-title') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('about-us-block-description') as HTMLTextAreaElement;

        await waitFor(() => {
            expect(titleInput.value).toBe('Про нас заголовок');
            expect(descriptionInput.value).toBe('Про нас опис');
        });

        expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('enables submit button when form becomes dirty and is valid', async () => {
        render(<AboutUsBlockForm initialData={mockInitialData} />);

        const titleInput = screen.getByTestId('about-us-block-title');

        fireEvent.change(titleInput, { target: { value: 'Новий заголовок Про Нас' } });

        await waitFor(() => {
            expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
        });
    });

    it('disables submit button when a required field is cleared', async () => {
        render(<AboutUsBlockForm initialData={mockInitialData} />);

        const descriptionInput = screen.getByTestId('about-us-block-description');

        fireEvent.change(descriptionInput, { target: { value: '   ' } });
        fireEvent.blur(descriptionInput);

        await waitFor(() => {
            expect(screen.getByTestId('submit-btn')).toBeDisabled();
        });
    });

    it('allows submitting the form without throwing errors', async () => {
        render(<AboutUsBlockForm initialData={mockInitialData} />);

        const descriptionInput = screen.getByTestId('about-us-block-description');
        fireEvent.change(descriptionInput, { target: { value: 'Оновлений текст про нашу місію' } });

        const submitBtn = screen.getByTestId('submit-btn');
        await waitFor(() => {
            expect(submitBtn).not.toBeDisabled();
        });

        expect(() => fireEvent.click(submitBtn)).not.toThrow();
    });
});
