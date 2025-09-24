import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import aboutUsUk from '../../../../locales/uk/about-us.json';
import { OurMission } from './OurMission';

jest.mock('../../../../assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-icon" {...props} />,
}));

jest.mock('../../../../const/public/routes', () => ({
    PUBLIC_ROUTES: {
        PROGRAMS: {
            FULL: '/programs',
        },
    },
}));

jest.mock('./scrollable-frame/ScrollableFrame', () => ({
    ScrollableFrame: () => <div data-testid="scrollable-frame">ScrollableFrame</div>,
}));

describe('OurMission component', () => {
    it('should render the mission title', () => {
        render(<OurMission />, { wrapper: MemoryRouter });
        expect(screen.getByText(aboutUsUk.WHAT_WE_DO)).toBeInTheDocument();
    });

    it('should render the mission details', () => {
        render(<OurMission />, { wrapper: MemoryRouter });
        expect(screen.getByText(aboutUsUk.WHAT_WE_DO_DETAILS)).toBeInTheDocument();
    });

    it('should render the link with correct text, href and icon', () => {
        render(<OurMission />, { wrapper: MemoryRouter });
        const link = screen.getByRole('link', { name: aboutUsUk.GO_TO_PROGRAMS });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/programs');
        expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
    });

    it('should render the ScrollableFrame component', () => {
        render(<OurMission />, { wrapper: MemoryRouter });
        expect(screen.getByTestId('scrollable-frame')).toBeInTheDocument();
    });
});
