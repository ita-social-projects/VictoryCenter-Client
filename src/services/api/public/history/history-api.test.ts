import { PublicHistoryApi } from './history-api';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { HistorySectionDto } from '@/types/common/history-sections';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { RequestOptions } from '@/types/common/api';

jest.mock('@/services/api/axios');

describe('PublicHistoryApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSections', () => {
        it('should call GET with public history route and return mapped data', async () => {
            const mockDto: HistorySectionDto[] = [
                {
                    id: 1,
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            id: 10,
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Наша Історія',
                            description: null,
                            image: null,
                            localizations: [],
                        },
                    ],
                },
            ];

            const options: RequestOptions = { cancellationSignal: new AbortController().signal };
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockDto });

            const result = await PublicHistoryApi.getSections(options);

            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.HISTORY.PUBLIC, {
                signal: options.cancellationSignal,
            });
            expect(axiosInstance.get).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
            expect(result[0].template).toBe(SectionTemplate.TextOnly);
        });

        it('should return an empty array if API returns no data', async () => {
            const options: RequestOptions = { cancellationSignal: new AbortController().signal };
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] });

            const result = await PublicHistoryApi.getSections(options);

            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.HISTORY.PUBLIC, {
                signal: options.cancellationSignal,
            });
            expect(result).toEqual([]);
        });

        it('should throw an error if the API call fails', async () => {
            const errorMessage = 'Network Request Failed';
            const options: RequestOptions = { cancellationSignal: new AbortController().signal };
            (axiosInstance.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(PublicHistoryApi.getSections(options)).rejects.toThrow(errorMessage);
            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.HISTORY.PUBLIC, {
                signal: options.cancellationSignal,
            });
        });

        it('should map content localization dto to language model', async () => {
            const dtoResponse: HistorySectionDto[] = [
                {
                    id: 1,
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            id: 10,
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Наша Історія',
                            description: null,
                            image: null,
                            localizations: [
                                {
                                    entityId: 10,
                                    localizationInfoDto: { id: 1, code: 'en' },
                                    title: 'Our History',
                                    description: null,
                                    translationStatus: 1,
                                },
                            ],
                        },
                    ],
                },
            ];

            const options: RequestOptions = { cancellationSignal: new AbortController().signal };
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: dtoResponse });

            const result = await PublicHistoryApi.getSections(options);

            expect(result[0].contents[0].localizations?.[0]).toEqual(
                expect.objectContaining({
                    language: { id: 1, code: 'en' },
                    title: 'Our History',
                    description: null,
                }),
            );
            expect(result[0].contents[0].localizations?.[0]).not.toHaveProperty('localizationInfoDto');
        });

        it('should produce undefined localizations when content DTO has no localizations field', async () => {
            const dtoResponse: HistorySectionDto[] = [
                {
                    id: 1,
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            id: 10,
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Заголовок',
                            description: null,
                            image: null,
                            localizations: undefined as any,
                        },
                    ],
                },
            ];

            const options: RequestOptions = { cancellationSignal: new AbortController().signal };
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: dtoResponse });

            const result = await PublicHistoryApi.getSections(options);

            expect(result[0].contents[0].localizations).toBeUndefined();
        });

        it('should preserve section and content fields after mapping', async () => {
            const dtoResponse: HistorySectionDto[] = [
                {
                    id: 5,
                    template: SectionTemplate.SingleImageRight,
                    order: 2,
                    contents: [
                        {
                            id: 20,
                            contentType: ContentType.Description,
                            order: 1,
                            title: null,
                            description: 'Опис',
                            image: null,
                            localizations: [],
                        },
                    ],
                },
            ];

            const options: RequestOptions = { cancellationSignal: new AbortController().signal };
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: dtoResponse });

            const result = await PublicHistoryApi.getSections(options);

            expect(result[0]).toEqual(
                expect.objectContaining({
                    id: 5,
                    template: SectionTemplate.SingleImageRight,
                    order: 2,
                }),
            );
            expect(result[0].contents[0]).toEqual(
                expect.objectContaining({
                    id: 20,
                    contentType: ContentType.Description,
                    description: 'Опис',
                }),
            );
        });
    });
});
