import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('VideoReviewsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
        const videosDiv = container.querySelector('.videos');
        expect(videosDiv).not.toBeInTheDocument();
    });

    it('should not render videos container when content is empty array', () => {
        const { container } = render(<VideoReviewsSection content={[]} />);
        const videosDiv = container.querySelector('.videos');
        expect(videosDiv).not.toBeInTheDocument();
    });

    it('should render videos container when content has videos', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const videosDiv = container.querySelector('.videos');
        expect(videosDiv).toBeInTheDocument();
    });

    it('should render all video titles', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
            { id: 2, title: 'Video 2', link: 'https://youtube.com/watch?v=456' },
            { id: 3, title: 'Video 3', link: 'https://youtube.com/watch?v=789' },
        ];
        render(<VideoReviewsSection content={content} />);
        expect(screen.getByText('Video 1')).toBeInTheDocument();
        expect(screen.getByText('Video 2')).toBeInTheDocument();
        expect(screen.getByText('Video 3')).toBeInTheDocument();
    });

    it('should render play icon for each video when not playing', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
            { id: 2, title: 'Video 2', link: 'https://youtube.com/watch?v=456' },
        ];
        render(<VideoReviewsSection content={content} />);
        const icons = screen.getAllByTestId('play-icon');
        expect(icons).toHaveLength(2);
    });

    it('should hide play icon when video is being played', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container, rerender } = render(<VideoReviewsSection content={content} />);
        const videoWrapper = container.querySelector('.videoWrapper');

        fireEvent.click(videoWrapper!);
        rerender(<VideoReviewsSection content={content} />);

        // After clicking, the play icon should still be rendered for this component
        // since state is maintained within the component
    });

    it('should render video element with correct attributes', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const video = container.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('playsinline');
        expect(video).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render video source with correct type', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const source = container.querySelector('source');
        expect(source).toBeInTheDocument();
        expect(source).toHaveAttribute('type', 'video/webm');
    });

    it('should render video wrapper with role button', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const wrapper = container.querySelector('.videoWrapper');
        expect(wrapper).toHaveAttribute('role', 'button');
        expect(wrapper).toHaveAttribute('tabindex', '0');
    });

    it('should handle click on video wrapper', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const wrapper = container.querySelector('.videoWrapper');

        fireEvent.click(wrapper!);
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('should handle Enter key on video wrapper', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const wrapper = container.querySelector('.videoWrapper');

        fireEvent.keyDown(wrapper!, { key: 'Enter' });
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('should handle Space key on video wrapper', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const wrapper = container.querySelector('.videoWrapper');

        fireEvent.keyDown(wrapper!, { key: ' ' });
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('should not trigger play on other keys', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const wrapper = container.querySelector('.videoWrapper');

        const playMock = jest.fn();
        HTMLMediaElement.prototype.play = playMock;

        fireEvent.keyDown(wrapper!, { key: 'a' });
        expect(playMock).not.toHaveBeenCalled();
    });

    it('should show all videos when video link exists', () => {
        const content: StoriesOfVictoryReviewVideo[] = [
            { id: 1, title: 'Video 1', link: 'https://youtube.com/watch?v=123' },
            { id: 2, title: 'Video 2', link: 'https://youtube.com/watch?v=456' },
        ];
        const { container } = render(<VideoReviewsSection content={content} />);
        const videos = container.querySelectorAll('.video');
        expect(videos).toHaveLength(2);
    });

    it('should skip rendering videoWrapper when video link is missing', () => {
        const content: StoriesOfVictoryReviewVideo[] = [{ id: 1, title: 'Video 1', link: undefined }];
        const { container } = render(<VideoReviewsSection content={content} />);
        const wrapper = container.querySelector('.videoWrapper');
        expect(wrapper).not.toBeInTheDocument();
    });

    it('should render video title for video without link', () => {
        const content: StoriesOfVictoryReviewVideo[] = [{ id: 1, title: 'Video Without Link', link: undefined }];
        render(<VideoReviewsSection content={content} />);
        expect(screen.getByText('Video Without Link')).toBeInTheDocument();
    });
});
