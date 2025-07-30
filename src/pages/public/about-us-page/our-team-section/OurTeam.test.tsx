import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { OurTeam } from './OurTeam';

jest.mock('../../../../assets/images/public/about-us-images/our-team.jpg', () => 'our-team.jpg');

jest.mock('../../../../const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        TEAM_DETAILS: {
            FIRST_PART: 'Meet our dedicated team.',
            SECOND_PART: 'We work hard to bring you the best.',
        },
        GO_TO_TEAM: 'Go to team',
    },
}));

jest.mock('../../../../const/public/routes', () => ({
    PUBLIC_ROUTES: {
        TEAM: {
            FULL: '/team',
        },
    },
}));

describe('OurTeam component', () => {
    it('should render the team image', () => {
        render(
            <MemoryRouter>
                <OurTeam />
            </MemoryRouter>,
        );
        const img = screen.getByAltText('Our Team');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'our-team.jpg');
    });

    it('should render the team description', () => {
        render(
            <MemoryRouter>
                <OurTeam />
            </MemoryRouter>,
        );
        expect(screen.getByText(/meet our dedicated team/i)).toBeInTheDocument();
        expect(screen.getByText(/we work hard to bring you the best/i)).toBeInTheDocument();
    });

    it('should render the link to team page', () => {
        render(
            <MemoryRouter>
                <OurTeam />
            </MemoryRouter>,
        );
        const link = screen.getByRole('link', { name: /go to team/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/team');
    });
});
