import { render, screen } from '@testing-library/react';
import { HistoryHero } from './HistoryHero';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

jest.mock('../history-timeline/HistoryTimeline', () => ({
    HistoryTimeline: () => <div data-testid="history-timeline" />,
}));

describe('HistoryHero', () => {
    it('should render hero section with timeline', () => {
        render(<HistoryHero />);

        expect(screen.getByTestId('history-timeline')).toBeInTheDocument();
    });

    it('should render translated title and description', () => {
        render(<HistoryHero />);

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(screen.getByText('HERO_DESCRIPTION')).toBeInTheDocument();
    });
});
