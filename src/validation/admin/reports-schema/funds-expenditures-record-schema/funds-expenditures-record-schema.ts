import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresTransactionType, ReportFundsExpendituresRecord } from '@/types/admin/reports';

export type FundsExpendituresAmountValidationTrigger = 'change' | 'blur' | 'save';
export type FundsExpendituresCategoryValidationTrigger = 'change' | 'blur';
export type FundsExpendituresReportingYearValidationTrigger = 'change' | 'blur' | 'save';

interface ValidateFundsExpendituresCategoryParams {
    recordId: number;
    recordType: FundsExpendituresTransactionType;
    categoryId: number | undefined;
    records: ReportFundsExpendituresRecord[];
    trigger?: FundsExpendituresCategoryValidationTrigger;
}

export const normalizeFundsExpendituresAmountInput = (value: string | undefined | null, trimEnd = false): string => {
    if (!value) {
        return '';
    }
    const withNormalizedSpaces = value.replaceAll(/\s+/g, ' ').trimStart();
    let withCommaSeparator = withNormalizedSpaces.replaceAll('.', ',');

    withCommaSeparator = withCommaSeparator.replace(/^-\s+/, '-');

    const isNegative = withCommaSeparator.startsWith('-');
    const absoluteValue = isNegative ? withCommaSeparator.slice(1) : withCommaSeparator;
    const normalizedPrefix = absoluteValue.startsWith(',') ? `0${absoluteValue}` : absoluteValue;

    withCommaSeparator = isNegative ? `-${normalizedPrefix}` : normalizedPrefix;

    const firstCommaIndex = withCommaSeparator.indexOf(',');

    if (firstCommaIndex === -1) {
        return trimEnd ? withCommaSeparator.trim() : withCommaSeparator;
    }

    const integerPart = withCommaSeparator.slice(0, firstCommaIndex);
    const decimalPart = withCommaSeparator
        .slice(firstCommaIndex + 1)
        .replaceAll(/[\s,]/g, '')
        .slice(0, 2);
    const normalized = `${integerPart},${decimalPart}`;

    return trimEnd ? normalized.trim() : normalized;
};

export const validateFundsExpendituresAmount = (
    value: string,
    trigger: FundsExpendituresAmountValidationTrigger = 'change',
): string | undefined => {
    if (value) {
        const withCommaSeparator = value.replaceAll(/\s+/g, ' ').trimStart().replaceAll('.', ',');
        const firstCommaIndex = withCommaSeparator.indexOf(',');
        if (firstCommaIndex !== -1) {
            const rawDecimalPart = withCommaSeparator.slice(firstCommaIndex + 1).replace(/[^\d]/g, '');
            if (rawDecimalPart.length > 2) {
                return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DECIMALS;
            }
        }
    }

    const normalized = normalizeFundsExpendituresAmountInput(value, true);

    if (!normalized) {
        return trigger === 'change' ? undefined : COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    }

    const compact = normalized.replaceAll(' ', '');

    if (compact.startsWith('-')) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_NEGATIVE;
    }

    if (!/^\d+(?:,\d{1,2})?$/.test(compact)) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_ONLY_NUMBER;
    }

    const [integerPart] = compact.split(',');
    if (integerPart.length > 9) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DIGITS;
    }

    const parsed = Number.parseFloat(compact.replace(',', '.'));
    if (!Number.isFinite(parsed)) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_ONLY_NUMBER;
    }

    if (parsed < 0) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_NEGATIVE;
    }

    if (parsed === 0) {
        return trigger === 'change' ? undefined : FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO;
    }

    return undefined;
};

export const validateFundsExpendituresReportingYear = (
    value: string | undefined,
    trigger: FundsExpendituresReportingYearValidationTrigger = 'change',
): string | undefined => {
    if (value !== undefined && value.trim() !== '') {
        return undefined;
    }

    return trigger === 'change' ? undefined : COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
};

export const validateFundsExpendituresCategory = ({
    recordId,
    recordType,
    categoryId,
    records,
    trigger = 'change',
}: ValidateFundsExpendituresCategoryParams): string | undefined => {
    if (categoryId === undefined) {
        return trigger === 'blur' ? COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED : undefined;
    }

    const hasDuplicate = records.some(
        (item) => item.id !== recordId && item.type === recordType && item.categoryId === categoryId,
    );

    if (!hasDuplicate) {
        return undefined;
    }

    return recordType === 'income'
        ? FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE_INCOME
        : FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE_EXPENSE;
};
