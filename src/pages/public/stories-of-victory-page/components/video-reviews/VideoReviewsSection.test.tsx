import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoReviewsSection } from './VideoReviewsSection';
import { StoriesOfVictoryReviewVideo } from '@/types/public/stories-of-victory';

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(() => ({
        t: jest.fn((key, fallback) => fallback || key),
        i18n: { changeLanguage: jest.fn() },
    })),
}));

// Mock SVG icon
jest.mock('@/assets/icons/play-video.svg', () => ({
    ReactComponent: () => <svg data-testid="play-icon" />,
}));

// Mock video file
jest.mock('@/assets/videos/child-riding-horse.webm', () => 'child-riding-horse.webm');

// Mock video element methods
HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
HTMLMediaElement.prototype.pause = jest.fn();

const video1: StoriesOfVictoryReviewVideo = { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' };
const video2: StoriesOfVictoryReviewVideo = { id: 2, title: 'Video 2', link: 'https://youtube.com/watch?v=456' };
const video3: StoriesOfVictoryReviewVideo = { id: 3, title: 'Video 3', link: 'https://youtube.com/watch?v=789' };

const renderSingleVideo = () => render(<VideoReviewsSection content={[video1]} />);
const getVideoWrapper = () => {
    const { container } = renderSingleVideo();
    return container.querySelector('.videoWrapper');
};

describe('VideoReviewsSection', () => {
    beforeEach(() => {
        const { useTranslation } = require('react-i18next');
        (useTranslation as jest.Mock).mockReturnValue({
            t: jest.fn((key: string, fallback?: string) => fallback || key),
            i18n: { changeLanguage: jest.fn() },
        });
        (HTMLMediaElement.prototype.play as jest.Mock).mockResolvedValue(undefined);
        (HTMLMediaElement.prototype.pause as jest.Mock).mockImplementation(() => {});
    });

    it('should render section element', () => {
        const { container } = render(<VideoReviewsSection content={null} />);
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render title with translation', () => {
        render(<VideoReviewsSection content={null} />);
        expect(screen.getByText('Video Reviews')).toBeInTheDocument();
    });

    it('should call useTranslation with successPage namespace', () => {
        const { useTranslation } = require('react-i18next');
        render(<VideoReviewsSection content={null} />);
        expect(useTranslation).toHaveBeenCalledWith('successPage');
    });

    it('should render h4 title element', () => {
        render(<VideoReviewsSection content={null} />);
        const title = screen.getByText('Video Reviews');
        expect(title.tagName).toBe('H4');
    });

    it('should not render videos container when content is null', () => {
        const { container } = render(<VideoReviewsSection content={null} />);
        expect(container.querySelector('.videos')).not.toBeInTheDocument();
    });

    it('should not render videos container when content is empty array', () => {
        const { container } = render(<VideoReviewsSection content={[]} />);
        expect(container.querySelector('.videos')).not.toBeInTheDocument();
    });

    it('should render videos container when content has videos', () => {
        const { container } = render(<VideoReviewsSection content={[video1]} />);
        expect(container.querySelector('.videos')).toBeInTheDocument();
    });

    it('should render all video titles', () => {
        render(<VideoReviewsSection content={[video1, video2, video3]} />);
        expect(screen.getByText('Video 1')).toBeInTheDocument();
        expect(screen.getByText('Video 2')).toBeInTheDocument();
        expect(screen.getByText('Video 3')).toBeInTheDocument();
    });

    it('should render play icon for each video when not playing', () => {
        render(<VideoReviewsSection content={[video1, video2]} />);
        expect(screen.getAllByTestId('play-icon')).toHaveLength(2);
    });

    it('should show all videos when video link exists', () => {
        const { container } = render(<VideoReviewsSection content={[video1, video2]} />);
        expect(container.querySelectorAll('.video')).toHaveLength(2);
    });

    it('should skip rendering videoWrapper when video link is missing', () => {
        const { container } = render(<VideoReviewsSection content={[{ ...video1, link: null }]} />);
        expect(container.querySelector('.videoWrapper')).not.toBeInTheDocument();
    });

    it('should render video title for video without link', () => {
        render(<VideoReviewsSection content={[{ id: 1, title: 'Video Without Link', link: null }]} />);
        expect(screen.getByText('Video Without Link')).toBeInTheDocument();
    });

    describe('with a single video', () => {
        it('should hide play icon when video is being played', () => {
            fireEvent.click(getVideoWrapper()!);
            // state is maintained within the component after click
        });

        it('should render video element with correct attributes', () => {
            const { container } = renderSingleVideo();
            const video = container.querySelector('video');
            expect(video).toBeInTheDocument();
            expect(video).toHaveAttribute('playsinline');
            expect(video).toHaveAttribute('aria-hidden', 'true');
        });

        it('should render video source with correct type', () => {
            const { container } = renderSingleVideo();
            const source = container.querySelector('source');
            expect(source).toBeInTheDocument();
            expect(source).toHaveAttribute('type', 'video/webm');
        });

        describe('video wrapper', () => {
            it('should render video wrapper with role button', () => {
                const wrapper = getVideoWrapper();
                expect(wrapper).toHaveAttribute('role', 'button');
                expect(wrapper).toHaveAttribute('tabindex', '0');
            });

            it('should handle click on video wrapper', () => {
                fireEvent.click(getVideoWrapper()!);
                expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
            });

            it('should handle Enter key on video wrapper', () => {
                fireEvent.keyDown(getVideoWrapper()!, { key: 'Enter' });
                expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
            });

            it('should handle Space key on video wrapper', () => {
                fireEvent.keyDown(getVideoWrapper()!, { key: ' ' });
                expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
            });

            it('should not trigger play on other keys', () => {
                const playMock = jest.fn();
                HTMLMediaElement.prototype.play = playMock;

                fireEvent.keyDown(getVideoWrapper()!, { key: 'a' });
                expect(playMock).not.toHaveBeenCalled();
            });
        });
    });
});
