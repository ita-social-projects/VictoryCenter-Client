import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    MainPageDto,
    MetricPrefix,
    MetricType,
    ReorderMetricsDto,
    UpdateMainPageDto,
    UpdateMetricVisibilityDto,
} from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import { MainPageApi } from './main-page-api';

describe('MainPageApi (Admin)', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            get: jest.fn(),
            put: jest.fn(),
        };
        jest.clearAllMocks();
    });

    const mockLanguages = [{ id: 1, code: 'uk', name: 'Ukrainian' }];

    const fullMainPageDto: MainPageDto = {
        id: 1,
        title: 'Main Title',
        description: 'Main Desc',
        image: null,
        localizations: [
            {
                localizationInfoDto: { id: 2, code: 'en' },
                translationStatus: TranslationStatus.Relevant,
                title: 'En Title',
                entityId: 1,
            },
        ],
        mainAboutUs: {
            id: 2,
            title: 'About',
            description: 'About desc',
            localizations: [
                {
                    localizationInfoDto: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    title: 'En About',
                    entityId: 2,
                },
            ],
        },
        mainPartners: {
            id: 3,
            title: 'Partners',
            description: 'Partners desc',
            localizations: [
                {
                    localizationInfoDto: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    title: 'En Partners',
                    entityId: 3,
                },
            ],
        },
        impactStatistics: {
            id: 4,
            title: 'Stats',
            localizations: [
                {
                    localizationInfoDto: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    title: 'En Stats',
                    entityId: 4,
                },
            ],
            metrics: [
                {
                    id: 5,
                    name: 'Metric 1',
                    value: 100,
                    type: MetricType.Partners,
                    prefix: MetricPrefix.Plus,
                    isHidden: false,
                    priority: 1,
                    localizations: [
                        {
                            localizationInfoDto: { id: 2, code: 'en' },
                            translationStatus: TranslationStatus.Relevant,
                            name: 'En Metric 1',
                            entityId: 5,
                        },
                    ],
                },
            ],
        },
    };

    describe('get()', () => {
        it('should fetch main page and languages, and map all nested entities correctly', async () => {
            mockClient.get.mockImplementation((url: string) => {
                if (url === API_ROUTES.MAIN_PAGE.BASE) return Promise.resolve({ data: fullMainPageDto });
                if (url === API_ROUTES.LOCALIZATION_LANGUAGE.BASE) return Promise.resolve({ data: mockLanguages });
                throw new Error(`Unexpected url ${url}`);
            });

            const result = await MainPageApi.get(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.MAIN_PAGE.BASE);
            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

            expect(result.page.title).toBe('Main Title');
            expect(result.page.localizations[0].language?.code).toBe('en');

            expect(result.page.mainAboutUs?.title).toBe('About');
            expect(result.page.mainAboutUs?.localizations[0].language?.code).toBe('en');

            expect(result.page.mainPartners?.title).toBe('Partners');
            expect(result.page.mainPartners?.localizations[0].language?.code).toBe('en');

            expect(result.page.impactStatistics?.title).toBe('Stats');
            expect(result.page.impactStatistics?.metrics[0].name).toBe('Metric 1');
            expect(result.page.impactStatistics?.metrics[0].localizations[0].language?.code).toBe('en');

            expect(result.languages).toEqual(mockLanguages);
        });

        it('should handle null values for nested entities (AboutUs, Partners, Statistics)', async () => {
            const emptyDto: MainPageDto = {
                id: 1,
                title: 'Empty Page',
                description: '',
                image: null,
                localizations: [],
                mainAboutUs: null,
                mainPartners: null,
                impactStatistics: null,
            };

            mockClient.get.mockImplementation((url: string) => {
                if (url === API_ROUTES.MAIN_PAGE.BASE) return Promise.resolve({ data: emptyDto });
                if (url === API_ROUTES.LOCALIZATION_LANGUAGE.BASE) return Promise.resolve({ data: [] });
                return Promise.resolve({ data: {} });
            });

            const result = await MainPageApi.get(mockClient);

            expect(result.page.mainAboutUs).toBeNull();
            expect(result.page.mainPartners).toBeNull();
            expect(result.page.impactStatistics).toBeNull();
        });

        it('should handle missing metrics array in impactStatistics (fallback to empty array)', async () => {
            const dtoWithoutMetrics: MainPageDto = {
                ...fullMainPageDto,
                impactStatistics: {
                    id: 4,
                    title: 'Stats without metrics',
                    localizations: [],
                    metrics: undefined,
                },
            };

            mockClient.get.mockImplementation((url: string) => {
                if (url === API_ROUTES.MAIN_PAGE.BASE) return Promise.resolve({ data: dtoWithoutMetrics });
                if (url === API_ROUTES.LOCALIZATION_LANGUAGE.BASE) return Promise.resolve({ data: [] });
                return Promise.resolve({ data: {} });
            });

            const result = await MainPageApi.get(mockClient);

            expect(result.page.impactStatistics?.metrics).toEqual([]);
        });
    });

    describe('publish()', () => {
        const patch: UpdateMainPageDto = {
            title: 'Updated Title',
            description: 'Updated Desc',
        };

        it('should put patch, refresh languages and return mapped page', async () => {
            mockClient.put.mockResolvedValueOnce({ data: fullMainPageDto });
            mockClient.get.mockResolvedValueOnce({ data: mockLanguages });

            const result = await MainPageApi.publish(mockClient, patch);

            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.MAIN_PAGE.BASE, patch);
            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

            expect(result.page.title).toBe(fullMainPageDto.title);
            expect(result.languages).toEqual(mockLanguages);
        });

        it('should gracefully fallback if languages fetch fails', async () => {
            mockClient.put.mockResolvedValueOnce({ data: fullMainPageDto });
            mockClient.get.mockRejectedValueOnce(new Error('Network error fetching languages'));

            const fallbackLangs = [{ id: 99, code: 'en', name: 'English' }];
            const result = await MainPageApi.publish(mockClient, patch, fallbackLangs);

            expect(result.languages).toEqual(fallbackLangs);
        });
    });

    describe('updateMetricVisibility()', () => {
        it('should call PUT to correct visibility endpoint', async () => {
            const metricId = 42;
            const dto: UpdateMetricVisibilityDto = { isHidden: true };

            await MainPageApi.updateMetricVisibility(mockClient, metricId, dto);

            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.MAIN_PAGE.BASE}/metrics/${metricId}/visibility`,
                dto,
            );
        });
    });

    describe('reorderMetrics()', () => {
        it('should call PUT to correct reorder endpoint', async () => {
            const dto: ReorderMetricsDto = { statisticId: 1, orderedIds: [3, 2, 1] };

            await MainPageApi.reorderMetrics(mockClient, dto);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.MAIN_PAGE.BASE}/metrics/reorder`, dto);
        });
    });
});
