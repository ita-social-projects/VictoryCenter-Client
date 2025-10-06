import { render, screen } from '@testing-library/react';
import { SupportSectionResponsive } from './SupportSectionResponsive';

jest.mock('../../../../../const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        SUPPORT_TITLE: 'Підтримка наших цінностей',
        SUPPORT_DATA: [
            {
                IMG: 'img1.jpg',
                ALT: 'Alt 1',
                DESCRIPTION: 'Description 1',
            },
            {
                IMG: 'img2.jpg',
                ALT: 'Alt 2',
                DESCRIPTION: 'Description 2',
            },
            {
                IMG: 'img3.jpg',
                ALT: 'Alt 3',
                DESCRIPTION: 'Description 3',
            },
            {
                IMG: 'img4.jpg',
                ALT: 'Alt 4',
                DESCRIPTION: 'Description 4',
            },
        ],
    },
}));

describe('SupportSectionResponsive component', () => {
    it('should render main support title', () => {
        render(<SupportSectionResponsive />);
        expect(screen.getByText('Підтримка наших цінностей')).toBeInTheDocument();
    });

    it('should render support card images with correct alt texts', () => {
        render(<SupportSectionResponsive />);
        ['Alt 1', 'Alt 2', 'Alt 3', 'Alt 4'].forEach((alt) => {
            expect(screen.getByAltText(alt)).toBeInTheDocument();
        });
    });

    it('should render support card descriptions correctly', () => {
        render(<SupportSectionResponsive />);
        ['Description 1', 'Description 2', 'Description 3', 'Description 4'].forEach((desc) => {
            expect(screen.getByText(desc)).toBeInTheDocument();
        });
    });
});
