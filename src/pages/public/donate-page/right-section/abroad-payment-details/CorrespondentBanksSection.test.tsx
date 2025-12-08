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
        foreignIban: 'US29NWBK60161331926819',
        foreignBankDetailsId: 1,
        ...overrides,
    });

    const expectBasicBankElements = () => {
        expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();
        expect(screen.getByTestId('bank-block')).toBeInTheDocument();
    };

    const expectBankFields = (expectedFields: string[], expectedCount: number) => {
        const bankFields = screen.getAllByTestId('bank-field');
        expect(bankFields).toHaveLength(expectedCount);
        expectedFields.forEach((expectedContent, index) => {
            expect(bankFields[index]).toHaveTextContent(expectedContent);
        });
    };

    const renderAndExpectBasics = (mockBanks: PublishedCorrespondentBankDetailsDto[], expectedTitle: string) => {
        render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);
        expectBasicBankElements();
        expect(screen.getByTestId('bank-title')).toHaveTextContent(expectedTitle);
    };

    describe('with correspondent banks data', () => {
        it('renders correspondent banks with all fields including IBAN', () => {
            const mockBanks = [createMockCorrespondentBank()];

            renderAndExpectBasics(mockBanks, 'Test Bank USD');
            expectBankFields(['SWIFT: TEST123', 'Account: 123456789', 'IBAN: US29NWBK60161331926819'], 3);
        });

        it('renders correspondent banks without IBAN when not provided', () => {
            const mockBanks = [createMockCorrespondentBank({ foreignIban: undefined })];

            renderAndExpectBasics(mockBanks, 'Test Bank USD');
            expectBankFields(['SWIFT: TEST123', 'Account: 123456789'], 2);
        });

        it('renders correspondent banks with empty IBAN when provided but empty', () => {
            const mockBanks = [createMockCorrespondentBank({ foreignIban: '' })];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);
            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();
            expectBankFields(['SWIFT: TEST123', 'Account: 123456789'], 2);
        });

        it('renders multiple correspondent banks', () => {
            const mockBanks = [
                createMockCorrespondentBank({ name: 'Bank 1', swift: 'BANK1' }),
                createMockCorrespondentBank({ name: 'Bank 2', swift: 'BANK2', foreignIban: undefined }),
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
                    foreignIban: null as any,
                }),
            ];

            renderAndExpectBasics(mockBanks, '');
            expectBankFields(['SWIFT:', 'Account:'], 2);
        });

        it('handles banks with null IBAN value', () => {
            const mockBanks = [createMockCorrespondentBank({ foreignIban: null as any })];

            render(<CorrespondentBanksSection correspondentBanks={mockBanks} />);
            expect(screen.getByText('Кореспондентські банки')).toBeInTheDocument();
            expectBankFields(['SWIFT: TEST123', 'Account: 123456789'], 2);
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
