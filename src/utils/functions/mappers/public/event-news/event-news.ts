import { EventsNews, PublishedEventNewsDto } from '@/types/public/events-news';
import { formatDate } from '@/utils/functions/formatters/format-date';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { getPublicLocalization } from '@/utils/functions/localization/get-public-localization';
import { mapToTag } from './localization';

export const mapToEventsNews = (dto: PublishedEventNewsDto, languageCode: string = DEFAULT_LOCALE): EventsNews => {
    const localization = getPublicLocalization(dto.localizations, languageCode);

    return {
        id: String(dto.id),
        name: localization?.title || dto.title || '',
        description: localization?.description || dto.description || '',
        date: dto.publishedAt ? formatDate(dto.publishedAt) : '',
        tag: mapToTag(dto.category, languageCode),
        resource:
            localization?.resource || (languageCode === 'en' ? dto.resourceEn : null) || dto.resource || undefined,
        previewImage: dto.previewImage ? getImageSrc(dto.previewImage) : '',
        backgroundImage: dto.backgroundImage ?? null,
        slug: dto.slug ?? '',
        sections: [],
    };
};
