import { render, screen } from '@testing-library/react';
import { HistoryTimeline } from './HistoryTimeline';

describe('HistoryTimeline', () => {
    it('should render all timeline dates', () => {
        render(<HistoryTimeline />);

        expect(screen.getByText('09/2023')).toBeInTheDocument();
        expect(screen.getByText('02/2025')).toBeInTheDocument();
        expect(screen.getByText('…')).toBeInTheDocument();
    });

    it('should render highlighted dates with active styling', () => {
        const { container } = render(<HistoryTimeline />);

        // Active dates have a date-line element inside them
        const dateLines = container.querySelectorAll('[class*="date-line"]');
        expect(dateLines.length).toBeGreaterThan(0);
    });

    it('should render photo cards for highlighted dates that have photos', () => {
        const { container } = render(<HistoryTimeline />);

        const photoCards = container.querySelectorAll('[class*="photo-card"]');
        expect(photoCards.length).toBeGreaterThan(0);
    });

    it('should render both left and right aligned photo cards', () => {
        const { container } = render(<HistoryTimeline />);

        expect(container.querySelectorAll('[class*="photo-card--left"]').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[class*="photo-card--right"]').length).toBeGreaterThan(0);
    });

    it('should render photo captions with translated name and role', () => {
        render(<HistoryTimeline />);

        // UK translations: PHOTO_NASTYA_DIRECTOR_NAME = "Настя", PHOTO_NASTYA_DIRECTOR_ROLE = "виконавчий директор"
        expect(screen.getAllByText(/Настя/).length).toBeGreaterThan(0);
        expect(screen.getByText(/виконавчий директор/)).toBeInTheDocument();
    });

    it('should render photo img elements with alt text containing name and role', () => {
        render(<HistoryTimeline />);

        // alt text format: "<name>, <role>"
        const directorPhoto = screen.getByAltText('Настя, виконавчий директор');
        expect(directorPhoto).toBeInTheDocument();
    });
});
