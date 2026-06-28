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

const DEFAULT_ENGLISH_LANGUAGE_ID = 2;

const findLocalizationByCode = <TLocalization>(
    localizations: TLocalization[] | undefined,
    code: 'uk' | 'en',
    languages?: LocalizationLanguage[],
): TLocalization | undefined => (localizations ?? []).find((loc) => resolveLocaleCode(loc as any, languages) === code);

export function mapMainPageToFormValues(page: MainPage, languages?: LocalizationLanguage[]): MainPageFormValues {
    const pageLocalizations = page.localizations ?? [];
    const aboutUsLocalizations = page.mainAboutUs?.localizations ?? [];
    const partnersLocalizations = page.mainPartners?.localizations ?? [];
    const statLocalizations = page.impactStatistics?.localizations ?? [];

    const pageUkLoc = findLocalizationByCode(pageLocalizations, 'uk', languages);
    const pageEnLoc = findLocalizationByCode(pageLocalizations, 'en', languages);
    const aboutUsUkLoc = findLocalizationByCode(aboutUsLocalizations, 'uk', languages);
    const aboutUsEnLoc = findLocalizationByCode(aboutUsLocalizations, 'en', languages);
    const partnersUkLoc = findLocalizationByCode(partnersLocalizations, 'uk', languages);
    const partnersEnLoc = findLocalizationByCode(partnersLocalizations, 'en', languages);
    const statUkLoc = findLocalizationByCode(statLocalizations, 'uk', languages);
    const statEnLoc = findLocalizationByCode(statLocalizations, 'en', languages);

    return {
        ...MAIN_PAGE_FORM_DEFAULTS,

        // Title Block
        titleUa: page.title ?? pageUkLoc?.title ?? '',
        titleEn: pageEnLoc?.title ?? '',
        descriptionUa: page.description ?? pageUkLoc?.description ?? '',
        descriptionEn: pageEnLoc?.description ?? '',
        image: page.image ?? null,

        // About Us Block
        aboutUsTitleUa: page.mainAboutUs?.title ?? aboutUsUkLoc?.title ?? '',
        aboutUsTitleEn: aboutUsEnLoc?.title ?? '',
        aboutUsDescriptionUa: page.mainAboutUs?.description ?? aboutUsUkLoc?.description ?? '',
        aboutUsDescriptionEn: aboutUsEnLoc?.description ?? '',

        // Partners Block
        partnersTitleUa: page.mainPartners?.title ?? partnersUkLoc?.title ?? '',
        partnersTitleEn: partnersEnLoc?.title ?? '',
        partnersDescriptionUa: page.mainPartners?.description ?? partnersUkLoc?.description ?? '',
        partnersDescriptionEn: partnersEnLoc?.description ?? '',

        // Statistics Block
        statisticsTitleUa: page.impactStatistics?.title ?? statUkLoc?.title ?? '',
        statisticsTitleEn: statEnLoc?.title ?? '',
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
    const enLanguageId = getLanguageIdByCode(languages, 'en') ?? (!languages?.length ? DEFAULT_ENGLISH_LANGUAGE_ID : null);

    if (enLanguageId == null) {
        throw new Error('Could not resolve English language ID. Check languages configuration.');
    }

    const str = (val?: string) => (val ?? '').trim();

    // Title Block
    const titleUk = str(formValues.titleUa);
    const descUk = str(formValues.descriptionUa);

    // About Us Block
    const aboutTitleUk = str(formValues.aboutUsTitleUa);
    const aboutDescUk = str(formValues.aboutUsDescriptionUa);

    // Partners Block
    const partnersTitleUk = str(formValues.partnersTitleUa);
    const partnersDescUk = str(formValues.partnersDescriptionUa);

    // Statistics Block
    const statTitleUk = str(formValues.statisticsTitleUa);
    const statTitleEn = str(formValues.statisticsTitleEn);

    const existingMetrics = currentMetrics?.length ? currentMetrics : (originalPage?.impactStatistics?.metrics ?? []);

    const safeMetricsPayload: UpdateMetricDto[] = existingMetrics.map((m) => {
        const enLoc = m.localizations?.find(
            (l) => l.languageId === enLanguageId || resolveLocaleCode(l as any, languages) === 'en',
        );

        return {
            id: m.id,
            value: m.value,
            name: m.name,
            type: m.type,
            prefix: m.prefix,
            isAutoSynced: m.isAutoSynced,
            localization: enLoc
                ? {
                      ...(m.id ? { entityId: m.id } : {}),
                      languageId: enLanguageId,
                      name: enLoc.name,
                      value: enLoc.value ?? String(m.value),
                  }
                : undefined,
        } as UpdateMetricDto;
    });

    return {
        title: titleUk,
        description: descUk,
        imageId: formValues.image && 'id' in formValues.image ? (formValues.image.id as number) : null,

        mainAboutUs: {
            title: aboutTitleUk,
            description: aboutDescUk,
        },

        mainPartners: {
            title: partnersTitleUk,
            description: partnersDescUk,
        },

        impactStatistics: {
            id: originalPage?.impactStatistics?.id,
            title: statTitleUk,
            imageId:
                formValues.statisticsImage && 'id' in formValues.statisticsImage
                    ? (formValues.statisticsImage.id as number)
                    : null,
            metrics: safeMetricsPayload,
            localization: statTitleEn
                ? {
                      languageId: enLanguageId,
                      title: statTitleEn,
                  }
                : undefined,
        },
    };
}
