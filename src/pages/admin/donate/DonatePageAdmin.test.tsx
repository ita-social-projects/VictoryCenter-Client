import { render, screen } from '@testing-library/react';
import { DonatePageAdmin } from './DonatePageAdmin';
jest.mock('./components/donate-page-content/DonatePageContent', () => ({
    DonatePageContent: () => <div data-testid="donate-page-content" />,
}));

describe('DonatePageAdmin', () => {
    it('renders DonatePageContent', () => {
        render(<DonatePageAdmin />);
        expect(screen.getByTestId('donate-page-content')).toBeInTheDocument();
    });
});
