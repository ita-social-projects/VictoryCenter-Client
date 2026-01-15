import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LOCALES } from '@/const/common/locales';

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

    it('renders all language options', async () => {
        const { container } = render(<LanguageSwitcher />);

        const selectButton = container.querySelector('.language-switcher-head') as HTMLElement;
        fireEvent.click(selectButton);

        const optionsContainer = await waitFor(() => 
            container.querySelector('.select-options') as HTMLElement
        );

        for (const locale of LOCALES) {
            const option = within(optionsContainer).getByRole('button', { 
                name: locale.toUpperCase() 
            });
            expect(option).toBeInTheDocument();
        }
    });

    it('calls changeLanguage and onValueChange when language is changed', async () => {
        const onValueChange = jest.fn();
        const { container } = render(<LanguageSwitcher onValueChange={onValueChange} />);

        const selectButton = container.querySelector('.language-switcher-head') as HTMLElement;
        fireEvent.click(selectButton);

        const optionsContainer = await waitFor(() => 
            container.querySelector('.select-options') as HTMLElement
        );

        const nextLocale = LOCALES.find((lng) => lng !== 'uk')!;
        
        const nextOption = within(optionsContainer).getByRole('button', { 
            name: nextLocale.toUpperCase() 
        });

        fireEvent.click(nextOption);

        expect(mockChangeLanguage).toHaveBeenCalledWith(nextLocale);
        
        expect(onValueChange).toHaveBeenCalledWith(); 
    });
});