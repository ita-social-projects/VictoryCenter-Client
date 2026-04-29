import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { FundsExpendituresTransactionType, ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { normalizeForUnique } from '@/utils/functions/normalize-for-unique/normalize-for-unique';

const isNameDuplicate = (
    name: string,
    type: FundsExpendituresTransactionType,
    categories: ReportFundsExpendituresCategory[],
) => categories.filter((c) => c.type === type).some((c) => normalizeForUnique(c.name) === normalizeForUnique(name));

export const validateFundsExpendituresCategoryName = (
    value: string,
    type: FundsExpendituresTransactionType | undefined,
    categories: ReportFundsExpendituresCategory[],
): string | undefined => {
    const normalized = getNormalizedInputText(value);
    if (!normalized) return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    if (normalized.length < FUNDS_EXPENDITURES_VALIDATION.categoryNameMin)
        return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMin);
    if (type && isNameDuplicate(normalized, type, categories))
        return FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.ERROR.NAME_DUPLICATE;
    return undefined;
};

export const validateFundsExpendituresCategoryType = (
    type: FundsExpendituresTransactionType | undefined,
): string | undefined => (!type ? COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED : undefined);
