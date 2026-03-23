import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroSection } from './IntroSection';
import { PartnersBanner } from '@/types/public/partners-page';

jest.mock('@/assets/images/horses.webp', () => 'fallback-background-image.png');

jest.mock('@/const/public/partners-page', () => ({
    PARTNERS_PAGE_TITLE: {
        FIRST_LINE: { REGULAR: 'Test First Regular ', BOLD: 'Test First Bold' },
        SECOND_LINE: {
            BOLD_START: 'Test Second BoldStart ',
            REGULAR: 'Test Second Regular ',
            BOLD_END: 'Test Second BoldEnd',
        },
    },
}));

describe('IntroSection', () => {
    describe('when banner prop is provided', () => {
        const mockBanner: PartnersBanner = {
            title: 'Test Title',
            description: 'Test Description',
            image: {
                id: 1,
                url: 'http://example.com/banner-image.jpg',
                mimeType: 'image/jpeg',
            },
        };

        it('should render the title and description from props', () => {
            render(<IntroSection banner={mockBanner} />);

            const title = screen.getByRole('heading', { level: 1 });
            expect(title).toHaveTextContent('Test Title');

            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });

        it('should render the image from the banner prop', () => {
            render(<IntroSection banner={mockBanner} />);

            const image = screen.getByRole('img', { name: /Horses/i });
            expect(image).toHaveAttribute('src', 'http://example.com/banner-image.jpg');
        });

        it('should use fallback image if banner.image is not provided', () => {
            const bannerWithoutImage: PartnersBanner = {
                title: 'Title',
                description: 'Description',
            };

            render(<IntroSection banner={bannerWithoutImage} />);

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('src', 'fallback-background-image.png');
        });

        it('should render nothing when banner is null', () => {
            const { container } = render(<IntroSection banner={null} />);

            expect(container).toBeEmptyDOMElement();
        });
    });
});
