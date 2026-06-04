import {
    MAIN_PAGE_FORM_DEFAULTS,
    MainPage,
    MainPageFormValues,
    UpdateMainPageDto,
    UpdateMetricDto,
} from '@/types/admin/main-page';
import type { LocalizationLanguage } from '@/types/common/language';
import {
    getLanguageIdByCode,
    resolveLocaleCode,
} from '@/utils/functions/mappers/common/localization/localization-mappers';

export function mapMainPageToFormValues(page: MainPage, languages?: LocalizationLanguage[]): MainPageFormValues {
    const pageLocalizations = page.localizations ?? [];
    const aboutUsLocalizations = page.mainAboutUs?.localizations ?? [];
    const donationsLocalizations = page.mainDonations?.localizations ?? [];
    const partnersLocalizations = page.mainPartners?.localizations ?? [];
    const statLocalizations = page.impactStatistics?.localizations ?? [];

    const pageEnLoc = pageLocalizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');
    const aboutUsEnLoc = aboutUsLocalizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');
    const donationsEnLoc = donationsLocalizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');
    const partnersEnLoc = partnersLocalizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');
    const statEnLoc = statLocalizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');

    return {
        ...MAIN_PAGE_FORM_DEFAULTS,

        // Title Block
        titleUa: page.title ?? '',
        titleEn: pageEnLoc?.title ?? page.title ?? '',
        descriptionUa: page.description ?? '',
        descriptionEn: pageEnLoc?.description ?? page.description ?? '',
        image: page.image ?? null,

        // About Us Block
        aboutUsTitleUa: page.mainAboutUs?.title ?? '',
        aboutUsTitleEn: aboutUsEnLoc?.title ?? page.mainAboutUs?.title ?? '',
        aboutUsDescriptionUa: page.mainAboutUs?.description ?? '',
        aboutUsDescriptionEn: aboutUsEnLoc?.description ?? page.mainAboutUs?.description ?? '',

        // Donations Block
        donationsTitleUa: page.mainDonations?.title ?? '',
        donationsTitleEn: donationsEnLoc?.title ?? page.mainDonations?.title ?? '',
        donationsDescriptionUa: page.mainDonations?.description ?? '',
        donationsDescriptionEn: donationsEnLoc?.description ?? page.mainDonations?.description ?? '',
        donationsImage: page.mainDonations?.image ?? null,

        // Partners Block
        partnersTitleUa: page.mainPartners?.title ?? '',
        partnersTitleEn: partnersEnLoc?.title ?? page.mainPartners?.title ?? '',
        partnersDescriptionUa: page.mainPartners?.description ?? '',
        partnersDescriptionEn: partnersEnLoc?.description ?? page.mainPartners?.description ?? '',

        // Statistics Block
        statisticsTitleUa: page.impactStatistics?.title ?? '',
        statisticsTitleEn: statEnLoc?.title ?? page.impactStatistics?.title ?? '',
        statisticsImage: page.impactStatistics?.image ?? null,
    };
}

