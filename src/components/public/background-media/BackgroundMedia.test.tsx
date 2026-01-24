import { render, screen } from '@testing-library/react';
import { BackgroundMedia } from './BackgroundMedia';

jest.mock('./media-overlay', () => ({
    MediaOverlay: (props: any) => <div data-testid="media-overlay-mock" data-props={JSON.stringify(props)} />,
}));

describe('BackgroundMedia', () => {
    it('renders video element for .mp4 url with correct attributes', () => {
        const { container } = render(<BackgroundMedia mediaUrl="assets/video.mp4" />);
        const video = container.querySelector('video') as HTMLVideoElement;

        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', 'assets/video.mp4');
        expect(video).toHaveAttribute('autoplay');
        expect(video.muted).toBe(true);
        expect(video).toHaveAttribute('loop');
        expect(video).toHaveAttribute('playsinline');
        expect(video).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders video element for .webm url', () => {
        const { container } = render(<BackgroundMedia mediaUrl="assets/video.webm" />);
        const video = container.querySelector('video');

        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', 'assets/video.webm');
    });

    it('renders image div for non-video url', () => {
        const { container } = render(<BackgroundMedia mediaUrl="assets/image.jpg" />);
        const image = container.querySelector('[aria-hidden="true"]:not(video)');
        const video = container.querySelector('video');

        expect(video).not.toBeInTheDocument();
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('aria-hidden', 'true');
        expect(image).toHaveAttribute('style');
    });

    it('renders MediaOverlay', () => {
        render(<BackgroundMedia mediaUrl="test.jpg" />);
        const overlay = screen.getByTestId('media-overlay-mock');

        expect(overlay).toBeInTheDocument();
    });

    it('passes overlay configuration props to MediaOverlay', () => {
        const overlayConfig = { opacity: 0.5, color: 'red', blur: 10 };
        render(<BackgroundMedia mediaUrl="test.jpg" overlay={overlayConfig} />);

        const overlay = screen.getByTestId('media-overlay-mock');
        const passedProps = JSON.parse(overlay.getAttribute('data-props') || '{}');

        expect(passedProps).toEqual(overlayConfig);
    });
});
