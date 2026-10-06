export const getCounterLength = (value?: string | null): number => (value ?? '').replace(/ +$/, '').length;
