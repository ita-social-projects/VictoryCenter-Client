import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { OurTeam } from './OurTeam';
import aboutUsUk from '../../../../locales/uk/about-us.json';
import { checkForSubstrings } from '../../../../utils/functions/test-helpers/test-helpers';

jest.mock('../../../../assets/images/public/about-us-page/our-team.jpg', () => 'our-team.jpg');

jest.mock('../../../../const/public/routes', () => ({
    PUBLIC_ROUTES: {
        TEAM: {
            FULL: '/team',
        },
    },
}));

describe('OurTeam component', () => {
    it('should render the team image', () => {
        render(<OurTeam />, { wrapper: MemoryRouter });
        const img = screen.getByAltText('Our Team');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'our-team.jpg');
    });

    it('should render the team description', () => {
        render(<OurTeam />, { wrapper: MemoryRouter });
        checkForSubstrings(aboutUsUk['TEAM_DETAILS.FIRST_PART']);
        checkForSubstrings(aboutUsUk['TEAM_DETAILS.SECOND_PART']);
    });

    it('should render the link to team page', () => {
        render(<OurTeam />, { wrapper: MemoryRouter });
        const link = screen.getByRole('link', { name: aboutUsUk.GO_TO_TEAM });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/team');
    });
});
