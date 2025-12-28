import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlternativeSupportWays } from './AlternativeSupportWays';
import { PublishedSupportOptionsDto, Currency } from '@/types/public/donate-page';

jest.mock('../../copy-text-button/CopyTextButton', () => ({
    CopyTextButton: ({ textToCopy }: { textToCopy: string }) => (
        <button data-testid="copy-button" data-copy-text={textToCopy}>
            Copy
        </button>
    ),
}));

describe('AlternativeSupportWays', () => {
    const createMockSupportOption = (
        overrides: Partial<PublishedSupportOptionsDto> = {},
    ): PublishedSupportOptionsDto => ({
        id: 1,
        name: 'Test Option',
        value: 'test-value',
        currency: Currency.UAH,
        ...overrides,
    });

    describe('with support options for current currency', () => {
        it('renders single support option for current currency', () => {
            const supportOptions = [
                createMockSupportOption({
                    name: 'PayPal API',
                    value: 'api@paypal.com',
                    currency: Currency.UAH,
                }),
            ];

            render(<AlternativeSupportWays supportOptions={supportOptions} currentCurrency={Currency.UAH} />);

            expect(screen.getByText('Інші варіанти підтримки')).toBeInTheDocument();
            expect(screen.getByText('PayPal API')).toBeInTheDocument();
            expect(screen.getByText('api@paypal.com')).toBeInTheDocument();
            expect(screen.getByTestId('copy-button')).toHaveAttribute('data-copy-text', 'api@paypal.com');

            const allButtons = screen.getAllByRole('button');
            expect(allButtons).toHaveLength(1);
        });

        it('renders multiple support options for current currency', () => {
            const supportOptions = [
                createMockSupportOption({
                    id: 1,
                    name: 'PayPal USD',
                    value: 'usd@paypal.com',
                    currency: Currency.USD,
                }),
                createMockSupportOption({
                    id: 2,
                    name: 'Stripe USD',
                    value: 'usd@stripe.com',
                    currency: Currency.USD,
                }),
            ];

            render(<AlternativeSupportWays supportOptions={supportOptions} currentCurrency={Currency.USD} />);

            expect(screen.getByText('Інші варіанти підтримки')).toBeInTheDocument();
            expect(screen.getByText('PayPal USD')).toBeInTheDocument();
            expect(screen.getByText('usd@paypal.com')).toBeInTheDocument();
            expect(screen.getByText('Stripe USD')).toBeInTheDocument();
            expect(screen.getByText('usd@stripe.com')).toBeInTheDocument();

            const allButtons = screen.getAllByRole('button');
            expect(allButtons).toHaveLength(2);
        });

        it('filters options by current currency correctly', () => {
            const supportOptions = [
                createMockSupportOption({
                    name: 'PayPal UAH',
                    value: 'uah@paypal.com',
                    currency: Currency.UAH,
                }),
                createMockSupportOption({
                    name: 'PayPal USD',
                    value: 'usd@paypal.com',
                    currency: Currency.USD,
                }),
                createMockSupportOption({
                    name: 'PayPal EUR',
                    value: 'eur@paypal.com',
                    currency: Currency.EUR,
                }),
            ];

            render(<AlternativeSupportWays supportOptions={supportOptions} currentCurrency={Currency.USD} />);

            expect(screen.getByText('PayPal USD')).toBeInTheDocument();
            expect(screen.getByText('usd@paypal.com')).toBeInTheDocument();

            expect(screen.queryByText('PayPal UAH')).not.toBeInTheDocument();
            expect(screen.queryByText('PayPal EUR')).not.toBeInTheDocument();
            expect(screen.queryByText('uah@paypal.com')).not.toBeInTheDocument();
            expect(screen.queryByText('eur@paypal.com')).not.toBeInTheDocument();
        });

        it('handles support options with empty values', () => {
            const supportOptions = [
                createMockSupportOption({
                    name: 'Empty Test',
                    value: '',
                    currency: Currency.UAH,
                }),
            ];

            render(<AlternativeSupportWays supportOptions={supportOptions} currentCurrency={Currency.UAH} />);

            expect(screen.getByText('Empty Test')).toBeInTheDocument();
            expect(screen.getByTestId('copy-button')).toHaveAttribute('data-copy-text', '');
        });

        it('handles multiple currencies but shows only current one', () => {
            const supportOptions = [
                createMockSupportOption({ name: 'Option 1', currency: Currency.UAH }),
                createMockSupportOption({ name: 'Option 2', currency: Currency.UAH }),
                createMockSupportOption({ name: 'Option 3', currency: Currency.USD }),
            ];

            render(<AlternativeSupportWays supportOptions={supportOptions} currentCurrency={Currency.UAH} />);

            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
            expect(screen.queryByText('Option 3')).not.toBeInTheDocument();

            const allButtons = screen.getAllByRole('button');
            expect(allButtons).toHaveLength(2);
        });
    });

    describe('no support options scenarios', () => {
        it('returns null when no support options provided', () => {
            const { container } = render(<AlternativeSupportWays supportOptions={[]} currentCurrency={Currency.UAH} />);

            expect(container.firstChild).toBeNull();
        });

        it('returns null when no options match current currency', () => {
            const supportOptions = [
                createMockSupportOption({ currency: Currency.USD }),
                createMockSupportOption({ currency: Currency.EUR }),
            ];

            const { container } = render(
                <AlternativeSupportWays supportOptions={supportOptions} currentCurrency={Currency.UAH} />,
            );

            expect(container.firstChild).toBeNull();
        });

        it('returns null when empty support options array', () => {
            const { container } = render(<AlternativeSupportWays supportOptions={[]} currentCurrency={Currency.EUR} />);

            expect(container.firstChild).toBeNull();
        });
    });
});
