import { render, screen } from '@testing-library/react';
import { HistoryQuadImages } from './HistoryQuadImages';
import { Image } from '@/types/common/image';

const makeImage = (url: string): Image => ({ id: 1, url, mimeType: 'image/jpeg' });

describe('HistoryQuadImages', () => {
    it('should render all four images when provided', () => {
        const images = [makeImage('a.jpg'), makeImage('b.jpg'), makeImage('c.jpg'), makeImage('d.jpg')];
        render(<HistoryQuadImages images={images} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(4);
    });

    it('should skip null images', () => {
        render(<HistoryQuadImages images={[makeImage('a.jpg'), null, makeImage('c.jpg'), null]} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(2);
    });

    it('should render nothing when all images are null', () => {
        render(<HistoryQuadImages images={[null, null, null, null]} />);

        expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });
});
