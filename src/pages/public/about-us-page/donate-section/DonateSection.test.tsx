import { render } from '@testing-library/react';
import { DonateSection } from './DonateSection';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./DonateSection.module.scss', () => ({
    root: 'root',
}));
jest.mock('@/const/public/routes', () => ({
    PUBLIC_ROUTES: {
        DONATE: {
            FULL: '/donate',
        },
    },
}));
jest.mock('@/assets/images/public/about-us-page/donate-background.jpg', () => 'donate-background.jpg');

jest.mock('@/components/public/cta', () => ({
    CtaSection: () => <div data-testid="cta-section">CTA Section</div>,
}));

describe('DonateSection', () => {
    describe('DonateSection', () => {
        it('should render CtaSection', () => {
            const { container } = render(<DonateSection />, { wrapper: MemoryRouter });
            expect(container.querySelector('[data-testid="cta-section"]')).toBeInTheDocument();
        });
    });
});
