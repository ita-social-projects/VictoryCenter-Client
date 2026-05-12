import {
    MAIN_PAGE_FORM_DEFAULTS,
    MainPage,
    MainPageFormValues,
    MetricPrefix,
    MetricType,
} from '@/types/admin/main-page';
import type { LocalizationLanguage } from '@/types/common/language';
import {
    mapEntityWithLocalizations,
    mapFormValuesToMainPagePatch,
    mapLocalizationDtoToModel,
    mapMainPageToFormValues,
} from './main-page-mappers';

describe('main-page-mappers', () => {
    const languages: LocalizationLanguage[] = [
        { id: 1, code: 'uk', name: 'Українська' },
        { id: 2, code: 'en', name: 'English' },
    ];

    describe('Localization Utilities', () => {
        it('mapLocalizationDtoToModel maps localizationInfoDto to language', () => {
            const dto = {
                entityId: 1,
                title: 'Test',
                localizationInfoDto: { id: 2, code: 'en' },
                translationStatus: 0,
            };

            const result = mapLocalizationDtoToModel(dto as any);

            expect(result.language).toEqual({ id: 2, code: 'en' });
            expect((result as any).localizationInfoDto).toBeUndefined();
            expect(result.title).toBe('Test');
        });

        it('mapEntityWithLocalizations maps array of localizations and handles missing arrays', () => {
            const dtoWithLocs = {
                id: 1,
                localizations: [{ localizationInfoDto: { code: 'uk' }, title: 'UA' }],
            };
            const dtoWithoutLocs = { id: 2 };

            const result1 = mapEntityWithLocalizations(dtoWithLocs as any);
            const result2 = mapEntityWithLocalizations(dtoWithoutLocs as any);

            expect(result1.localizations[0].language?.code).toBe('uk');
            expect(result2.localizations).toEqual([]);
        });
    });

    describe('mapMainPageToFormValues', () => {
        it('maps fully populated MainPage to form values correctly (resolving EN locs via code and languageId)', () => {
            const page: MainPage = {
                id: 1,
                title: 'UA Title',
                description: 'UA Desc',
                image: { id: 10, url: 'img.png' } as any,
                localizations: [
                    { localizationInfoDto: { code: 'en' }, title: 'EN Title', description: 'EN Desc' } as any,
                ],
                mainAboutUs: {
                    title: 'UA About',
                    description: 'UA About Desc',
                    localizations: [{ languageId: 2, title: 'EN About', description: 'EN About Desc' } as any],
                } as any,
                mainPartners: {
                    title: 'UA Partners',
                    description: 'UA Partners Desc',
                    localizations: [
                        { language: { code: 'en' }, title: 'EN Partners', description: 'EN Partners Desc' } as any,
                    ],
                } as any,
                impactStatistics: {
                    title: 'UA Stats',
                    image: { id: 20, url: 'stat.png' } as any,
                    localizations: [{ localizationInfoDto: { code: 'en' }, title: 'EN Stats' } as any],
                    metrics: [],
                } as any,
            };

            const result = mapMainPageToFormValues(page, languages);

            expect(result).toEqual({
                ...MAIN_PAGE_FORM_DEFAULTS,
                titleUa: 'UA Title',
                titleEn: 'EN Title',
                descriptionUa: 'UA Desc',
                descriptionEn: 'EN Desc',
                image: { id: 10, url: 'img.png' },

                aboutUsTitleUa: 'UA About',
                aboutUsTitleEn: 'EN About',
                aboutUsDescriptionUa: 'UA About Desc',
                aboutUsDescriptionEn: 'EN About Desc',

                partnersTitleUa: 'UA Partners',
                partnersTitleEn: 'EN Partners',
                partnersDescriptionUa: 'UA Partners Desc',
                partnersDescriptionEn: 'EN Partners Desc',

                statisticsTitleUa: 'UA Stats',
                statisticsTitleEn: 'EN Stats',
                statisticsImage: { id: 20, url: 'stat.png' },
            });
        });

        it('handles null/empty MainPage fields gracefully with defaults', () => {
            const emptyPage: MainPage = {} as any;

            const result = mapMainPageToFormValues(emptyPage, languages);

            expect(result).toEqual(MAIN_PAGE_FORM_DEFAULTS);
        });

        it('handles unknown languages / missing languages array gracefully', () => {
            const page: MainPage = {
                title: 'UA Title',
                localizations: [{ languageId: 99, title: 'Unknown Lang' } as any],
            } as any;

            const result = mapMainPageToFormValues(page, []);

            expect(result.titleEn).toBe('UA Title');
        });
    });

    describe('mapFormValuesToMainPagePatch', () => {
        it('maps form values to UpdateMainPageDto, trims strings, and preserves metrics', () => {
            const formValues: MainPageFormValues = {
                titleUa: '  UA Title  ',
                titleEn: '  EN Title  ',
                descriptionUa: 'UA Desc',
                descriptionEn: 'EN Desc',
                image: { id: 5, mimeType: 'image/png' } as any,

                aboutUsTitleUa: 'UA About',
                aboutUsTitleEn: '',
                aboutUsDescriptionUa: 'UA About Desc',
                aboutUsDescriptionEn: 'EN About Desc',

                partnersTitleUa: 'UA Partners',
                partnersTitleEn: 'EN Partners',
                partnersDescriptionUa: 'UA Partners Desc',
                partnersDescriptionEn: 'EN Partners Desc',

                statisticsTitleUa: 'UA Stats',
                statisticsTitleEn: 'EN Stats',
                statisticsImage: { base64: 'data:image...' } as any,
            };

            const originalPage: MainPage = {
                impactStatistics: {
                    id: 99,
                    metrics: [
                        {
                            id: 1,
                            value: 100,
                            name: 'UA Metric',
                            type: MetricType.Partners,
                            prefix: MetricPrefix.Plus,
                            localizations: [{ localizationInfoDto: { code: 'en' }, name: 'EN Metric' } as any],
                        } as any,
                        {
                            id: 2,
                            value: 50,
                            name: 'UA Metric 2',
                            type: MetricType.Programs,
                            prefix: MetricPrefix.None,
                            localizations: [],
                        } as any,
                    ],
                } as any,
            } as any;

            const patch = mapFormValuesToMainPagePatch(formValues, originalPage, languages);

            expect(patch.title).toBe('UA Title');
            expect(patch.description).toBe('UA Desc');
            expect(patch.imageId).toBe(5);

            expect(patch.localizations).toEqual([
                { languageId: 1, title: 'UA Title', description: 'UA Desc' },
                { languageId: 2, title: 'EN Title', description: 'EN Desc' },
            ]);

            expect(patch.mainAboutUs?.localizations?.[1].title).toBe('UA About');

            expect(patch.impactStatistics?.id).toBe(99);
            expect(patch.impactStatistics?.imageId).toBeNull();

            const metrics = patch.impactStatistics?.metrics;
            expect(metrics).toHaveLength(2);
            expect(metrics?.[0]).toEqual({
                id: 1,
                value: 100,
                name: 'UA Metric',
                type: MetricType.Partners,
                prefix: MetricPrefix.Plus,
                localization: [{ languageId: 2, name: 'EN Metric' }],
            });

            expect(metrics?.[1].localizations).toBeUndefined();
        });

        it('handles missing languages array and null originalPage', () => {
            const formValues = { ...MAIN_PAGE_FORM_DEFAULTS, titleUa: 'Test' };

            const patch = mapFormValuesToMainPagePatch(formValues, null, undefined);

            expect(patch.localizations).toEqual([
                { title: 'Test', description: '' },
                { title: 'Test', description: '' },
            ]);

            expect(patch.impactStatistics?.metrics).toEqual([]);
            expect(patch.impactStatistics?.id).toBeUndefined();
        });
    });
});
