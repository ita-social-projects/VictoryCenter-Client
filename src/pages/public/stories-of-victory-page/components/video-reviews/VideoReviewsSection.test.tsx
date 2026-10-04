import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoReviewsSection } from './VideoReviewsSection';
import { StoriesOfVictoryReviewVideo } from '@/types/public/stories-of-victory';
import { TranslationStatus } from '@/types/common/language';

let mockCurrentLanguage = 'uk';
jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/assets/icons/play-video.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="play-icon" {...props} />,
}));

jest.mock('@/assets/images/woman-leaning-on-horse.webp', () => 'fallback-thumbnail.webp');

const youTubeVideo: StoriesOfVictoryReviewVideo = {
    id: 1,
    title: 'Коні лікують 2025',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};
const facebookVideo: StoriesOfVictoryReviewVideo = {
    id: 2,
    title: 'Відео з Facebook',
    link: 'https://www.facebook.com/watch/?v=123456789',
};

const getThumbnail = (container: HTMLElement) => container.querySelector('img')!;

describe('VideoReviewsSection', () => {
    afterEach(() => {
        mockCurrentLanguage = 'uk';
    });

    it('renders the localized section title', () => {
        render(<VideoReviewsSection content={[youTubeVideo]} />);

        expect(screen.getByRole('heading', { name: 'VIDEO_SECTION.TITLE' })).toBeInTheDocument();
    });

    it.each([[null], [[]]])('hides the whole section, including its title, when content is %p', (content) => {
        const { container } = render(<VideoReviewsSection content={content} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders a card with a thumbnail, a play button and a caption for each video', () => {
        render(<VideoReviewsSection content={[youTubeVideo, facebookVideo]} />);

        expect(screen.getAllByTestId('play-icon')).toHaveLength(2);
        expect(screen.getByText('Коні лікують 2025')).toBeInTheDocument();
        expect(screen.getByText('Відео з Facebook')).toBeInTheDocument();
    });

    it('opens the video on its original platform in a new tab', () => {
        render(<VideoReviewsSection content={[youTubeVideo]} />);

        const link = screen.getByRole('link', { name: 'Коні лікують 2025' });
        expect(link).toHaveAttribute('href', youTubeVideo.link);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toContainElement(screen.getByTestId('play-icon'));
    });

    it('uses the YouTube thumbnail for YouTube links', () => {
        const { container } = render(<VideoReviewsSection content={[youTubeVideo]} />);

        expect(getThumbnail(container)).toHaveAttribute('src', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        expect(getThumbnail(container)).toHaveClass('youTubeThumbnail');
    });

    it('uses the fallback thumbnail without the YouTube crop for non-YouTube links', () => {
        const { container } = render(<VideoReviewsSection content={[facebookVideo]} />);

        expect(getThumbnail(container)).toHaveAttribute('src', 'fallback-thumbnail.webp');
        expect(getThumbnail(container)).not.toHaveClass('youTubeThumbnail');
    });

    it('switches to the uncropped fallback thumbnail when the YouTube thumbnail fails to load', () => {
        const { container } = render(<VideoReviewsSection content={[youTubeVideo]} />);

        fireEvent.error(getThumbnail(container));

        expect(getThumbnail(container)).toHaveAttribute('src', 'fallback-thumbnail.webp');
        expect(getThumbnail(container)).not.toHaveClass('youTubeThumbnail');
    });

    it("switches to the fallback thumbnail when YouTube returns its small 'no thumbnail' placeholder", () => {
        const { container } = render(<VideoReviewsSection content={[youTubeVideo]} />);
        const img = getThumbnail(container);
        Object.defineProperty(img, 'naturalWidth', { value: 120 });

        fireEvent.load(img);

        expect(getThumbnail(container)).toHaveAttribute('src', 'fallback-thumbnail.webp');
        expect(getThumbnail(container)).not.toHaveClass('youTubeThumbnail');
    });

    it('keeps a real YouTube thumbnail after it loads', () => {
        const { container } = render(<VideoReviewsSection content={[youTubeVideo]} />);
        const img = getThumbnail(container);
        Object.defineProperty(img, 'naturalWidth', { value: 480 });

        fireEvent.load(img);

        expect(getThumbnail(container)).toHaveAttribute('src', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('does not replace the fallback photo when it loads', () => {
        const { container } = render(<VideoReviewsSection content={[facebookVideo]} />);
        const img = getThumbnail(container);
        Object.defineProperty(img, 'naturalWidth', { value: 100 });

        fireEvent.load(img);

        expect(getThumbnail(container)).toHaveAttribute('src', 'fallback-thumbnail.webp');
    });

    it('renders the card without a link when the video has no link', () => {
        render(<VideoReviewsSection content={[{ ...youTubeVideo, link: null }]} />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByText('Коні лікують 2025')).toBeInTheDocument();
    });

    describe('localization', () => {
        it('shows the English caption on the English site and keeps the link', () => {
            mockCurrentLanguage = 'en';
            render(
                <VideoReviewsSection
                    content={[
                        {
                            ...youTubeVideo,
                            localizations: [
                                {
                                    language: { id: 2, code: 'en' },
                                    translationStatus: TranslationStatus.Relevant,
                                    title: 'Horses heal 2025',
                                },
                            ],
                        },
                    ]}
                />,
            );

            expect(screen.getByText('Horses heal 2025')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Horses heal 2025' })).toHaveAttribute('href', youTubeVideo.link);
        });

        it('falls back to the Ukrainian caption on the English site when there is no translation', () => {
            mockCurrentLanguage = 'en';
            render(<VideoReviewsSection content={[youTubeVideo]} />);

            expect(screen.getByText('Коні лікують 2025')).toBeInTheDocument();
        });
    });
});
