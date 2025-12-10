import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OurTeam } from './OurTeam';
import { AboutUsContent } from '@/types/public/about-us-page';
import { ContentType } from '@/types/common/about-us';
import { aboutUsPageUk } from '@/locales/uk';
import defaultOurTeamImage from '@/assets/images/public/about-us-page/our-team.jpg';

jest.mock('@/const/public/routes', () => ({
    PUBLIC_ROUTES: {
        TEAM: {
            FULL: '/team',
        },
    },
}));

describe('OurTeam component', () => {
    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Description,
            description: 'Test description',
            title: null,
            id: 1,
            image: null,
        },
        {
            contentType: ContentType.Image,
            image: {
                id: null,
                url: 'image.jpg',
                mimeType: 'image.jpeg',
            },
            description: null,
            title: null,
            id: 1,
        },
    ];

    it('should render the default team image', () => {
        render(
            <MemoryRouter>
                <OurTeam />
            </MemoryRouter>,
        );

        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', `${defaultOurTeamImage}`);
    });

    it('should render the custom image', () => {
        render(
            <MemoryRouter>
                <OurTeam content={Content} />
            </MemoryRouter>,
        );

        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'image.jpg');
    });

    it('should render the provided description', () => {
        render(
            <MemoryRouter>
                <OurTeam content={Content} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render the link to team page', () => {
        render(
            <MemoryRouter>
                <OurTeam />
            </MemoryRouter>,
        );

        const link = screen.getByRole('link', { name: aboutUsPageUk.GO_TO_TEAM });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/team');
    });
});
