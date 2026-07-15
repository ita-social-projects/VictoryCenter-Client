import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import {
    validateFundsExpendituresCategoryName,
    validateFundsExpendituresCategoryType,
} from './funds-expenditures-category-schema';

const REQUIRED = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
const MIN_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMin);
const MAX_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMax);
const DUPLICATE_ERROR = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.ERROR.NAME_DUPLICATE;
const RESERVED_ERROR = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.ERROR.NAME_RESERVED;

const category = (name: string, type: 'income' | 'expense'): ReportFundsExpendituresCategory => ({
    id: 1,
    name,
    type,
    localizations: [],
});

describe('validateFundsExpendituresCategoryName', () => {
    it('returns required error for empty string', () => {
        expect(validateFundsExpendituresCategoryName('', undefined, [])).toBe(REQUIRED);
    });

    it('returns required error for whitespace-only string', () => {
        expect(validateFundsExpendituresCategoryName('   ', undefined, [])).toBe(REQUIRED);
    });

    it('returns min length error when name is shorter than minimum', () => {
        expect(validateFundsExpendituresCategoryName('abc', undefined, [])).toBe(MIN_ERROR);
    });

    it('returns max length error when name exceeds maximum', () => {
        const longName = 'а'.repeat(FUNDS_EXPENDITURES_VALIDATION.categoryNameMax + 1);
        expect(validateFundsExpendituresCategoryName(longName, undefined, [])).toBe(MAX_ERROR);
    });

    it('returns duplicate error when name matches existing category for same type', () => {
        const categories = [category('Приватні донори', 'income')];
        expect(validateFundsExpendituresCategoryName('приватні донори', 'income', categories)).toBe(DUPLICATE_ERROR);
    });

    it('returns duplicate error when name matches with different word order', () => {
        const categories = [category('Приватні донори', 'income')];
        expect(validateFundsExpendituresCategoryName('Донори приватні', 'income', categories)).toBe(DUPLICATE_ERROR);
    });

    it('returns undefined when name matches category of different type', () => {
        const categories = [category('Приватні донори', 'expense')];
        expect(validateFundsExpendituresCategoryName('Приватні донори', 'income', categories)).toBeUndefined();
    });

    it('skips duplicate check when type is undefined', () => {
        const categories = [category('Valid name', 'income')];
        expect(validateFundsExpendituresCategoryName('Valid name', undefined, categories)).toBeUndefined();
    });

    it('returns undefined for valid name with no duplicates', () => {
        expect(validateFundsExpendituresCategoryName('Valid name', 'income', [])).toBeUndefined();
    });

    it.each(['ПРОГРАМНІ', 'програмні тест', 'Програмні тест 2'])(
        'returns reserved error for real-world expense category name "%s"',
        (name) => {
            expect(validateFundsExpendituresCategoryName(name, 'expense', [])).toBe(RESERVED_ERROR);
        },
    );

    it('returns undefined for income category name containing the reserved label', () => {
        expect(validateFundsExpendituresCategoryName('Програмні тест 2', 'income', [])).toBeUndefined();
    });

    it('takes reserved-name error precedence over duplicate-name error', () => {
        const categories = [category('Програмні тест 2', 'expense')];
        expect(validateFundsExpendituresCategoryName('Програмні тест 2', 'expense', categories)).toBe(RESERVED_ERROR);
    });
});

describe('validateFundsExpendituresCategoryType', () => {
    it('returns required error when type is undefined', () => {
        expect(validateFundsExpendituresCategoryType(undefined)).toBe(REQUIRED);
    });

    it('returns undefined for income type', () => {
        expect(validateFundsExpendituresCategoryType('income')).toBeUndefined();
    });

    it('returns undefined for expense type', () => {
        expect(validateFundsExpendituresCategoryType('expense')).toBeUndefined();
    });
});
