import { render, screen } from '@testing-library/react';
import { HistoryTimeline } from './HistoryTimeline';
import { HIGHLIGHTED_DATES } from '@/const/public/history-page';

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

describe('HistoryTimeline safe line variables', () => {
    const getDateCssVar = (date: string, varName: string) => screen.getByText(date).style.getPropertyValue(varName);

    it('applies --safe-director-line only to the entry flagged with safeLine', () => {
        render(<HistoryTimeline safeDirectorLine={50} />);

        expect(getDateCssVar('09/2023', '--safe-director-line')).toBe('50px');
    });

    it('does not apply --safe-director-line to left-side entries without safeLine', () => {
        render(<HistoryTimeline safeDirectorLine={50} />);

        expect(getDateCssVar('03/2024', '--safe-director-line')).toBe('');
    });

    it('keeps the config line length for entries without safeLine', () => {
        render(<HistoryTimeline safeDirectorLine={50} />);

        expect(getDateCssVar('03/2024', '--line-mobile')).toBe(`${HIGHLIGHTED_DATES['03/2024'].mobile}px`);
        expect(getDateCssVar('03/2024', '--line-xl')).toBe(`${HIGHLIGHTED_DATES['03/2024'].xl}px`);
    });

    it('does not apply --safe-director-line when safeDirectorLine is undefined', () => {
        render(<HistoryTimeline />);

        expect(getDateCssVar('09/2023', '--safe-director-line')).toBe('');
    });

    it('applies --safe-director-line when the value is 0', () => {
        render(<HistoryTimeline safeDirectorLine={0} />);

        expect(getDateCssVar('09/2023', '--safe-director-line')).toBe('0px');
    });

    it('applies --safe-topanchor-line only to the top-anchor entry', () => {
        render(<HistoryTimeline safeTopAnchorLine={120} />);

        expect(getDateCssVar('12/2023', '--safe-topanchor-line')).toBe('120px');
        expect(getDateCssVar('09/2023', '--safe-topanchor-line')).toBe('');
        expect(getDateCssVar('03/2024', '--safe-topanchor-line')).toBe('');
    });

    it('does not apply --safe-topanchor-line when safeTopAnchorLine is undefined', () => {
        render(<HistoryTimeline />);

        expect(getDateCssVar('12/2023', '--safe-topanchor-line')).toBe('');
    });

    it('does not set any custom properties on non-highlighted dates', () => {
        render(<HistoryTimeline safeDirectorLine={50} safeTopAnchorLine={120} />);

        expect(getDateCssVar('10/2023', '--line-mobile')).toBe('');
        expect(getDateCssVar('10/2023', '--safe-director-line')).toBe('');
        expect(getDateCssVar('10/2023', '--safe-topanchor-line')).toBe('');
    });
});
