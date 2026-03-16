const GROUP_LOCALE = 'uk-UA';

export function formatAllocationAmount(amount: number, isEn = false): string {
    const hasCents = Math.round(amount * 100) % 100 !== 0;

    const formatted = new Intl.NumberFormat(GROUP_LOCALE, {
        minimumFractionDigits: hasCents ? 2 : 0,
        maximumFractionDigits: hasCents ? 2 : 0,
    }).format(amount);

    return isEn ? formatted.replace(',', '.') : formatted;
}

export function formatCollectedAmount(amount: number): string {
    return new Intl.NumberFormat(GROUP_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.trunc(amount));
}
