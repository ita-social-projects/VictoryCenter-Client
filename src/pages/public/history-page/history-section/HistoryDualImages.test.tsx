import { render, screen } from '@testing-library/react';
import { HistoryDualImages } from './HistoryDualImages';
import { Image } from '@/types/common/image';

const IMG1: Image = { id: 1, url: 'https://example.com/img1.jpg', mimeType: 'image/jpeg' };
const IMG2: Image = { id: 2, url: 'https://example.com/img2.jpg', mimeType: 'image/jpeg' };

describe('HistoryDualImages', () => {
    it('should render two images when both sources are valid', () => {
        render(<HistoryDualImages images={[IMG1, IMG2]} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(2);
    });

    it('should render only the first image when the second is null', () => {
        render(<HistoryDualImages images={[IMG1, null]} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(1);
        expect(screen.getByRole('presentation')).toHaveAttribute('src', IMG1.url);
    });

    it('should render nothing when both images are null', () => {
        render(<HistoryDualImages images={[null, null]} />);

        expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });

    it('should apply elevated class to the second image cell', () => {
        const { container } = render(<HistoryDualImages images={[IMG1, IMG2]} />);

        const cells = container.querySelectorAll('[class*="cell"]');
        expect(cells[1]).toHaveClass('elevated');
        expect(cells[0]).not.toHaveClass('elevated');
    });

    it('should render only the elevated second cell when the first image is null', () => {
        const { container } = render(<HistoryDualImages images={[null, IMG2]} />);

        const imgs = screen.getAllByRole('presentation');
        expect(imgs).toHaveLength(1);
        expect(container.querySelector('[class*="elevated"]')).toBeInTheDocument();
    });
});
