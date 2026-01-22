import { fireEvent, render, waitFor, within, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from '@/locales/i18n';

jest.mock('@/const/common/locales', () => ({
    LOCALES: ['uk', 'en', 'fr'],
}));

const EXPECTED_LABELS: Record<string, string> = {
    uk: 'UA',
    en: 'EN',
    fr: 'FR',
};

const getLabel = (locale: string) => EXPECTED_LABELS[locale] || locale.toUpperCase();

jest.mock('./LanguageSwitcher.scss', () => ({}));

const mockChangeLanguage = jest.fn();

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({
        currentLanguage: 'en',
        changeLanguage: mockChangeLanguage,
    }),
}));

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all language options including fallback for unknown locale', () => {
        const { container } = render(<LanguageSwitcher />);

        const selectButton = container.querySelector('.language-switcher-head') as HTMLElement;
        fireEvent.click(selectButton);
        const optionsContainer = container.querySelector('.select-options');

        ['uk', 'en', 'fr'].forEach((locale) => {
            const option = within(optionsContainer as HTMLElement).getByRole('button', {
                name: getLabel(locale),
            });
            expect(option).toBeInTheDocument();
        });
    });

    it('shows current language as selected', async () => {
        const language = 'en';
        await i18n.changeLanguage(language);
        render(<LanguageSwitcher />);
        expect(await screen.findByText('EN')).toBeInTheDocument();
    });

    it('calls onValueChange when language is changed', async () => {
        const onValueChange = jest.fn();
        const { container } = render(<LanguageSwitcher onValueChange={onValueChange} />);

        fireEvent.click(container.querySelector('.language-switcher-head') as HTMLElement);

        fireEvent.click(screen.getByRole('button', { name: 'UA' }));

        expect(onValueChange).toHaveBeenCalled();
        await waitFor(() => {
            expect(mockChangeLanguage).toHaveBeenCalledWith('uk');
        });
    });

    it('does not crash if onValueChange is missing', async () => {
        const { container } = render(<LanguageSwitcher />);
        fireEvent.click(container.querySelector('.language-switcher-head') as HTMLElement);
        fireEvent.click(screen.getByRole('button', { name: 'UA' }));
        await waitFor(() => expect(mockChangeLanguage).toHaveBeenCalledWith('uk'));
    });
});
