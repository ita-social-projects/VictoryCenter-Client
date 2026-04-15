import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresTransactionType, ReportFundsExpendituresRecord } from '@/types/admin/reports';

export type FundsExpendituresAmountValidationTrigger = 'change' | 'blur' | 'save';
export type FundsExpendituresCategoryValidationTrigger = 'change' | 'blur';

interface ValidateFundsExpendituresCategoryParams {
    recordId: number;
    recordType: FundsExpendituresTransactionType;
    categoryId: number | undefined;
    records: ReportFundsExpendituresRecord[];
    trigger?: FundsExpendituresCategoryValidationTrigger;
}

export const normalizeFundsExpendituresAmountInput = (value: string, trimEnd = false): string => {
    const withNormalizedSpaces = value.replaceAll(/\s+/g, ' ').trimStart();
    return trimEnd ? withNormalizedSpaces.trim() : withNormalizedSpaces;
};

export const validateFundsExpendituresAmount = (
    value: string,
    trigger: FundsExpendituresAmountValidationTrigger = 'change',
): string | undefined => {
    const normalized = normalizeFundsExpendituresAmountInput(value, true);

    if (!normalized) {
        return trigger === 'change' ? undefined : COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    }

    const compact = normalized.replaceAll(' ', '');

    if (compact.startsWith('-')) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_NEGATIVE;
    }

    if (!/^\d+(?:[.,]\d+)?$/.test(compact)) {
        return FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_ONLY_NUMBER;
    }

    const [integerPart] = compact.split(/[.,]/);
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
