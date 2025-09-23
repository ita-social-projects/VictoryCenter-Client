import { render, screen } from '@testing-library/react';
import { AboutUsPage } from './AboutUsPage';

jest.mock('./intro-section/AboutUsIntro', () => ({
    AboutUsIntro: () => <div data-testid="intro-section">About Us Intro</div>,
}));
jest.mock('./our-mission/OurMission', () => ({
    OurMission: () => <div data-testid="mission-section">Mission Section</div>,
}));
jest.mock('./support-section/SupportSection', () => ({
    SupportSection: () => <div data-testid="support-section">Support Section</div>,
}));
jest.mock('./company-values/CompanyValues', () => ({
    CompanyValues: () => <div data-testid="values-section">Company Values</div>,
}));
jest.mock('./our-team-section/OurTeam', () => ({
    OurTeam: () => <div data-testid="team-section">Our Team</div>,
}));
jest.mock('./main-value/MainValue', () => ({
    MainValues: () => <div data-testid="main-values-section">Main Values</div>,
}));
jest.mock('./donate-section/DonateSection', () => ({
    DonateSection: () => <div data-testid="donate-section">Donate Section</div>,
}));
jest.mock('./scrollable-frame/ScrollableFrame', () => ({
    ScrollableFrame: () => <div data-testid="scrollable-frame">Scrollable Frame</div>,
}));

describe('AboutUsPage', () => {
    it('should render IntroSection', () => {
        render(<AboutUsPage />);
        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(screen.getByTestId('mission-section')).toBeInTheDocument();
        expect(screen.getByTestId('support-section')).toBeInTheDocument();
        expect(screen.getByTestId('values-section')).toBeInTheDocument();
        expect(screen.getByTestId('team-section')).toBeInTheDocument();
        expect(screen.getByTestId('main-values-section')).toBeInTheDocument();
        expect(screen.getByTestId('donate-section')).toBeInTheDocument();
        expect(screen.getByTestId('scrollable-frame')).toBeInTheDocument();
    });
});
