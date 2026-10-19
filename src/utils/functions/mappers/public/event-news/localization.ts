import { EventNewsCategoryDto, Tag } from '@/types/public/events-news';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { getPublicLocalization } from '@/utils/functions/localization/get-public-localization';

export const mapToTag = (
    category: EventNewsCategoryDto | null | undefined,
    languageCode: string = DEFAULT_LOCALE,
): Tag | undefined => {
    if (!category || category.id == null) return undefined;

    const localized = getPublicLocalization(category.localizations, languageCode);

    return {
        id: String(category.id),
        name: localized?.name?.trim() || category.name || '',
    };
};

export const mapToTags = (
    categories: EventNewsCategoryDto[] | null | undefined,
    languageCode: string = DEFAULT_LOCALE,
): Tag[] =>
    Array.isArray(categories)
        ? categories.map((c) => mapToTag(c, languageCode)).filter((tag): tag is Tag => tag !== undefined)
        : [];