export function mapFormValuesToMainPagePatch(
    formValues: MainPageFormValues,
    originalPage: MainPage | null,
    languages?: LocalizationLanguage[],
    currentMetrics?: MainPage['impactStatistics'] extends null | undefined
        ? never
        : NonNullable<MainPage['impactStatistics']>['metrics'],
): UpdateMainPageDto {
    const ukLanguageId = getLanguageIdByCode(languages, 'uk');
    const enLanguageId = getLanguageIdByCode(languages, 'en');

    const str = (val?: string) => (val ?? '').trim();

    // Title Block
    const titleUk = str(formValues.titleUa);
    const titleEn = str(formValues.titleEn);
    const descUk = str(formValues.descriptionUa);
    const descEn = str(formValues.descriptionEn);

    // About Us Block
    const aboutTitleUk = str(formValues.aboutUsTitleUa);
    const aboutTitleEn = str(formValues.aboutUsTitleEn);
    const aboutDescUk = str(formValues.aboutUsDescriptionUa);
    const aboutDescEn = str(formValues.aboutUsDescriptionEn);

    // Donations Block
    const donationsTitleUk = str(formValues.donationsTitleUa);
    const donationsTitleEn = str(formValues.donationsTitleEn);
    const donationsDescUk = str(formValues.donationsDescriptionUa);
    const donationsDescEn = str(formValues.donationsDescriptionEn);

    // Partners Block
    const partnersTitleUk = str(formValues.partnersTitleUa);
    const partnersTitleEn = str(formValues.partnersTitleEn);
    const partnersDescUk = str(formValues.partnersDescriptionUa);
    const partnersDescEn = str(formValues.partnersDescriptionEn);

    // Statistics Block
    const statTitleUk = str(formValues.statisticsTitleUa);
    const statTitleEn = str(formValues.statisticsTitleEn);

    const existingMetrics = currentMetrics?.length ? currentMetrics : (originalPage?.impactStatistics?.metrics ?? []);

    const safeMetricsPayload: UpdateMetricDto[] = existingMetrics.map((m) => {
        const enLoc = m.localizations?.find((l) =>
            enLanguageId ? l.languageId === enLanguageId : resolveLocaleCode(l as any, languages) === 'en',
        );

        return {
            id: m.id,
            value: m.value,
            name: m.name,
            type: m.type,
            prefix: m.prefix,
            localization: enLanguageId && enLoc ? { languageId: enLanguageId, name: enLoc.name } : undefined,
        } as UpdateMetricDto;
    });

    return {
        title: titleUk,
        description: descUk,
        imageId: formValues.image && 'id' in formValues.image ? (formValues.image.id as number) : null,
        localizations: [
            { ...(ukLanguageId ? { languageId: ukLanguageId } : {}), title: titleUk, description: descUk },
            {
                ...(enLanguageId ? { languageId: enLanguageId } : {}),
                title: titleEn || titleUk,
                description: descEn || descUk,
            },
        ],

        mainAboutUs: {
            title: aboutTitleUk,
            description: aboutDescUk,
            localizations: [
                {
                    ...(ukLanguageId ? { languageId: ukLanguageId } : {}),
                    title: aboutTitleUk,
                    description: aboutDescUk,
                },
                {
                    ...(enLanguageId ? { languageId: enLanguageId } : {}),
                    title: aboutTitleEn || aboutTitleUk,
                    description: aboutDescEn || aboutDescUk,
                },
            ],
        },

        mainDonations: {
            title: donationsTitleUk,
            description: donationsDescUk,
            imageId:
                formValues.donationsImage && 'id' in formValues.donationsImage
                    ? (formValues.donationsImage.id as number)
                    : null,
            localizations: [
                {
                    ...(ukLanguageId ? { languageId: ukLanguageId } : {}),
                    title: donationsTitleUk,
                    description: donationsDescUk,
                },
                {
                    ...(enLanguageId ? { languageId: enLanguageId } : {}),
                    title: donationsTitleEn || donationsTitleUk,
                    description: donationsDescEn || donationsDescUk,
                },
            ],
        },

        mainPartners: {
            title: partnersTitleUk,
            description: partnersDescUk,
            localizations: [
                {
                    ...(ukLanguageId ? { languageId: ukLanguageId } : {}),
                    title: partnersTitleUk,
                    description: partnersDescUk,
                },
                {
                    ...(enLanguageId ? { languageId: enLanguageId } : {}),
                    title: partnersTitleEn || partnersTitleUk,
                    description: partnersDescEn || partnersDescUk,
                },
            ],
        },

        impactStatistics: {
            id: originalPage?.impactStatistics?.id,
            title: statTitleUk,
            imageId:
                formValues.statisticsImage && 'id' in formValues.statisticsImage
                    ? (formValues.statisticsImage.id as number)
                    : null,
            metrics: safeMetricsPayload,
            localizations: enLanguageId
                ? [
                      {
                          languageId: enLanguageId,
                          title: statTitleEn || statTitleUk,
                      },
                  ]
                : undefined,
        },
    };
}
