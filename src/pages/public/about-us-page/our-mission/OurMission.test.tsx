import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { OurMission } from './OurMission';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';

jest.mock('../../../../assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-icon" {...props} />,
}));

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

    it('should render the mission description from content', () => {
        render(
            <MemoryRouter>
                <OurMission content={Content} />
            </MemoryRouter>,
        );
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should use provided description prop', () => {
        render(
            <MemoryRouter>
                <OurMission description="Custom description" />
            </MemoryRouter>,
        );
        expect(screen.getByText('Custom description')).toBeInTheDocument();
    });

    it('should render the link with correct text, href and icon', () => {
        render(
            <MemoryRouter>
                <OurMission content={Content} />
            </MemoryRouter>,
        );
        const link = screen.getByRole('link', { name: /go to programs/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/programs');
        expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
    });

    it('should render link without href when navigate is false', () => {
        render(
            <MemoryRouter>
                <OurMission content={Content} navigate={false} />
            </MemoryRouter>,
        );
        const link = screen.getByRole('link', { name: /go to programs/i });
        expect(link).toHaveAttribute('href', '/');
    });

    it('should apply additional className to root element', () => {
        const { container } = render(
            <MemoryRouter>
                <OurMission content={Content} className="custom-class" />
            </MemoryRouter>,
        );
        const root = container.querySelector('.our-mission-block');
        expect(root).toHaveClass('custom-class');
    });
});
