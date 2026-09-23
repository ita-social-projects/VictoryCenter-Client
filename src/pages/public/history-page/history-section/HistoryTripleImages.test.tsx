import { render, screen } from '@testing-library/react';
import { HistoryTripleImages } from './HistoryTripleImages';
import { Image } from '@/types/common/image';

const makeImage = (url: string): Image => ({ id: 1, url, mimeType: 'image/jpeg' });

describe('HistoryTripleImages', () => {
    it('should render all three images when provided', () => {
        const images = [makeImage('a.jpg'), makeImage('b.jpg'), makeImage('c.jpg')];
        render(<HistoryTripleImages images={images} />);

        const imgs = screen.getAllByRole('presentation');
        expect(imgs).toHaveLength(3);
        expect(imgs[0]).toHaveAttribute('src', 'a.jpg');
        expect(imgs[1]).toHaveAttribute('src', 'b.jpg');
        expect(imgs[2]).toHaveAttribute('src', 'c.jpg');
    });

    it('should skip null images', () => {
        render(<HistoryTripleImages images={[makeImage('a.jpg'), null, makeImage('c.jpg')]} />);

        expect(screen.getAllByRole('presentation')).toHaveLength(2);
    });

    it('should render nothing when all images are null', () => {
        render(<HistoryTripleImages images={[null, null, null]} />);

        expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });
});
