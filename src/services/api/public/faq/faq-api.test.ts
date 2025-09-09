import { AxiosInstance } from 'axios';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';
import { FaqApi } from './faq-api';

const mock_answer =
    "Потрібно заповнити коротку анкету або написати координатору через форму на сайті. Після цього ми зв'яжемось для уточнення деталей";

describe('FaqApi', () => {
    let client: jest.Mocked<Pick<AxiosInstance, 'get'>>;

    beforeEach(() => {
        client = { get: jest.fn() } as any;
    });

    it('should return valid data', async () => {
        const slug = 'programs-page';
        const data: PublishedFaqQuestion[] = [
            {
                id: 1,
                questionText: 'Як долучитись до програми?',
                answerText: mock_answer,
            },
            {
                id: 2,
                questionText: 'Як проходять терапевтичні сесії?',
                answerText: mock_answer,
            },
        ];
        client.get.mockResolvedValue({ data } as any);

        await expect(FaqApi.getBySlug(client as unknown as AxiosInstance, slug)).resolves.toEqual(data);
    });

    it('should throw an error when rejected', async () => {
        const slug = 'broken-slug';
        const err = new Error();
        client.get.mockRejectedValue(err);

        await expect(FaqApi.getBySlug(client as unknown as AxiosInstance, slug)).rejects.toThrow(err);
    });
});
