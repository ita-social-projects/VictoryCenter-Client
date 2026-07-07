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
    mapLocalizationDtoToModel,
} from '@/utils/functions/mappers/common/localization/localization-mappers';
import { mapFormValuesToMainPagePatch, mapMainPageToFormValues } from './main-page-mappers';

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
        it('maps fully populated MainPage to form values using base fields for UA and EN localizations for EN', () => {
            const page: MainPage = {
                id: 1,
                title: 'Base Title',
                description: 'Base Desc',
                image: { id: 10, url: 'img.png' } as any,
                localizations: [
                    { localizationInfoDto: { code: 'uk' }, title: 'UA Title', description: 'UA Desc' } as any,
                    { localizationInfoDto: { code: 'en' }, title: 'EN Title', description: 'EN Desc' } as any,
                ],
                mainAboutUs: {
                    title: 'Base About',
                    description: 'Base About Desc',
                    localizations: [
                        { languageId: 1, title: 'UA About', description: 'UA About Desc' } as any,
                        { languageId: 2, title: 'EN About', description: 'EN About Desc' } as any,
                    ],
                } as any,
                mainDonations: {
                    title: 'UA Donations',
                    description: 'UA Donations Desc',
                    image: { id: 15, url: 'img-donations.png' } as any,
                    localizations: [
                        {
                            localizationInfoDto: { code: 'en' },
                            title: 'EN Donations',
                            description: 'EN Donations Desc',
                        } as any,
                    ],
                } as any,
                mainPartners: {
                    title: 'Base Partners',
                    description: 'Base Partners Desc',
                    localizations: [
                        { language: { code: 'uk' }, title: 'UA Partners', description: 'UA Partners Desc' } as any,
                        { language: { code: 'en' }, title: 'EN Partners', description: 'EN Partners Desc' } as any,
                    ],
                } as any,
                impactStatistics: {
                    title: 'Base Stats',
                    image: { id: 20, url: 'stat.png' } as any,
                    localizations: [
                        { localizationInfoDto: { code: 'uk' }, title: 'UA Stats' } as any,
                        { localizationInfoDto: { code: 'en' }, title: 'EN Stats' } as any,
                    ],
                    metrics: [],
                } as any,
            };

            const result = mapMainPageToFormValues(page, languages);

            expect(result).toEqual({
                ...MAIN_PAGE_FORM_DEFAULTS,
                titleUa: 'Base Title',
                titleEn: 'EN Title',
                descriptionUa: 'Base Desc',
                descriptionEn: 'EN Desc',
                image: { id: 10, url: 'img.png' },

                aboutUsTitleUa: 'Base About',
                aboutUsTitleEn: 'EN About',
                aboutUsDescriptionUa: 'Base About Desc',
                aboutUsDescriptionEn: 'EN About Desc',

                donationsTitleUa: 'UA Donations',
                donationsTitleEn: 'EN Donations',
                donationsDescriptionUa: 'UA Donations Desc',
                donationsDescriptionEn: 'EN Donations Desc',
                donationsImage: { id: 15, url: 'img-donations.png' },

                partnersTitleUa: 'Base Partners',
                partnersTitleEn: 'EN Partners',
                partnersDescriptionUa: 'Base Partners Desc',
                partnersDescriptionEn: 'EN Partners Desc',

                statisticsTitleUa: 'Base Stats',
                statisticsTitleEn: 'EN Stats',
                statisticsImage: { id: 20, url: 'stat.png' },
            });
        });

        it('falls back to UK localization only when base fields are missing and does not fill EN from base', () => {
            const page: MainPage = {
                title: null,
                description: null,
                localizations: [
                    { localizationInfoDto: { code: 'uk' }, title: 'UK Loc Title', description: 'UK Loc Desc' } as any,
                ],
                mainAboutUs: {
                    title: null,
                    description: null,
                    localizations: [{ languageId: 1, title: 'UK Loc About', description: 'UK Loc About Desc' } as any],
                } as any,
                mainDonations: {
                    title: null,
                    description: null,
                    localizations: [
                        { languageId: 1, title: 'UK Loc Donations', description: 'UK Loc Donations Desc' } as any,
                    ],
                } as any,
                mainPartners: {
                    title: null,
                    description: null,
                    localizations: [
                        { language: { code: 'uk' }, title: 'UK Loc Partners', description: 'UK Loc Partners Desc' },
                    ],
                } as any,
                impactStatistics: {
                    title: null,
                    metrics: [],
                    localizations: [{ languageId: 1, title: 'UK Loc Stats' }],
                } as any,
            } as any;

            const result = mapMainPageToFormValues(page, languages);

            expect(result.titleUa).toBe('UK Loc Title');
            expect(result.titleEn).toBe('');
            expect(result.aboutUsTitleUa).toBe('UK Loc About');
            expect(result.aboutUsTitleEn).toBe('');
            expect(result.donationsTitleUa).toBe('UK Loc Donations');
            expect(result.donationsTitleEn).toBe('');
            expect(result.partnersTitleUa).toBe('UK Loc Partners');
            expect(result.partnersTitleEn).toBe('');
            expect(result.statisticsTitleUa).toBe('UK Loc Stats');
            expect(result.statisticsTitleEn).toBe('');
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
            expect(result.titleEn).toBe('');
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

                donationsTitleUa: 'UA Donations',
                donationsTitleEn: 'EN Donations',
                donationsDescriptionUa: 'UA Donations Desc',
                donationsDescriptionEn: 'EN Donations Desc',
                donationsImage: { id: 16, mimeType: 'image/png' } as any,

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
                            isAutoSynced: true,
                            localizations: [
                                { languageId: 1, name: 'UA Metric', value: '100+' } as any,
                                { localizationInfoDto: { code: 'en' }, name: 'EN Metric', value: '100+' } as any,
                            ],
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

            expect(patch.localizations).toBeUndefined();
            expect(patch.mainAboutUs?.localizations).toBeUndefined();
            expect(patch.mainPartners?.localizations).toBeUndefined();

            expect(patch.impactStatistics?.id).toBe(99);
            expect(patch.impactStatistics?.imageId).toBeNull();

            const metrics = patch.impactStatistics?.metrics;
            expect(metrics).toHaveLength(2);
            expect(metrics?.[0]).toEqual({
                id: 1,
                value: 100,
                name: 'UA Metric',
                type: MetricType.Partners,
                prefix: 1, // MetricPrefix.Plus is 1
                isAutoSynced: true,
                localization: {
                    entityId: 1,
                    languageId: 2,
                    name: 'EN Metric',
                    value: '100+',
                },
            });

            expect(metrics?.[1].localization).toBeUndefined();
            expect(patch.impactStatistics?.localization).toEqual({
                languageId: 2,
                title: 'EN Stats',
            });
        });

        it('handles missing languages array and null originalPage', () => {
            const formValues = { ...MAIN_PAGE_FORM_DEFAULTS, titleUa: 'Test' };

            const patch = mapFormValuesToMainPagePatch(formValues, null, undefined);

            expect(patch.localizations).toBeUndefined();

            expect(patch.impactStatistics?.metrics).toEqual([]);
            expect(patch.impactStatistics?.id).toBeUndefined();
            expect(patch.impactStatistics?.localization).toBeUndefined();
        });

        it('does not write Ukrainian statistics title into English localization when EN title is empty', () => {
            const formValues = {
                ...MAIN_PAGE_FORM_DEFAULTS,
                titleUa: 'UA Title',
                descriptionUa: 'UA Desc',
                aboutUsTitleUa: 'UA About',
                aboutUsDescriptionUa: 'UA About Desc',
                partnersTitleUa: 'UA Partners',
                partnersDescriptionUa: 'UA Partners Desc',
                statisticsTitleUa: 'Статистика впливу',
                statisticsTitleEn: '   ',
            };

            const patch = mapFormValuesToMainPagePatch(formValues, null, languages);

            expect(patch.impactStatistics?.title).toBe('Статистика впливу');
            expect(patch.impactStatistics?.localization).toBeUndefined();
        });

        it('maps edited metrics to base Ukrainian fields and English localization payload', () => {
            const formValues: MainPageFormValues = {
                ...MAIN_PAGE_FORM_DEFAULTS,
                titleUa: 'UA Title',
                descriptionUa: 'UA Desc',
                aboutUsTitleUa: 'UA About',
                aboutUsDescriptionUa: 'UA About Desc',
                partnersTitleUa: 'UA Partners',
                partnersDescriptionUa: 'UA Partners Desc',
                statisticsTitleUa: 'UA Stats',
                statisticsTitleEn: 'EN Stats',
            };

            const currentMetrics: MainPage['impactStatistics'] extends null | undefined
                ? never
                : NonNullable<MainPage['impactStatistics']>['metrics'] = [
                {
                    id: 4,
                    value: 1200,
                    name: 'Години терапії',
                    type: MetricType.TherapyHours,
                    prefix: MetricPrefix.Plus,
                    isAutoSynced: false,
                    isHidden: false,
                    priority: 1,
                    localizations: [
                        { languageId: 1, entityId: 4, name: 'UK loc should not be base', value: '1200+' } as any,
                        { languageId: 2, entityId: 4, name: 'Therapy hours', value: '1200+' } as any,
                    ],
                },
            ];

            const patch = mapFormValuesToMainPagePatch(
                formValues,
                { impactStatistics: { id: 1, metrics: [] } } as any,
                languages,
                currentMetrics,
            );

            expect(patch.impactStatistics?.metrics).toEqual([
                expect.objectContaining({
                    id: 4,
                    value: 1200,
                    name: 'Години терапії',
                    localization: {
                        entityId: 4,
                        languageId: 2,
                        name: 'Therapy hours',
                        value: '1200+',
                    },
                }),
            ]);
        });

        it('uses default English language id and preserves metric localization without entity id when languages are missing', () => {
            const formValues: MainPageFormValues = {
                ...MAIN_PAGE_FORM_DEFAULTS,
                titleUa: 'UA Title',
                descriptionUa: 'UA Desc',
                aboutUsTitleUa: 'UA About',
                aboutUsDescriptionUa: 'UA About Desc',
                partnersTitleUa: 'UA Partners',
                partnersDescriptionUa: 'UA Partners Desc',
                statisticsTitleUa: 'UA Stats',
                statisticsTitleEn: 'EN Stats',
                statisticsImage: { id: 77, url: 'stats.png' } as any,
            };

            const originalPage: MainPage = {
                impactStatistics: {
                    id: 9,
                    metrics: [
                        {
                            value: 8,
                            name: 'Програми',
                            type: MetricType.Programs,
                            isHidden: false,
                            priority: 2,
                            localizations: [{ language: { code: 'en' }, name: 'Programs', value: null } as any],
                        } as any,
                    ],
                } as any,
            } as any;

            const patch = mapFormValuesToMainPagePatch(formValues, originalPage, undefined);

            expect(patch.impactStatistics?.imageId).toBe(77);
            expect(patch.impactStatistics?.localization).toEqual({ languageId: 2, title: 'EN Stats' });
            expect(patch.impactStatistics?.metrics).toEqual([
                expect.objectContaining({
                    id: undefined,
                    value: 8,
                    name: 'Програми',
                    localization: {
                        languageId: 2,
                        name: 'Programs',
                        value: '8',
                    },
                }),
            ]);
        });
    });
});
