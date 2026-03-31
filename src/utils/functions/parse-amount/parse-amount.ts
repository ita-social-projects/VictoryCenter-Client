export const parseAmount = (value: string): number =>
    Number.parseFloat(value.replaceAll(' ', '').replace(',', '.')) || 0;
