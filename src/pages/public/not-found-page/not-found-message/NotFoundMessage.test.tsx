import { render, screen } from '@testing-library/react';
import { NotFoundMessage } from './NotFoundMessage';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: 'en' }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                TEXT: 'Page not found',
                DESCRIPTION: 'The page you are looking for does not exist.',
                GO_BACK_BUTTON: 'Back to home',
            };

            return translations[key] ?? key;
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
    it('renders localized content for the current language and keeps the language prefix on home navigation', () => {
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
        expect(pageDescription).toHaveTextContent('The page you are looking for does not exist.');
        expect(homeLink).toHaveAttribute('href', '/en');
    });
});
