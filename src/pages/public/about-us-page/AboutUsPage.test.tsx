import { render, screen, waitFor } from '@testing-library/react';
import { AboutUsPage } from './AboutUsPage';
import { AboutUsApi } from '@api/public/about-us/about-us-api';
import { AboutUsIntro } from './intro-section/IntroSection';
import { OurMission } from './our-mission/OurMission';
import { SupportSection } from './support-section/SupportSection';
import { OurTeam } from './our-team-section/OurTeam';
import { MainValues } from './main-value/MainValue';
import { SectionType } from '@app-types/common/about-us';

jest.mock('./intro-section/IntroSection');
jest.mock('./our-mission/OurMission');
jest.mock('./support-section/SupportSection');
jest.mock('./company-values/CompanyValues', () => ({
    CompanyValues: () => <div data-testid="values-section">Company Values</div>,
}));
jest.mock('./our-team-section/OurTeam');
jest.mock('./main-value/MainValue');
jest.mock('./donate-section/DonateSection', () => ({
    DonateSection: () => <div data-testid="donate-section">Donate Section</div>,
}));
jest.mock('@api/public/about-us/about-us-api');
jest.mock('./scrollable-frame/ScrollableFrame', () => ({
    ScrollableFrame: () => <div data-testid="scrollable-frame">Scrollable Frame</div>,
}));

const MockedAboutUsIntro = AboutUsIntro as jest.Mock;
const MockedOurMission = OurMission as jest.Mock;
const MockedSupportSection = SupportSection as jest.Mock;
const MockedOurTeam = OurTeam as jest.Mock;
const MockedMainValues = MainValues as jest.Mock;

describe('AboutUsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        MockedAboutUsIntro.mockImplementation(() => <div data-testid="intro-section" />);
        MockedOurMission.mockImplementation(() => <div data-testid="mission-section" />);
        MockedSupportSection.mockImplementation(() => <div data-testid="support-section" />);
        MockedOurTeam.mockImplementation(() => <div data-testid="team-section" />);
        MockedMainValues.mockImplementation(() => <div data-testid="main-values-section" />);
    });

    it('should render loader when data is loading', () => {
        (AboutUsApi.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
        render(<AboutUsPage />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error message when there is an error in fetching data', async () => {
        (AboutUsApi.get as jest.Mock).mockRejectedValue(new Error('some error'));
        render(<AboutUsPage />);
        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    describe('getContentBySection logic', () => {
        const mockContentMain = [{ id: 1, description: 'Main Content', title: null, image: null, imageId: null }];
        const mockContentMission = [{ id: 2, description: 'Mission Content', title: null, image: null, imageId: null }];

        it('should pass correct content to components when API returns full data', async () => {
            const mockFullSections = [
                { sectionType: SectionType.Main, contents: mockContentMain },
                { sectionType: SectionType.WhatWeDo, contents: mockContentMission },
            ];
            (AboutUsApi.get as jest.Mock).mockResolvedValue(mockFullSections);

            render(<AboutUsPage />);

            await waitFor(() => {
                expect(MockedAboutUsIntro).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: mockContentMain }),
                    undefined,
                );
                expect(MockedOurMission).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: mockContentMission }),
                    undefined,
                );
            });
        });

        it('should pass null to a component if its section is missing from API response', async () => {
            const mockPartialSections = [{ sectionType: SectionType.WhatWeDo, contents: mockContentMission }];
            (AboutUsApi.get as jest.Mock).mockResolvedValue(mockPartialSections);

            render(<AboutUsPage />);

            await waitFor(() => {
                expect(MockedAboutUsIntro).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: null }),
                    undefined,
                );
                expect(MockedOurMission).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: mockContentMission }),
                    undefined,
                );
            });
        });

        it('should pass null to a component if its section has no content', async () => {
            const mockEmptyContentSections = [
                { sectionType: SectionType.Main, contents: [] },
                { sectionType: SectionType.WhatWeDo, contents: mockContentMission },
            ];
            (AboutUsApi.get as jest.Mock).mockResolvedValue(mockEmptyContentSections);

            render(<AboutUsPage />);

            await waitFor(() => {
                expect(MockedAboutUsIntro).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: null }),
                    undefined,
                );
                expect(MockedOurMission).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: mockContentMission }),
                    undefined,
                );
            });
        });

        it('should pass null to all components if API returns an empty array', async () => {
            (AboutUsApi.get as jest.Mock).mockResolvedValue([]);

            render(<AboutUsPage />);

            await waitFor(() => {
                expect(MockedAboutUsIntro).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: null }),
                    undefined,
                );
                expect(MockedOurMission).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: null }),
                    undefined,
                );
                expect(MockedSupportSection).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: null }),
                    undefined,
                );
                expect(MockedOurTeam).toHaveBeenLastCalledWith(expect.objectContaining({ content: null }), undefined);
                expect(MockedMainValues).toHaveBeenLastCalledWith(
                    expect.objectContaining({ content: null }),
                    undefined,
                );

                expect(screen.getByTestId('intro-section')).toBeInTheDocument();
                expect(screen.getByTestId('mission-section')).toBeInTheDocument();
            });
        });
    });
});
