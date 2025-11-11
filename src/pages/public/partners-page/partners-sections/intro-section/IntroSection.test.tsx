import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroSection } from './IntroSection';
import { PartnersBanner } from '../../../../../types/public/partners-page';

jest.mock('../../../../../assets/images/public/partners-page/horses.png', () => 'fallback-background-image.png');

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

            expect(screen.getByText('Test Title')).toBeInTheDocument();
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

        //   it('should render empty title and description when banner is null', () => {
        //       render(<IntroSection banner={null} />);

        //       const heading = screen.getByRole('heading', { level: 1 });
        //       expect(heading).toBeInTheDocument();
        //       expect(heading.textContent).toBe('');

        //       const paragraph = document.querySelector('.subtitle');
        //       expect(paragraph).toBeInTheDocument();
        //       expect(paragraph?.textContent).toBe('');
        //   });

        it('should render the fallback background image', () => {
            render(<IntroSection banner={null} />);

            const image = screen.getByRole('img', { name: /Horses/i });
            expect(image).toHaveAttribute('src', 'fallback-background-image.png');
        });

        it('should have the correct base CSS classes', () => {
            render(<IntroSection banner={null} />);

            const container = document.querySelector('.partners-intro-block');
            expect(container).toBeInTheDocument();

            const image = screen.getByRole('img', { name: /Horses/i });
            expect(image).toHaveClass('background-img-partners');

            const title = document.querySelector('.main-title');
            expect(title).toBeInTheDocument();

            const subtitle = document.querySelector('.subtitle');
            expect(subtitle).toBeInTheDocument();
        });
    });
});
