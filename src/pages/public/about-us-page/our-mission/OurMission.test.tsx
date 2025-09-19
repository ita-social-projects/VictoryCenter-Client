import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { OurMission } from './OurMission';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';

jest.mock('../../../../const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        WHAT_WE_DO: 'What we do title',
        GO_TO_PROGRAMS: 'Go to programs',
    },
}));

jest.mock('../../../../const/public/routes', () => ({
    PUBLIC_ROUTES: {
        PROGRAMS: {
            FULL: '/programs',
        },
    },
}));

jest.mock('../../../../assets/icons/arrow-up-right.svg', () => 'arrow-up-black.png');

describe('OurMission component', () => {
    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Description,
            description: 'Test description',
            title: null,
            id: 1,
            image: null,
        },
    ];

    it('should render the mission title', () => {
        render(
            <MemoryRouter>
                <OurMission content={Content} />
            </MemoryRouter>,
        );
        expect(screen.getByText(ABOUT_US_DATA.WHAT_WE_DO)).toBeInTheDocument();
    });

    it('should render the mission description', () => {
        render(
            <MemoryRouter>
                <OurMission content={Content} />
            </MemoryRouter>,
        );
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render the link with correct text and href', () => {
        render(
            <MemoryRouter>
                <OurMission content={Content} />
            </MemoryRouter>,
        );
        const link = screen.getByRole('link', { name: /go to programs/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/programs');
    });
});
