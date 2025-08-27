import { render, screen } from '@testing-library/react';
import { CorrespondentBanksSection } from './CorrespondentBanksSection';
import { Currency } from '../../../../../types/public/donate-page';

jest.mock('../../../../../const/public/donate-page', () => ({
    ABROAD_PAYMENT_DETAILS: {
        CORRESPONDENT_BANKS_LABEL: 'Кореспондентські банки',
    },
    CORRESPONDENT_BANKS: {
        USD: [
            {
                title: 'Test Bank USD',
                fields: [{ label: 'SWIFT:', value: 'TEST123' }],
            },
        ],
    },
}));

jest.mock('./CorrespondentBankBlock', () => ({
    CorrespondentBankBlock: ({ title }: { title: string }) => <div data-testid="bank-block">{title}</div>,
}));

describe('CorrespondentBanksSection', () => {
    it('renders correspondent banks when they exist for currency', () => {
        render(<CorrespondentBanksSection currency={Currency.USD} />);

        expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

        expect(screen.getByText('Test Bank USD')).toBeInTheDocument();
        expect(screen.getByTestId('bank-block')).toBeInTheDocument();
    });

    it('handles currency with no correspondent banks (fallback to empty array)', () => {
        render(<CorrespondentBanksSection currency={Currency.EUR} />);

        expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

        expect(screen.queryByTestId('bank-block')).not.toBeInTheDocument();

        const contentContainer = screen.getByText('Кореспондентські банки').nextElementSibling;
        expect(contentContainer).toBeInTheDocument();
        expect(contentContainer).toBeEmptyDOMElement();
    });
});
