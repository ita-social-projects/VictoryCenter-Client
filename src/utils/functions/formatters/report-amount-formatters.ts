import { DEFAULT_LOCALE, getLocaleSettings } from '@/const/common/locales';

const DEFAULT_NUMBER_FORMAT = getLocaleSettings(DEFAULT_LOCALE).numberFormat;

export function formatAllocationAmount(amount: number, numberFormat: string = DEFAULT_NUMBER_FORMAT): string {
    const hasCents = Math.round(amount * 100) % 100 !== 0;

    return new Intl.NumberFormat(numberFormat, {
        minimumFractionDigits: hasCents ? 2 : 0,
        maximumFractionDigits: hasCents ? 2 : 0,
    }).format(amount);
}

export function formatCollectedAmount(amount: number, numberFormat: string = DEFAULT_NUMBER_FORMAT): string {
    return new Intl.NumberFormat(numberFormat, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.trunc(amount));
}
