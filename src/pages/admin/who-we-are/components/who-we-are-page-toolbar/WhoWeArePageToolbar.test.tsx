import { render, screen } from '@testing-library/react';
import { WhoWeArePageToolbar } from './WhoWeArePageToolbar';

jest.mock('@/components/admin/language-toolkit/LanguageToolkit', () => ({
    LanguageToolkit: ({ languages }: any) => (
        <div data-testid="mock-language-toolkit">
            <span data-testid="lang-count">{languages.length}</span>
        </div>
    )
}));

describe('WhoWeArePageToolbar', () => {
    it('renders the toolbar and passes props to LanguageToolkit', () => {
        const mockLanguages = [
            { id: 1, name: 'English', code: 'en' },
            { id: 2, name: 'Ukrainian', code: 'uk' }
        ];
        const mockOnLanguageChange = jest.fn();

        render(
            <WhoWeArePageToolbar
                languages={mockLanguages}
                onLanguageChange={mockOnLanguageChange}
            />
        );

        const toolbar = screen.getByTestId('who-we-are-page-toolbar');
        expect(toolbar).toBeInTheDocument();

        const languageToolkit = screen.getByTestId('mock-language-toolkit');
        expect(languageToolkit).toBeInTheDocument();

        const langCount = screen.getByTestId('lang-count');
        expect(langCount).toHaveTextContent('2');
    });
});
