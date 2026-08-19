import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';

export type ExchangeRateValidationTrigger = 'change' | 'blur';

export const normalizeFundsExpendituresExchangeRateInput = (value: string, trimEnd = false): string => {
    const withoutSpaces = value.replaceAll(/\s+/g, '').trimStart();
    const withCommaSeparator = withoutSpaces.replaceAll('.', ',');
    const firstCommaIndex = withCommaSeparator.indexOf(',');

    if (firstCommaIndex === -1) {
        return trimEnd ? withCommaSeparator.trim() : withCommaSeparator;
    }

    const integerPart = withCommaSeparator.slice(0, firstCommaIndex);
    const decimalPart = withCommaSeparator.slice(firstCommaIndex + 1).replaceAll(',', '');
    const normalized = `${integerPart},${decimalPart}`;

    return trimEnd ? normalized.trim() : normalized;
};

export const validateFundsExpendituresExchangeRate = (
    value: string,
    trigger: ExchangeRateValidationTrigger = 'change',
): string | undefined => {
    const normalized = normalizeFundsExpendituresExchangeRateInput(value, true);

    if (!normalized) {
        return trigger === 'blur' ? COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED : undefined;
    }

    if (!/^(0|[1-9]\d*)(?:,\d+)?$/.test(normalized)) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_ONLY_NUMERIC;
    }

    const [integerPart, decimalPart = ''] = normalized.split(',');
    if (
        integerPart.length > FUNDS_EXPENDITURES_VALIDATION.exchangeRate.maxIntegerDigits ||
        decimalPart.length > FUNDS_EXPENDITURES_VALIDATION.exchangeRate.maxDecimalDigits
    ) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_MAX_DIGITS;
    }

    const parsed = Number.parseFloat(normalized.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_GT_ZERO;
    }

    return undefined;
};
