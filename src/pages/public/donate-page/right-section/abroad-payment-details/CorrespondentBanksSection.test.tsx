import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

    describe('with correspondent banks data', () => {
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

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

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

        it('handles banks with empty values', () => {
            const mockBanks = [
                createMockCorrespondentBank({
                    name: '',
                    swift: '',
                    account: '',
                    iban: null as any,
                }),
            ];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();
            expect(screen.getByTestId('bank-block')).toBeInTheDocument();
            expect(screen.getByTestId('bank-title')).toHaveTextContent('');

            const bankFields = screen.getAllByTestId('bank-field');
            expect(bankFields).toHaveLength(2);
            expect(bankFields[0]).toHaveTextContent('SWIFT:');
            expect(bankFields[1]).toHaveTextContent('Account:');
        });

        it('handles banks with null IBAN value', () => {
            const mockBanks = [createMockCorrespondentBank({ iban: null as any })];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);

            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();

            const bankFields = screen.getAllByTestId('bank-field');
            expect(bankFields).toHaveLength(2);
            expect(bankFields[0]).toHaveTextContent('SWIFT: TEST123');
            expect(bankFields[1]).toHaveTextContent('Account: 123456789');
        });
    });

    describe('no correspondent banks scenarios', () => {
        it('returns null when no correspondent banks provided', () => {
            const { container } = render(<CorrespondentBanksSection correspondentBanks={[]} />);

            expect(container.firstChild).toBeNull();
        });

        it('returns null when correspondentBanks prop is undefined', () => {
            const { container } = render(<CorrespondentBanksSection />);

            expect(container.firstChild).toBeNull();
        });
    });
});
