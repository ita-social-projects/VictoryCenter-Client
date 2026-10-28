import { Currency } from '@/types/common/currency';
import { LocaleCurrency } from '@/const/common/currency';

export const DEFAULT_LOCALE = 'uk';

export const DEFAULT_UKRAINIAN_LANGUAGE_ID = 1;
export const DEFAULT_ENGLISH_LANGUAGE_ID = 2;

export interface LocaleSettings {
    numberFormat: string;
    currency: LocaleCurrency;
}

export const LOCALE_SETTINGS: Record<string, LocaleSettings> = {
    uk: { numberFormat: 'uk-UA', currency: Currency.UAH },
    en: { numberFormat: 'en-US', currency: Currency.USD },
};

export const LOCALES = Object.keys(LOCALE_SETTINGS);

export const getLocaleSettings = (languageCode: string): LocaleSettings =>
    LOCALE_SETTINGS[languageCode] ?? LOCALE_SETTINGS[DEFAULT_LOCALE];
