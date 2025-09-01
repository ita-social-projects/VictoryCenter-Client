import { FaqApi } from './faq-api';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';

describe('FaqApi', () => {
    const mockClient = {
        get: jest.fn(),
    } as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch questions by slug and return data', async () => {
        const slug = 'test-slug';
        const mockQuestions: PublishedFaqQuestion[] = [
            { id: 1, questionText: 'Q1', answerText: 'A1' },
            { id: 2, questionText: 'Q2', answerText: 'A2' },
        ];
        mockClient.get.mockResolvedValueOnce({ data: mockQuestions });

        const result = await FaqApi.getBySlug(mockClient, slug);

        expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining(slug));
        expect(result).toEqual(mockQuestions);
    });

    it('should handle empty response', async () => {
        const slug = 'empty-slug';
        mockClient.get.mockResolvedValueOnce({ data: [] });

        const result = await FaqApi.getBySlug(mockClient, slug);

        expect(result).toEqual([]);
    });

    it('should propagate errors from axios', async () => {
        const slug = 'error-slug';
        const error = new Error('Network error');
        mockClient.get.mockRejectedValueOnce(error);

        await expect(FaqApi.getBySlug(mockClient, slug)).rejects.toThrow('Network error');
    });
});
