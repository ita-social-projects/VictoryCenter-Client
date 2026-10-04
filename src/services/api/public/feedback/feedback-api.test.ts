import { PublicFeedbackApi, storiesOfVictoryPageDataFetch } from './feedback-api';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { TranslationStatus } from '@/types/common/language';

jest.mock('@/services/api/axios');

const english = { id: 2, code: 'en' };

const historyDto = {
    id: 1,
    title: 'Історія',
    story: 'Текст історії',
    image: { id: 5, url: 'https://example.com/a.jpg', mimeType: 'image/jpeg' },
    priority: 0,
    localizations: [
        {
            entityId: 1,
            localizationInfoDto: english,
            translationStatus: TranslationStatus.Relevant,
            title: 'Story',
            story: 'Story text',
        },
    ],
};

const reviewDto = {
    id: 2,
    authorName: 'Олена',
    text: 'Дякуємо',
    priority: 0,
    localizations: [
        {
            entityId: 2,
            localizationInfoDto: english,
            translationStatus: TranslationStatus.Outdated,
            authorName: 'Olena',
            text: 'Thanks',
        },
    ],
};

const videoDto = {
    id: 3,
    title: 'Відео',
    link: 'https://youtube.com/watch?v=1',
    priority: 0,
};

describe('PublicFeedbackApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetches published histories and maps them for the page', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [historyDto] });

        const result = await PublicFeedbackApi.fetchHistories();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.FEEDBACK_HISTORIES.PUBLISHED, { signal: undefined });
        expect(result).toEqual([
            {
                id: 1,
                title: 'Історія',
                story: 'Текст історії',
                image: 'https://example.com/a.jpg',
                localizations: [
                    {
                        entityId: 1,
                        language: english,
                        translationStatus: TranslationStatus.Relevant,
                        title: 'Story',
                        story: 'Story text',
                    },
                ],
            },
        ]);
    });

    it('maps a missing history image to null', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [{ ...historyDto, image: null }] });

        const [history] = await PublicFeedbackApi.fetchHistories();

        expect(history.image).toBeNull();
    });

    it('fetches published reviews and maps authorName/text to name/review', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [reviewDto] });

        const [review] = await PublicFeedbackApi.fetchReviews();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.FEEDBACK_REVIEWS.PUBLISHED, { signal: undefined });
        expect(review).toMatchObject({ id: 2, name: 'Олена', review: 'Дякуємо' });
        expect(review.localizations?.[0]).toMatchObject({ language: english, authorName: 'Olena', text: 'Thanks' });
    });

    it('fetches published videos and leaves localizations undefined when none are sent', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [videoDto] });

        const [video] = await PublicFeedbackApi.fetchVideos();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.VIDEO_REVIEWS.PUBLISHED, { signal: undefined });
        expect(video).toEqual({
            id: 3,
            title: 'Відео',
            link: 'https://youtube.com/watch?v=1',
            localizations: undefined,
        });
    });

    it('fetches all three lists for the page in one call', async () => {
        (axiosInstance.get as jest.Mock).mockImplementation((url: string) => {
            if (url === API_ROUTES.FEEDBACK_HISTORIES.PUBLISHED) return Promise.resolve({ data: [historyDto] });
            if (url === API_ROUTES.FEEDBACK_REVIEWS.PUBLISHED) return Promise.resolve({ data: [reviewDto] });
            return Promise.resolve({ data: [videoDto] });
        });

        const result = await storiesOfVictoryPageDataFetch();

        expect(result.histories).toHaveLength(1);
        expect(result.reviews).toHaveLength(1);
        expect(result.videos).toHaveLength(1);
    });

    it('keeps the sections that loaded when one request fails', async () => {
        (axiosInstance.get as jest.Mock).mockImplementation((url: string) => {
            if (url === API_ROUTES.FEEDBACK_HISTORIES.PUBLISHED) return Promise.resolve({ data: [historyDto] });
            if (url === API_ROUTES.FEEDBACK_REVIEWS.PUBLISHED) return Promise.resolve({ data: [reviewDto] });
            return Promise.reject(new Error('videos down'));
        });

        const result = await storiesOfVictoryPageDataFetch();

        expect(result.histories).toHaveLength(1);
        expect(result.reviews).toHaveLength(1);
        expect(result.videos).toEqual([]);
    });

    it('rejects when every request fails', async () => {
        (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('network'));

        await expect(storiesOfVictoryPageDataFetch()).rejects.toThrow('network');
    });

    it('forwards the cancellation signal to every request', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] });
        const controller = new AbortController();

        await storiesOfVictoryPageDataFetch({ cancellationSignal: controller.signal });

        expect(axiosInstance.get).toHaveBeenCalledTimes(3);
        (axiosInstance.get as jest.Mock).mock.calls.forEach(([, config]) => {
            expect(config).toEqual({ signal: controller.signal });
        });
    });
});
