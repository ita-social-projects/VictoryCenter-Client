import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { StoriesOfVictorySection } from './StoriesOfVictorySection';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@/services/api/public/feedback/feedback-api', () => ({
    PublicFeedbackApi: { fetchLatestHistories: jest.fn(), fetchVideos: jest.fn() },
}));

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: (_localizations: unknown, fallback: unknown) => fallback,
}));

let mockCurrentLanguage = 'uk';
jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage }),
}));

const mockedUseDataFetch = useDataFetch as jest.Mock;

const article = (id: number, image: string | null = 'img.jpg', story = 's') => ({
    id,
    title: `title-${id}`,
    story,
    image,
});

const mockFetches = (histories: unknown[], isLoading = false, error: unknown = null) => {
    mockedUseDataFetch.mockReturnValue({ data: histories, isLoading, error });
};

const renderSection = () =>
    render(
        <MemoryRouter>
            <StoriesOfVictorySection />
        </MemoryRouter>,
    );

describe('StoriesOfVictorySection', () => {
    beforeEach(() => {
        mockedUseDataFetch.mockReset();
        mockCurrentLanguage = 'uk';
    });

    it('shows an error message when fetching stories fails', () => {
        mockFetches([], false, new Error('fail'));
        renderSection();
        expect(screen.getByRole('alert')).toHaveTextContent('SUCCESS_STORIES.LOADING_ERROR');
    });

    it('links to the localized stories page for English', () => {
        mockCurrentLanguage = 'en';
        mockFetches([article(1)]);
        renderSection();
        expect(screen.getByRole('link', { name: 'SUCCESS_STORIES.ALL_STORIES' })).toHaveAttribute(
            'href',
            '/en/stories',
        );
    });

    it('renders nothing while loading', () => {
        mockFetches([], true);
        const { container } = renderSection();
        expect(container.querySelector('section')).toBeNull();
    });

    it('renders nothing when there are no stories', () => {
        mockFetches([]);
        const { container } = renderSection();
        expect(container.querySelector('section')).toBeNull();
    });

    it('renders stories in the order returned by the backend', () => {
        mockFetches([article(5), article(3), article(4), article(2)]);
        const { container } = renderSection();

        expect(screen.getByText('SUCCESS_STORIES.TITLE')).toBeInTheDocument();
        expect(screen.getAllByRole('img')).toHaveLength(4);
        const images = Array.from(container.querySelectorAll('img'));
        expect(images.map((image) => image.alt)).toEqual(['title-5', 'title-3', 'title-4', 'title-2']);
        expect(screen.queryByText('title-5')).not.toBeInTheDocument();
    });

    it('skips stories without an image', () => {
        mockFetches([article(1, null)]);
        renderSection();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('opens all stories in a new tab', () => {
        mockFetches([article(1)]);
        renderSection();
        const link = screen.getByRole('link', { name: 'SUCCESS_STORIES.ALL_STORIES' });
        expect(link).toHaveAttribute('href', '/stories');
        expect(link).toHaveAttribute('target', '_blank');
    });
});
