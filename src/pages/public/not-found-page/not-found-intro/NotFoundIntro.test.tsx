import { render, screen } from '@testing-library/react';
import { NotFoundIntro } from './NotFoundIntro';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                ERROR_404: '404',
            };

            return translations[key] ?? key;
        },
    }),
}));

jest.mock('./NotFoundIntro.module.scss', () => ({
    root: 'root-class',
    content: 'content-class',
    text: 'text-class',
}));

describe('NotFoundIntro', () => {
    it('renders the localized page number', () => {
        const { container } = render(<NotFoundIntro />);
        const pageContainer = container.querySelector('.root-class');
        const pageContent = container.querySelector('.content-class');

        expect(pageContainer).toBeInTheDocument();
        expect(pageContent).toBeInTheDocument();
        expect(screen.getByText('404')).toBeInTheDocument();
    });
});
