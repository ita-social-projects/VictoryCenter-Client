import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PartnersSection } from './PartnersSection';
import { PartnersCard } from './partners-card/PartnersCard';
import { SUPPORT_US_DATA } from '@/const/public/support-us-page';

jest.mock('@mui/material/useMediaQuery');
jest.mock('./partners-card/PartnersCard');

const mockedUseMediaQuery = jest.mocked(useMediaQuery);
const MockPartnersCard = PartnersCard as jest.Mock;

describe('PartnersSection', () => {
    beforeEach(() => {
        mockedUseMediaQuery.mockReturnValue(false);
    });

    test('should render a level 2 heading for the section title', () => {
        render(<PartnersSection />);
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    describe('grid layout (tablet/desktop)', () => {
        test('should render three partner items, each with an image and a non-empty caption', () => {
            const { container } = render(<PartnersSection />);

            const items = container.querySelectorAll('.item');
            expect(items).toHaveLength(3);

            const images = screen.getAllByRole('img');
            expect(images).toHaveLength(3);
            images.forEach((image) => expect(image).toHaveAccessibleName());

            const captions = container.querySelectorAll('.caption');
            expect(captions).toHaveLength(3);
            captions.forEach((caption) => expect(caption.textContent?.trim().length).toBeGreaterThan(0));
        });

        test('should have correct class names', () => {
            const { container } = render(<PartnersSection />);
            expect(container.querySelector('.root')).toBeInTheDocument();
            expect(container.querySelector('.list')).toBeInTheDocument();
        });
    });

    describe('swiper layout (mobile)', () => {
        beforeEach(() => {
            mockedUseMediaQuery.mockReturnValue(true);
        });

        test('should render the swiper with a card per partner instead of the static grid', () => {
            const { container } = render(<PartnersSection />);

            expect(container.querySelector('.list')).not.toBeInTheDocument();
            expect(MockPartnersCard).toHaveBeenCalledTimes(SUPPORT_US_DATA.PARTNERS_DATA.length);

            SUPPORT_US_DATA.PARTNERS_DATA.forEach((partner, index) => {
                expect(MockPartnersCard).toHaveBeenNthCalledWith(
                    index + 1,
                    expect.objectContaining({
                        imageUrl: partner.IMG,
                        altText: partner.ALT,
                        caption: expect.any(String),
                    }),
                    undefined,
                );
            });
        });
    });
});
