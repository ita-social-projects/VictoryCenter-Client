import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import aboutUsPageUk from '@/locales/uk/about-us.json';
import { OurMission } from './OurMission';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import {
    createRelevantAboutUsUkLocalization,
    setupUseGetLocalizationAboutUsContentMock,
} from '@/utils/test-mocks/use-get-localization-mock';

jest.mock('@/assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-icon" {...props} />,
}));

jest.mock('@/const/public/routes', () => ({
    PUBLIC_ROUTES: {
        PROGRAMS: {
            FULL: '/programs',
        },
    },
}));

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));

const mockedUseGetLocalization = useGetLocalization as jest.Mock;

describe('OurMission component', () => {
    beforeEach(() => {
        setupUseGetLocalizationAboutUsContentMock(mockedUseGetLocalization);
    });

    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Description,
            description: 'Test description',
            title: null,
            id: 1,
            image: null,
            localizations: [],
        },
    ];

    it('should render the mission title', () => {
        render(
            <MemoryRouter>
                <OurMission content={Content} />
            </MemoryRouter>,
        );
        expect(screen.getByText(aboutUsPageUk.WHAT_WE_DO)).toBeInTheDocument();
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
        const link = screen.getByRole('link', { name: aboutUsPageUk.GO_TO_PROGRAMS });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/programs');
        expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
    });

    it('should render localized description when localizations are provided', () => {
        const contentWithLocalization = [
            {
                ...Content[0],
                localizations: [
                    createRelevantAboutUsUkLocalization({ description: 'Localized description', title: null }),
                ],
            },
        ];

        render(
            <MemoryRouter>
                <OurMission content={contentWithLocalization} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Localized description')).toBeInTheDocument();
    });
});
