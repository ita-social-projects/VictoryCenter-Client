import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesSummaryCard } from './ProgramExpensesSummaryCard';
import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';

describe('ProgramExpensesSummaryCard', () => {
    const normalizeText = (value: string) => value.replaceAll('\u00A0', ' ').replaceAll(/\s+/g, ' ').trim();

    it('should render summary title', () => {
        render(
            <ProgramExpensesSummaryCard
                summary={{
                    totalAmountUah: 7265,
                    totalAmountUsd: 4200,
                }}
            />,
        );

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.TITLE)).toBeInTheDocument();
    });

    it('should render formatted amounts with suffixes', () => {
        const { container } = render(
            <ProgramExpensesSummaryCard
                summary={{
                    totalAmountUah: 7265,
                    totalAmountUsd: 4200,
                }}
            />,
        );

        const amountElements = container.querySelectorAll('span');
        const amountTexts = Array.from(amountElements)
            .map((element) => normalizeText(element.textContent ?? ''))
            .filter(
                (text) =>
                    text.includes(PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.AMOUNT_SUFFIX_UAH) ||
                    text.includes(PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.AMOUNT_SUFFIX_USD),
            );

        expect(amountTexts).toContain(`7 265 ${PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.AMOUNT_SUFFIX_UAH}`);
        expect(amountTexts).toContain(`4 200 ${PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.AMOUNT_SUFFIX_USD}`);
    });
});
