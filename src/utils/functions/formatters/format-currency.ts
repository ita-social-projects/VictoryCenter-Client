import { CURRENCY_DISPLAY, LocaleCurrency } from '@/const/common/currency';

export const formatCurrency = (formattedAmount: string, currency: LocaleCurrency): string => {
    const { symbol, position } = CURRENCY_DISPLAY[currency];

    return position === 'prefix' ? `${symbol}${formattedAmount}` : `${formattedAmount} ${symbol}`;
};
