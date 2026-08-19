import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HippotherapyPageAdmin } from './HippotherapyPageAdmin';

jest.mock('./components/hippotherapy-page-content/HippotherapyPageContent', () => ({
    HippotherapyPageContent: () => <div data-testid="hippotherapy-page-content-mock" />,
}));

describe('HippotherapyPageAdmin', () => {
    it('renders the HippotherapyPageContent component', () => {
        render(<HippotherapyPageAdmin />);
        expect(screen.getByTestId('hippotherapy-page-content-mock')).toBeInTheDocument();
    });
});
