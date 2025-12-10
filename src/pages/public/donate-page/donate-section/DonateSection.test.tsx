import { render, screen, fireEvent } from '@testing-library/react';
import { DonateSection } from './DonateSection';
import { Currency } from '@/types/public/donate-page';
import { DONATION_AMOUNTS } from '@/const/public/donate-page';

describe('DonateSection', () => {
    it('renders input, currency selector, and quick amount buttons', () => {
        render(<DonateSection />);
        expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /\+/ })).toHaveLength(3);
    });

    it('changes donation amount via input', () => {
        render(<DonateSection />);
        const input = screen.getByPlaceholderText('0');
        fireEvent.change(input, { target: { value: '123' } });
        expect(input).toHaveValue('123');
    });

    it('sanitizes input to allow only numbers', () => {
        render(<DonateSection />);
        const input = screen.getByPlaceholderText('0');
        fireEvent.change(input, { target: { value: '12a3b4!@#' } });
        expect(input).toHaveValue('1234');
        fireEvent.change(input, { target: { value: '-100' } });
        expect(input).toHaveValue('100');
        fireEvent.change(input, { target: { value: '+200' } });
        expect(input).toHaveValue('200');
    });

    it('increments donation amount with quick buttons', () => {
        render(<DonateSection />);
        const input = screen.getByPlaceholderText('0');
        const [btnSmall, btnMedium, btnLarge] = screen.getAllByRole('button', { name: /\+/ });

        const uahSmall = DONATION_AMOUNTS[Currency.UAH].small;
        const uahMedium = DONATION_AMOUNTS[Currency.UAH].medium;
        const uahLarge = DONATION_AMOUNTS[Currency.UAH].large;

        fireEvent.click(btnSmall);
        expect(input).toHaveValue(`${uahSmall}`);
        fireEvent.click(btnMedium);
        expect(input).toHaveValue(`${uahSmall + uahMedium}`);
        fireEvent.click(btnLarge);
        expect(input).toHaveValue(`${uahSmall + uahMedium + uahLarge}`);
    });

    it('changes currency', () => {
        render(<DonateSection />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: Currency.USD } });
        expect(select).toHaveValue(`${Currency.USD}`);
        fireEvent.change(select, { target: { value: Currency.EUR } });
        expect(select).toHaveValue(`${Currency.EUR}`);
    });

    it('updates quick button amounts when currency changes', () => {
        render(<DonateSection />);
        const input = screen.getByPlaceholderText('0');
        const select = screen.getByRole('combobox');
        const [btnSmall, btnMedium, btnLarge] = screen.getAllByRole('button', { name: /\+/ });

        fireEvent.change(select, { target: { value: Currency.USD } });
        const usdSmall = DONATION_AMOUNTS[Currency.USD].small;
        const usdMedium = DONATION_AMOUNTS[Currency.USD].medium;

        fireEvent.click(btnSmall);
        expect(input).toHaveValue(`${usdSmall}`);
        fireEvent.click(btnMedium);
        expect(input).toHaveValue(`${usdSmall + usdMedium}`);

        fireEvent.change(select, { target: { value: Currency.EUR } });
        const eurLarge = DONATION_AMOUNTS[Currency.EUR].large;

        fireEvent.change(input, { target: { value: '0' } });
        fireEvent.click(btnLarge);
        expect(input).toHaveValue(`${eurLarge}`);
    });

    it('shows correct submit button label for one-time and subscription tabs', () => {
        render(<DonateSection />);
        const oneTimeBtn = screen.getByRole('button', { name: /Разовий донат/i });
        const submitBtn = screen.getByRole('button', { name: /Донатити/i });
        expect(submitBtn).toBeInTheDocument();
        fireEvent.click(oneTimeBtn); // Should stay on one-time
        expect(submitBtn).toHaveTextContent(/Донатити/i);
    });

    it('renders tooltip for subscription tab', () => {
        render(<DonateSection />);
        expect(screen.getByText(/Not yet available/i)).toBeInTheDocument();
        expect(screen.getByText(/Please check back later/i)).toBeInTheDocument();
    });

    it('does not submit form if amount is 0 or not integer', () => {
        render(<DonateSection />);
        const form = screen.getByTestId('donate-section-form');
        const input = screen.getByPlaceholderText('0');
        fireEvent.change(input, { target: { value: '0' } });
        fireEvent.submit(form);
        expect(input).toHaveValue('0');
        fireEvent.change(input, { target: { value: '15' } });
        fireEvent.submit(form);
        expect(input).toHaveValue('15');
    });
});
