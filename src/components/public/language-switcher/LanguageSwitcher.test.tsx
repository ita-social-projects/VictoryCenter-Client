import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from '../../../i18n';
import { LOCALES } from '../../../const/common/locales';

describe('LanguageSwitcher', () => {
    it('renders all language options', () => {
        const { container } = render(<LanguageSwitcher />);
        const selectContainer = container.firstChild as HTMLElement;
        fireEvent.click(selectContainer);

        LOCALES.forEach((locale) => {
            expect(screen.getByRole('button', { name: locale.toUpperCase() })).toBeInTheDocument();
        });
    });

    it('shows current language as selected', () => {
        const language = LOCALES[1];
        i18n.changeLanguage(language);
        render(<LanguageSwitcher />);

        expect(screen.getByText(language.toUpperCase() ?? '')).toBeInTheDocument();
    });
});
