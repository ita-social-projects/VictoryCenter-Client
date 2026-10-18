import { VisibilityStatus } from '@/types/admin/common';
import { EventCreateUpdateRequest, EventDetailsDto, EventLocalizationRequest } from '@/types/admin/events';
import { Image, ImageValues } from '@/types/common/image';
import { DEFAULT_UKRAINIAN_LANGUAGE_ID } from '@/const/common/locales';
import { EventFormValues } from '@/validation/admin/event-schema/event-schema';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';

type EventImage = Image | ImageValues | null | undefined;

interface EventRequestMappingParams {
    formValues: EventFormValues;
    status: VisibilityStatus;
    currentEvent: EventDetailsDto | null;
    currentCategoryId: number;
    fallbackBackgroundImage: EventImage;
}

export const getEventImageId = (image: EventImage): number | null => (image && 'id' in image ? image.id : null);

const mapUkrainianLocalization = (formValues: EventFormValues): EventLocalizationRequest => ({
    languageId: DEFAULT_UKRAINIAN_LANGUAGE_ID,
    title: getNormalizedInputText(formValues.title),
    description: getNormalizedInputText(formValues.description ?? ''),
    additionalDescription: getNormalizedInputText(formValues.additionalDescription ?? ''),
});

const mapEventLocalizations = (
    currentEvent: EventDetailsDto | null,
    ukrainianLocalization: EventLocalizationRequest,
): EventLocalizationRequest[] => {
    if (!currentEvent) return [ukrainianLocalization];

    const localizations = currentEvent.localizations.map((localization) =>
        localization.language.id === DEFAULT_UKRAINIAN_LANGUAGE_ID
            ? ukrainianLocalization
            : {
                  languageId: localization.language.id,
                  title: localization.title,
                  description: localization.description ?? '',
                  additionalDescription: localization.additionalDescription ?? '',
              },
    );

    return localizations.some(({ languageId }) => languageId === DEFAULT_UKRAINIAN_LANGUAGE_ID)
        ? localizations
        : [...localizations, ukrainianLocalization];
};

export const mapEventFormValuesToCreateUpdateRequest = ({
    formValues,
    status,
    currentEvent,
    currentCategoryId,
    fallbackBackgroundImage,
}: EventRequestMappingParams): EventCreateUpdateRequest => {
    const ukrainianLocalization = mapUkrainianLocalization(formValues);

    return {
        title: getNormalizedInputText(formValues.title),
        description: getNormalizedInputText(formValues.description ?? ''),
        additionalDescription: getNormalizedInputText(formValues.additionalDescription ?? ''),
        resource: getNormalizedInputText(formValues.linkUkr ?? ''),
        resourceEn: getNormalizedInputText(formValues.linkEng ?? ''),
        publishedAt: formValues.publishDate ? new Date(`${formValues.publishDate}T00:00:00.000Z`).toISOString() : null,
        status,
        previewImageId: null,
        backgroundImageId: getEventImageId(currentEvent?.backgroundImage) ?? getEventImageId(fallbackBackgroundImage),
        categoryId: currentEvent?.category.id ?? currentCategoryId,
        localizations: mapEventLocalizations(currentEvent, ukrainianLocalization),
    };
};
