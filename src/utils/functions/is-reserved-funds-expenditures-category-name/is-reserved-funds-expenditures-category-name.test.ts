import { isReservedFundsExpendituresCategoryName } from './is-reserved-funds-expenditures-category-name';

describe('isReservedFundsExpendituresCategoryName', () => {
    it('returns true for the exact reserved label with type expense', () => {
        expect(isReservedFundsExpendituresCategoryName('Програмні', 'expense')).toBe(true);
    });

    it.each(['ПРОГРАМНІ', 'програмні тест', 'Програмні тест 2'])(
        'returns true for real-world category name "%s"',
        (name) => {
            expect(isReservedFundsExpendituresCategoryName(name, 'expense')).toBe(true);
        },
    );

    it('is case-insensitive and trims whitespace', () => {
        expect(isReservedFundsExpendituresCategoryName('  ПРОГРАМНІ  ', 'expense')).toBe(true);
    });

    it('returns false when type is income, regardless of name', () => {
        expect(isReservedFundsExpendituresCategoryName('Програмні тест 2', 'income')).toBe(false);
    });

    it('returns false for unrelated category names', () => {
        expect(isReservedFundsExpendituresCategoryName('Оренда', 'expense')).toBe(false);
        expect(isReservedFundsExpendituresCategoryName('Адміністративні витрати', 'expense')).toBe(false);
    });

    it('returns false when the reserved word appears but not at the start of the name', () => {
        expect(isReservedFundsExpendituresCategoryName('Непрограмні витрати', 'expense')).toBe(false);
        expect(isReservedFundsExpendituresCategoryName('Витрати програмні', 'expense')).toBe(false);
    });
});
