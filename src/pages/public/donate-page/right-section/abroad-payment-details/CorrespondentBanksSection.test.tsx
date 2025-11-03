import { render, screen } from '@testing-library/react';
import { CorrespondentBanksSection } from './CorrespondentBanksSection';
import { PublishedCorrespondentBankDetailsDto } from '../../../../../types/public/donate-page';

jest.mock('../../../../../const/public/donate-page', () => ({
    ABROAD_PAYMENT_DETAILS: {
        CORRESPONDENT_BANKS_LABEL: 'Кореспондентські банки',
        SWIFT_LABEL: 'SWIFT:',
        ACCOUNT_LABEL: 'Account:',
        IBAN_LABEL: 'IBAN:',
    },
}));

jest.mock('./CorrespondentBankBlock', () => ({
    CorrespondentBankBlock: ({ title, fields }: { title: string; fields: Array<{ label: string; value: string }> }) => (
        <div data-testid="bank-block">
            <div data-testid="bank-title">{title}</div>
            {fields.map((field, index) => (
                <div key={index} data-testid="bank-field">
                    {field.label} {field.value}
                </div>
            ))}
        </div>
    ),
}));

describe('CorrespondentBanksSection', () => {
    const createMockCorrespondentBank = (
        overrides: Partial<PublishedCorrespondentBankDetailsDto> = {},
    ): PublishedCorrespondentBankDetailsDto => ({
        id: 1,
        name: 'Test Bank USD',
        swift: 'TEST123',
        account: '123456789',
        iban: 'US29NWBK60161331926819',
        foreignBankDetailsId: 1,
        ...overrides,
    });

    describe('with API data', () => {
        it('renders correspondent banks with all fields including IBAN', () => {
            const mockBanks = [createMockCorrespondentBank()];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

            expect(screen.getByTestId('bank-block')).toBeInTheDocument();
            expect(screen.getByTestId('bank-title')).toHaveTextContent('Test Bank USD');

            const bankFields = screen.getAllByTestId('bank-field');
            expect(bankFields).toHaveLength(3);
            expect(bankFields[0]).toHaveTextContent('SWIFT: TEST123');
            expect(bankFields[1]).toHaveTextContent('Account: 123456789');
            expect(bankFields[2]).toHaveTextContent('IBAN: US29NWBK60161331926819');
        });

        it('renders correspondent banks without IBAN when not provided', () => {
            const mockBanks = [createMockCorrespondentBank({ iban: undefined })];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

            expect(screen.getByTestId('bank-block')).toBeInTheDocument();
            expect(screen.getByTestId('bank-title')).toHaveTextContent('Test Bank USD');

            const bankFields = screen.getAllByTestId('bank-field');
            expect(bankFields).toHaveLength(2);
            expect(bankFields[0]).toHaveTextContent('SWIFT: TEST123');
            expect(bankFields[1]).toHaveTextContent('Account: 123456789');
        });

        it('renders correspondent banks with empty IBAN when provided but empty', () => {
            const mockBanks = [createMockCorrespondentBank({ iban: '' })];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            const bankFields = screen.getAllByTestId('bank-field');
            expect(bankFields).toHaveLength(2);
            expect(bankFields[0]).toHaveTextContent('SWIFT: TEST123');
            expect(bankFields[1]).toHaveTextContent('Account: 123456789');
        });

        it('renders multiple correspondent banks', () => {
            const mockBanks = [
                createMockCorrespondentBank({ name: 'Bank 1', swift: 'BANK1' }),
                createMockCorrespondentBank({ name: 'Bank 2', swift: 'BANK2', iban: undefined }),
            ];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

            const bankBlocks = screen.getAllByTestId('bank-block');
            expect(bankBlocks).toHaveLength(2);

            const bankTitles = screen.getAllByTestId('bank-title');
            expect(bankTitles[0]).toHaveTextContent('Bank 1');
            expect(bankTitles[1]).toHaveTextContent('Bank 2');

            const bankFields = screen.getAllByTestId('bank-field');
            expect(bankFields).toHaveLength(5);
        });
    });

    describe('without API data empty array', () => {
        it('renders only header when no correspondent banks provided', () => {
            render(<CorrespondentBanksSection correspondentBanks={[]} />);

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

            expect(screen.queryByTestId('bank-block')).not.toBeInTheDocument();

            const contentContainer = screen.getByText('Кореспондентські банки').nextElementSibling;
            expect(contentContainer).toBeInTheDocument();
            expect(contentContainer).toBeEmptyDOMElement();
        });

        it('renders only header when correspondentBanks prop is undefined default', () => {
            render(<CorrespondentBanksSection />);

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

            expect(screen.queryByTestId('bank-block')).not.toBeInTheDocument();
        });
    });

    describe('edge cases', () => {
        it('handles banks with null undefined values gracefully', () => {
            const mockBanks = [
                createMockCorrespondentBank({
                    name: '',
                    swift: '',
                    account: '',
                    iban: null as any,
                }),
            ];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            expect(screen.getByTestId('bank-block')).toBeInTheDocument();
            expect(screen.getByTestId('bank-title')).toHaveTextContent('');

            const bankFields = screen.getAllByTestId('bank-field');
            expect(bankFields).toHaveLength(2);
            expect(bankFields[0]).toHaveTextContent('SWIFT:');
            expect(bankFields[1]).toHaveTextContent('Account:');
        });

        it('handles mixed data types in correspondent banks array', () => {
            const mockBanks = [
                createMockCorrespondentBank({ name: 'Valid Bank', swift: 'VALID123' }),
                createMockCorrespondentBank({ name: '', swift: '', account: '', iban: undefined }),
            ];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            const bankBlocks = screen.getAllByTestId('bank-block');
            expect(bankBlocks).toHaveLength(2);
        });
    });
});
