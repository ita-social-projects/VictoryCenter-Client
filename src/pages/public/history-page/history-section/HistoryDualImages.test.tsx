import { render, screen } from '@testing-library/react';
import { HistoryDualImages } from './HistoryDualImages';
import { Image } from '@/types/common/image';

const makeImage = (url: string): Image => ({ id: 1, url, mimeType: 'image/jpeg' });

describe('HistoryDualImages', () => {
    it('should render both images when provided', () => {
        render(<HistoryDualImages images={[makeImage('img1.jpg'), makeImage('img2.jpg')]} />);

        const imgs = screen.getAllByRole('presentation');
        expect(imgs).toHaveLength(2);
        expect(imgs[0]).toHaveAttribute('src', 'img1.jpg');
        expect(imgs[1]).toHaveAttribute('src', 'img2.jpg');
    });

    it('should render only first image when second is null', () => {
        render(<HistoryDualImages images={[makeImage('img1.jpg'), null]} />);

        const imgs = screen.getAllByRole('presentation');
        expect(imgs).toHaveLength(1);
    });

    it('should render nothing when both images are null', () => {
        render(<HistoryDualImages images={[null, null]} />);

        expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });
});
