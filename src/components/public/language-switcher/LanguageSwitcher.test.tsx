import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from '@/locales/i18n';
import { LOCALES } from '@/const/common/locales';

describe('LanguageSwitcher', () => {
    it('renders all language options', () => {
        const { container } = render(<LanguageSwitcher />);
        const selectButton = container.querySelector('.language-switcher-head') as HTMLElement;
        fireEvent.click(selectButton);

        const selectOptions = container.querySelector('.select-options') as HTMLElement;
        const buttons = Array.from(selectOptions.querySelectorAll('button'));

        for (const locale of LOCALES) {
            const button = buttons.find((btn) => btn.textContent?.includes(locale.toUpperCase()));
            expect(button).toBeInTheDocument();
        }
    });

    it('shows current language as selected', () => {
        const language = LOCALES[1];
        i18n.changeLanguage(language);
        render(<LanguageSwitcher />);

        expect(screen.getByText(language.toUpperCase() ?? '')).toBeInTheDocument();
    });

    it('calls onValueChange when language is changed', () => {
        const onValueChange = jest.fn();
        const { container } = render(<LanguageSwitcher onValueChange={onValueChange} />);
        const selectButton = container.querySelector('.language-switcher-head') as HTMLElement;
        fireEvent.click(selectButton);

        const nextLocale = LOCALES.find((lng) => lng !== i18n.language) || LOCALES[0];
        fireEvent.click(screen.getByRole('button', { name: nextLocale.toUpperCase() }));

        expect(onValueChange).toHaveBeenCalled();
    });
});
