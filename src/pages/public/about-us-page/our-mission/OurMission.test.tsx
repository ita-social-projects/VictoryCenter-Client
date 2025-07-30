import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { OurMission } from './OurMission';

jest.mock('../../../../const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        WHAT_WE_DO: 'What we do title',
        WHAT_WE_DO_DETAILS: 'These are the details of what we do.',
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

jest.mock('../../../../assets/icons/arrow-up-right.svg', () => 'arrow-up-right.svg');

jest.mock('../../../../components/public/programs/scrollable-frame/ScrollableFrame', () => ({
    ScrollableFrame: () => <div data-testid="scrollable-frame">ScrollableFrame</div>,
}));

describe('OurMission component', () => {
    it('should render the mission title', () => {
        render(
            <MemoryRouter>
                <OurMission />
            </MemoryRouter>,
        );
        expect(screen.getByText('What we do title')).toBeInTheDocument();
    });

    it('should render the mission details', () => {
        render(
            <MemoryRouter>
                <OurMission />
            </MemoryRouter>,
        );
        expect(screen.getByText('These are the details of what we do.')).toBeInTheDocument();
    });

    it('should render the link with correct text and href', () => {
        render(
            <MemoryRouter>
                <OurMission />
            </MemoryRouter>,
        );
        const link = screen.getByRole('link', { name: /go to programs/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/programs');
    });

    it('should render the ScrollableFrame component', () => {
        render(
            <MemoryRouter>
                <OurMission />
            </MemoryRouter>,
        );
        expect(screen.getByTestId('scrollable-frame')).toBeInTheDocument();
    });
});
