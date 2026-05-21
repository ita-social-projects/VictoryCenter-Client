import { render, screen } from '@testing-library/react';
import { HistoryQuadImages } from './HistoryQuadImages';
import { Image } from '@/types/common/image';

const makeImage = (id: number): Image => ({
    id,
    url: `https://example.com/img${id}.jpg`,
    mimeType: 'image/jpeg',
});

describe('HistoryQuadImages', () => {
    it('should render up to four images', () => {
        render(<HistoryQuadImages images={[makeImage(1), makeImage(2), makeImage(3), makeImage(4)]} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(4);
    });

    it('should skip null images and not render a cell for them', () => {
        render(<HistoryQuadImages images={[makeImage(1), null, makeImage(3), null]} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(2);
    });

    it('should apply elevated class to odd-indexed cells', () => {
        const { container } = render(
            <HistoryQuadImages images={[makeImage(1), makeImage(2), makeImage(3), makeImage(4)]} />,
        );

        const cells = container.querySelectorAll('[class*="cell"]');
        expect(cells[0]).not.toHaveClass('elevated');
        expect(cells[1]).toHaveClass('elevated');
        expect(cells[2]).not.toHaveClass('elevated');
        expect(cells[3]).toHaveClass('elevated');
    });

    it('should render nothing when all images are null', () => {
        render(<HistoryQuadImages images={[null, null, null, null]} />);

        expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });

    it('should render a single image when only one source is valid', () => {
        render(<HistoryQuadImages images={[makeImage(1), null, null, null]} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(1);
    });
});
