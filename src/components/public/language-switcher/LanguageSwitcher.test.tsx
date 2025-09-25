import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { languages } from '../../../const/common/languages';
import i18n from '../../../i18n';

describe('LanguageSwitcher', () => {
    it('renders all language options', () => {
        const { container } = render(<LanguageSwitcher />);
        const selectContainer = container.firstChild as HTMLElement;
        fireEvent.click(selectContainer);

        languages.forEach(({ name }) => {
            expect(screen.getByRole('button', { name })).toBeInTheDocument();
        });
    });

    it('shows current language as selected', () => {
        const language = languages[1];
        i18n.changeLanguage(language?.code);
        render(<LanguageSwitcher />);

        expect(screen.getByText(language?.name ?? '')).toBeInTheDocument();
    });
});
