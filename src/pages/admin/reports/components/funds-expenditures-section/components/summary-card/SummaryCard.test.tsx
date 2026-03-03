import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SummaryCard } from './SummaryCard';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';

jest.mock('./SummaryCard.module.scss', () => ({
    card: 'card',
    cardBlue: 'cardBlue',
    title: 'title',
    amounts: 'amounts',
    amount: 'amount',
    value: 'value',
}));

describe('SummaryCard', () => {
    describe('when rendering a currency card', () => {
        it('should display the title', () => {
            render(<SummaryCard title="Зібрано коштів" uah={7265} usd={4200} />);
            expect(screen.getByText('Зібрано коштів')).toBeInTheDocument();
        });

        it('should display formatted UAH amount', () => {
            render(<SummaryCard title="Зібрано коштів" uah={7265} usd={4200} />);
            const uahElements = screen.getAllByText(
                (text) =>
                    text.replace(/\s/g, ' ').includes('7') &&
                    text.includes(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_UAH),
            );
            expect(uahElements.length).toBeGreaterThan(0);
        });

        it('should display formatted USD amount', () => {
            render(<SummaryCard title="Зібрано коштів" uah={7265} usd={4200} />);
            const usdElements = screen.getAllByText(
                (text) =>
                    text.replace(/\s/g, ' ').includes('4') &&
                    text.includes(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_USD),
            );
            expect(usdElements.length).toBeGreaterThan(0);
        });

        it('should not apply blueTheme class by default', () => {
            const { container } = render(<SummaryCard title="Test" uah={100} usd={100} />);
            expect(container.firstChild).not.toHaveClass('cardBlue');
        });

        it('should apply blueTheme class when blueTheme is true', () => {
            const { container } = render(<SummaryCard title="Test" uah={100} usd={100} blueTheme />);
            expect(container.firstChild).toHaveClass('cardBlue');
        });
    });

    describe('when rendering a count card', () => {
        it('should display the count with category suffix', () => {
            render(<SummaryCard title="Категорії надходжень" count={3} />);
            expect(
                screen.getByText(new RegExp(`3.*${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.CATEGORY_SUFFIX}`)),
            ).toBeInTheDocument();
        });

        it('should display zero count correctly', () => {
            render(<SummaryCard title="Категорії" count={0} />);
            expect(
                screen.getByText(new RegExp(`0.*${FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.CATEGORY_SUFFIX}`)),
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
