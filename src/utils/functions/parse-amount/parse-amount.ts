export const parseAmount = (value: string): number => Number.parseFloat(value.replaceAll(' ', '')) || 0;
