import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SummaryCard } from './SummaryCard';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';

jest.mock('./SummaryCard.module.scss', () => ({
    card: 'card',
    'card-blue': 'card-blue',
    'card-count': 'card-count',
    title: 'title',
    amounts: 'amounts',
    amount: 'amount',
    value: 'value',
}));

describe('SummaryCard', () => {
    const normalizeText = (value: string) => value.replaceAll('\u00A0', ' ').replaceAll(/\s+/g, ' ').trim();

    describe('when rendering a currency card', () => {
        it('should display the title', () => {
            render(<SummaryCard title="Зібрано коштів" uah={7265} usd={4200} />);
            expect(screen.getByText('Зібрано коштів')).toBeInTheDocument();
        });

        it('should display formatted UAH amount', () => {
            const { container } = render(<SummaryCard title="Зібрано коштів" uah={7265} usd={4200} />);
            const amountElements = container.querySelectorAll('.amount');
            expect(normalizeText(amountElements[0]?.textContent ?? '')).toBe(
                `7 265 ${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_UAH}`,
            );
        });

        it('should display formatted USD amount', () => {
            const { container } = render(<SummaryCard title="Зібрано коштів" uah={7265} usd={4200} />);
            const amountElements = container.querySelectorAll('.amount');
            expect(normalizeText(amountElements[1]?.textContent ?? '')).toBe(
                `4 200 ${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_USD}`,
            );
        });

        it('should not apply blueTheme class by default', () => {
            const { container } = render(<SummaryCard title="Test" uah={100} usd={100} />);
            expect(container.firstChild).not.toHaveClass('card-blue');
        });

        it('should apply blueTheme class when blueTheme is true', () => {
            const { container } = render(<SummaryCard title="Test" uah={100} usd={100} blueThemeCard />);
            expect(container.firstChild).toHaveClass('card-blue');
        });
    });

    describe('when rendering a count card', () => {
        it('should display the count with category suffix', () => {
            render(<SummaryCard title="Категорії надходжень" count={3} />);
            expect(
                screen.getByText(new RegExp(`3.*${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.CATEGORY_SUFFIX_FORMS[1]}`)),
            ).toBeInTheDocument();
        });

        it('should display zero count correctly with plural genitive form', () => {
            render(<SummaryCard title="Категорії" count={0} />);
            expect(
                screen.getByText(new RegExp(`0.*${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.CATEGORY_SUFFIX_FORMS[2]}`)),
            ).toBeInTheDocument();
        });

        it('should display count=1 with nominative singular form', () => {
            render(<SummaryCard title="Категорії" count={1} />);
            expect(
                screen.getByText(new RegExp(`1.*${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.CATEGORY_SUFFIX_FORMS[0]}`)),
            ).toBeInTheDocument();
        });

        it('should display count=5 with genitive plural form', () => {
            render(<SummaryCard title="Категорії" count={5} />);
            expect(
                screen.getByText(new RegExp(`5.*${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.CATEGORY_SUFFIX_FORMS[2]}`)),
            ).toBeInTheDocument();
        });

        it('should not display UAH/USD amounts when count is provided', () => {
            render(<SummaryCard title="Категорії" count={3} uah={100} usd={50} />);
            expect(
                screen.queryByText(new RegExp(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_UAH)),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(new RegExp(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_USD)),
            ).not.toBeInTheDocument();
        });
    });
});
