import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from '@/locales/i18n';
import { LOCALES } from '@/const/common/locales';

describe('LanguageSwitcher', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('uk');
    });

    it('renders all language options', () => {
        const { container } = render(<LanguageSwitcher />);
        const selectButton = container.querySelector('.language-switcher-head') as HTMLElement;
        fireEvent.click(selectButton);
        const optionsContainer = container.querySelector('.select-options');
        if (!optionsContainer) throw new Error('Options container not found');

        for (const locale of LOCALES) {
            const option = within(optionsContainer as HTMLElement).getByRole('button', {
                name: locale.toUpperCase(),
            });
            expect(option).toBeInTheDocument();
        }
    });

    it('shows current language as selected', async () => {
        const language = LOCALES[1];
        await i18n.changeLanguage(language);

        render(<LanguageSwitcher />);

        expect(await screen.findByText(language.toUpperCase())).toBeInTheDocument();
    });

    it('calls onValueChange when language is changed', async () => {
        const onValueChange = jest.fn();
        const { container } = render(<LanguageSwitcher onValueChange={onValueChange} />);
        const selectButton = container.querySelector('.language-switcher-head') as HTMLElement;
        fireEvent.click(selectButton);

        const currentLang = i18n.language;
        const nextLocale = LOCALES.find((lng) => lng !== currentLang) || LOCALES[0];

        const nextOption = screen.getByRole('button', { name: nextLocale.toUpperCase() });
        fireEvent.click(nextOption);

        expect(onValueChange).toHaveBeenCalled();

        await waitFor(() => {
            expect(i18n.language).toBe(nextLocale);
        });
    });
});
