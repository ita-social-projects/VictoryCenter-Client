import { render, screen } from '@testing-library/react';
import { NotFoundMessage } from './NotFoundMessage';
import { MemoryRouter } from 'react-router-dom';

const mockCurrentLanguage = { value: 'en' };

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage.value }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, Record<string, string>> = {
                en: {
                    TEXT: 'Page not found',
                    DESCRIPTION:
                        'Unfortunately, there is nothing at this link. Try starting from the homepage or contact our team.',
                    GO_BACK_BUTTON: 'Back to home',
                },
                uk: {
                    TEXT: 'Сторінку не знайдено',
                    DESCRIPTION:
                        'На жаль, за цим посиланням нічого немає. Спробуйте почати з головної або звернутись до нашої команди.',
                    GO_BACK_BUTTON: 'Повернутись на головну',
                },
            };

            return translations[mockCurrentLanguage.value][key] ?? key;
        },
    }),
}));

jest.mock('./NotFoundMessage.module.scss', () => ({
    root: 'root-class',
    header: 'header-class',
    title: 'title-class',
    content: 'content-class',
    description: 'description-class',
    actions: 'actions-class',
}));

describe('NotFoundMessage', () => {
    it('renders English content and keeps the language prefix on home navigation', () => {
        const { container } = render(
            <MemoryRouter>
                <NotFoundMessage />
            </MemoryRouter>,
        );
        const pageContainer = container.querySelector('.root-class');
        const pageText = container.querySelector('.title-class');
        const pageDescription = container.querySelector('.description-class');
        const homeLink = screen.getByRole('link', { name: 'Back to home' });

        expect(pageContainer).toBeInTheDocument();
        expect(pageText).toHaveTextContent('Page not found');
        expect(pageDescription).toHaveTextContent(
            'Unfortunately, there is nothing at this link. Try starting from the homepage or contact our team.',
        );
        expect(homeLink).toHaveAttribute('href', '/en');
    });

    it('renders Ukrainian content and links to the Ukrainian home page', () => {
        mockCurrentLanguage.value = 'uk';

        const { container } = render(
            <MemoryRouter>
                <NotFoundMessage />
            </MemoryRouter>,
        );
        const pageText = container.querySelector('.title-class');
        const pageDescription = container.querySelector('.description-class');
        const homeLink = screen.getByRole('link', { name: 'Повернутись на головну' });

        expect(pageText).toHaveTextContent('Сторінку не знайдено');
        expect(pageDescription).toHaveTextContent(
            'На жаль, за цим посиланням нічого немає. Спробуйте почати з головної або звернутись до нашої команди.',
        );
        expect(homeLink).toHaveAttribute('href', '/');
    });
});
