import { render, screen } from '@testing-library/react';
import { NotFoundMessage } from './NotFoundMessage';
import { MemoryRouter } from 'react-router-dom';

const mockCurrentLanguage = { value: 'en' };

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage.value }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
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
    beforeEach(() => {
        mockCurrentLanguage.value = 'en';
    });

    it('renders not found page translation keys', () => {
        const { container } = render(
            <MemoryRouter>
                <NotFoundMessage />
            </MemoryRouter>,
        );

        expect(container.querySelector('.root-class')).toBeInTheDocument();
        expect(container.querySelector('.title-class')).toHaveTextContent('TEXT');
        expect(container.querySelector('.description-class')).toHaveTextContent('DESCRIPTION');
        expect(screen.getByRole('link', { name: 'GO_BACK_BUTTON' })).toBeInTheDocument();
    });

    it.each([
        { language: 'en', homeHref: '/en' },
        { language: 'uk', homeHref: '/' },
    ])('links to $homeHref when current language is $language', ({ language, homeHref }) => {
        mockCurrentLanguage.value = language;

        render(
            <MemoryRouter>
                <NotFoundMessage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('link', { name: 'GO_BACK_BUTTON' })).toHaveAttribute('href', homeHref);
    });
});
