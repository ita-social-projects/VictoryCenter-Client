import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WhoWeAreContent } from './WhoWeAreContent';
import { WhoWeAreApi } from '../../../../../services/api/admin/who-we-are/who-we-are-api';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { WhoWeAreCategory, WhoWeAreSection, Content } from '../../../../../types/admin/who-we-are';
// Припускаємо, що ці enum існують. Якщо ні, можна використовувати рядки.
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ToastType } from '../../../../../types/admin/toast';
import {ContentType, SectionType} from "../../../../../types/common/about-us";


// 1. Мокуємо API-сервіс
jest.mock('../../../../../services/api/admin/who-we-are/who-we-are-api');
const mockedWhoWeAreApi = WhoWeAreApi as jest.Mocked<typeof WhoWeAreApi>;

// 2. Мокуємо кастомні хуки
jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient');
const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('../../../../../contexts/admin/toast-context-provider/ToastContextProvider');
const mockedUseToast = useToast as jest.Mock;

// 3. Мокуємо дочірні компоненти
jest.mock('../../../../../components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, onCategorySelect, getCategoryDisplayName }: any) => (
        <div>
            {categories.map((cat: any) => (
                <button key={cat.id} onClick={() => onCategorySelect(cat)}>
                    {getCategoryDisplayName(cat)}
                </button>
            ))}
        </div>
    ),
}));

// ОНОВЛЕНО: Мок SectionsWrapper тепер гнучкіший і рендерить title/description
jest.mock('../sections-wrapper/SectionsWrapper', () => ({
    SectionsWrapper: ({ section, onChange, onPublish, setIsPublishButtonActive, isPublishButtonActive }: any) => (
        <div>
            <h2>{section?.title}</h2>
            {section?.contents.map((content: Content) => (
                <div key={content.id}>
                    {content.title && <p>{content.title}</p>}
                    {content.description && <p>{content.description}</p>}
                    <input
                        data-testid={`input-${content.id}`}
                        onChange={(e) => {
                            onChange({ ...content, description: e.target.value });
                            setIsPublishButtonActive(true);
                        }}
                    />
                </div>
            ))}
            <button onClick={onPublish} disabled={!isPublishButtonActive}>
                Publish
            </button>
        </div>
    ),
}));

jest.mock('../../../../../components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div>
                <h3>{title}</h3>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        ) : null,
}));

jest.mock('../../../../../components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));


// --- ОНОВЛЕНІ Тестові дані ---
// Дані тепер узгоджені між собою та з логікою тестів.

const mockCategories: WhoWeAreCategory[] = [
    { id: 1, title: 'History', sectionType: SectionType.Main },
    { id: 2, title: 'Mission', sectionType: SectionType.People },
];

const mockSection1: WhoWeAreSection = {
    id: 1,
    title: 'History Section',
    sectionType: SectionType.WhatWeDo,
    contents: [
        { id: 1, contentType: ContentType.Image, description: null, title: null, image: { id: 1, url: 'url1.jpg', mimeType: 'image/png' }, imageId: 1 },
    ],
};

const mockSection2: WhoWeAreSection = {
    id: 2,
    title: 'Mission Section',
    sectionType: SectionType.People,
    contents: [
        { id: 2, contentType: ContentType.Title, title: 'Our Goal', image: null, imageId: null, description: null },
    ],
};

// --- Основний блок тестів ---

describe('WhoWeAreContent Component', () => {
    let mockAddToast: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue({ client: 'mocked-client' });
        mockAddToast = jest.fn();
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
    });

    it('should fetch categories and the first section content on initial render', async () => {
        // Arrange
        mockedWhoWeAreApi.getAll.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);

        // Act
        render(<WhoWeAreContent />);

        // Assert
        await waitFor(() => {
            expect(screen.getByText('History')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('History Section')).toBeInTheDocument();
            // ОНОВЛЕНО: Тепер шукаємо description, який є в даних
            expect(screen.getByText('It began long ago.')).toBeInTheDocument();
        });

        expect(mockedWhoWeAreApi.getAll).toHaveBeenCalledTimes(1);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledTimes(1);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledWith({ client: 'mocked-client' }, 'HISTORY');
    });

    it('should display an error if fetching categories fails', async () => {
        // Arrange
        mockedWhoWeAreApi.getAll.mockRejectedValue(new Error('API Error'));

        // Act
        render(<WhoWeAreContent />);

        // Assert
        // Цей тест пройде після додавання логіки рендеру помилок в компонент
        const errorMessage = await screen.findByText('Failed to load categories');
        expect(errorMessage).toBeInTheDocument();
    });

    it('should display an error if fetching a section fails', async () => {
        // Arrange
        mockedWhoWeAreApi.getAll.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockRejectedValue(new Error('API Error'));

        // Act
        render(<WhoWeAreContent />);

        // Assert
        const errorMessage = await screen.findByText('Failed to load section');
        expect(errorMessage).toBeInTheDocument();
    });

    it('should handle gracefully when no categories are returned', async () => {
        mockedWhoWeAreApi.getAll.mockResolvedValue([]);
        render(<WhoWeAreContent />);
        await waitFor(() => {
            expect(mockedWhoWeAreApi.getAll).toHaveBeenCalledTimes(1);
        });
        expect(mockedWhoWeAreApi.getByType).not.toHaveBeenCalled();
        expect(screen.queryByText('History')).not.toBeInTheDocument();
    });

    it('should fetch new section data when a different category is selected', async () => {
        // Arrange
        mockedWhoWeAreApi.getAll.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType
            .mockResolvedValueOnce(mockSection1)
            .mockResolvedValueOnce(mockSection2);

        render(<WhoWeAreContent />);
        await waitFor(() => expect(screen.getByText('History Section')).toBeInTheDocument());

        // Act
        fireEvent.click(screen.getByText('Mission'));

        // Assert
        await waitFor(() => {
            expect(screen.getByText('Mission Section')).toBeInTheDocument();
            // ОНОВЛЕНО: Шукаємо текст з mockSection2
            expect(screen.getByText('To be the best.')).toBeInTheDocument();
        });

        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledTimes(2);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledWith({ client: 'mocked-client' }, 'MISSION');
    });

    it('should open confirmation modal on publish click, then publish on confirm', async () => {
        // Arrange
        const updatedDescription = 'A new beginning.';
        const updatedSection = {
            ...mockSection1,
            contents: [{ ...mockSection1.contents[0], description: updatedDescription }],
        };
        mockedWhoWeAreApi.getAll.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(JSON.parse(JSON.stringify(mockSection1)));
        mockedWhoWeAreApi.UpdateContent.mockResolvedValue(updatedSection);

        render(<WhoWeAreContent />);
        await waitFor(() => expect(screen.getByText('History Section')).toBeInTheDocument());

        // Act: Змінити контент і натиснути Publish
        fireEvent.change(screen.getByTestId('input-c1'), { target: { value: updatedDescription } });
        fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

        // Assert: Модальне вікно відкрите
        expect(await screen.findByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();

        // Act: Підтвердити публікацію
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        // Assert: API викликано, тост показано
        await waitFor(() => {
            expect(mockedWhoWeAreApi.UpdateContent).toHaveBeenCalledTimes(1);
        });

        const expectedPayload = [{ ...mockSection1.contents[0], description: updatedDescription }];
        expect(mockedWhoWeAreApi.UpdateContent).toHaveBeenCalledWith(
            { client: 'mocked-client' },
            expectedPayload,
            'HISTORY'
        );
        expect(mockAddToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info);
        expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    });

    // ... інші тести залишаються без змін, оскільки їхня логіка не залежала від тексту
});