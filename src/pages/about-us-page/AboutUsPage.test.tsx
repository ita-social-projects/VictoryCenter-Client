import { render, screen } from '@testing-library/react';
import { AboutUsPage } from './AboutUsPage';
import * as Intro from './intro-section/IntroSection';
import * as Mission from './our-mission/OurMission';
import * as Support from './support-section/SupportSection';
import * as Values from './company-values/CompanyValues';
import * as Team from './our-team-section/OurTeam';
import * as Main from './main-value/MainValue';
import * as Donate from './donate-section/DonateSection';

jest.mock('./intro-section/IntroSection', () => ({
    AboutUsIntro: () => <div data-testid="intro-section">Intro Section</div>
}));
jest.mock('./our-mission/OurMission', () => ({
    OurMission: () => <div data-testid="mission-section">Mission Section</div>
}));
jest.mock('./support-section/SupportSection', () => ({
    SupportSection: () => <div data-testid="support-section">Support Section</div>
}));
jest.mock('./company-values/CompanyValues', () => ({
    CompanyValues: () => <div data-testid="values-section">Company Values</div>
}));
jest.mock('./our-team-section/OurTeam', () => ({
    OurTeam: () => <div data-testid="team-section">Our Team</div>
}));
jest.mock('./main-value/MainValue', () => ({
    MainValues: () => <div data-testid="main-values-section">Main Values</div>
}));
jest.mock('./donate-section/DonateSection', () => ({
    DonateSection: () => <div data-testid="donate-section">Donate Section</div>
}));

describe('AboutUsPage', () => {
    beforeEach(() => {
        render(<AboutUsPage />);
    });

    test('should render IntroSection', () => {
        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    });

    test('should render OurMission section', () => {
        expect(screen.getByTestId('mission-section')).toBeInTheDocument();
    });

    test('should render SupportSection', () => {
        expect(screen.getByTestId('support-section')).toBeInTheDocument();
    });

    test('should render CompanyValues section', () => {
        expect(screen.getByTestId('values-section')).toBeInTheDocument();
    });

    test('should render OurTeam section', () => {
        expect(screen.getByTestId('team-section')).toBeInTheDocument();
    });

    test('should render MainValues section', () => {
        expect(screen.getByTestId('main-values-section')).toBeInTheDocument();
    });

    test('should render DonateSection', () => {
        expect(screen.getByTestId('donate-section')).toBeInTheDocument();
    });
});
