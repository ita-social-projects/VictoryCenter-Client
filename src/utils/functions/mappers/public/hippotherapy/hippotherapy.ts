import {
    HippotherapyGalleryCardContent,
    HippotherapyImageValue,
    HippotherapyPageContentDto,
    HippotherapyPageEmbeddedLocalizationDto,
    HippotherapyPageLocalizationDto,
    HippotherapyQuoteContent,
} from '@/types/admin/hippotherapy-page';
import { HippotherapyAbout, HippotherapySwipedCard, Quote } from '@/types/public/hippotherapy-page';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { DEFAULT_LOCALE } from '@/const/common/locales';

const toPlain = (value: string): string => getPlainTextFromHtml(value).trim();

const getImageUrl = (value: HippotherapyImageValue): string => getImageSrc(value.image);

const resolveText = (localized: string | undefined | null, fallback: string): string =>
    localized?.trim() ? localized : fallback;

const resolvePlain = (localized: string | undefined | null, fallback: string): string =>
    toPlain(resolveText(localized, fallback));

const toQuote = (
    section: HippotherapyQuoteContent,
    localizedQuote?: { quoteText?: string; authorName?: string | null },
): Quote => {
    const quoteText = resolveText(localizedQuote?.quoteText, section.quoteText);
    const authorName =
        localizedQuote && localizedQuote.authorName !== undefined && localizedQuote.authorName !== null
            ? localizedQuote.authorName
            : section.authorName;

    return {
        text: toPlain(authorName) ? `${quoteText}<br /><br />${authorName}` : quoteText,
        imgURL: getImageUrl(section),
    };
};

const toSwipedCards = (
    cards: HippotherapyGalleryCardContent[],
    localizedCards?: Array<{ cardId?: number; description?: string }>,
): HippotherapySwipedCard[] =>
    cards.map((card, index) => {
        const cardId = (card as any).id;
        const localizedCard = localizedCards?.find((c) => c.cardId === cardId) ?? localizedCards?.[index];

        return {
            imgURL: getImageUrl(card),
            imgAlternativeText: '',
            text: resolvePlain(localizedCard?.description, card.description),
        };
    });

const toProsList = (pros: string): string[] =>
    pros
        .split(/<br\s*\/?>/i)
        .map((item) => toPlain(item))
        .filter(Boolean);

const getActiveLocalization = (
    localizations: HippotherapyPageEmbeddedLocalizationDto[] | HippotherapyPageLocalizationDto[] | undefined | null,
    languageCode: string,
) => {
    if (!localizations || !Array.isArray(localizations)) return null;
    const target = languageCode.toLowerCase();
    return (
        localizations.find(
            (loc: any) =>
                loc?.localizationInfoDto?.code?.toLowerCase() === target ||
                loc?.language?.code?.toLowerCase() === target ||
                loc?.code?.toLowerCase() === target,
        ) ?? null
    );
};

export const mapHippotherapyPageToAbout = (
    dto: HippotherapyPageContentDto,
    languageCode: string = DEFAULT_LOCALE,
): HippotherapyAbout => {
    const isDefault = languageCode.toLowerCase() === DEFAULT_LOCALE.toLowerCase();
    const activeLoc = isDefault ? null : getActiveLocalization(dto.localizations, languageCode);

    return {
        introSection: {
            imgURL: getImageUrl(dto.introSection),
            title: resolveText(activeLoc?.introSection?.title, dto.introSection.title),
            description: resolveText(activeLoc?.introSection?.description, dto.introSection.description),
        },
        descriptionSection: {
            title: resolveText(activeLoc?.descriptionSection?.title, dto.descriptionSection.title),
            text: resolveText(activeLoc?.descriptionSection?.description, dto.descriptionSection.description),
        },
        quoteSection: toQuote(dto.quoteSection, activeLoc?.quoteSection ?? undefined),
        hippoventionSection: {
            title: resolveText(activeLoc?.hippoventionSection?.title, dto.hippoventionSection.title),
            text: resolveText(activeLoc?.hippoventionSection?.description, dto.hippoventionSection.description),
        },
        hippoventionCenterSection: {
            title: resolvePlain(activeLoc?.hippoventionCenterSection?.title, dto.hippoventionCenterSection.title),
            imgURL: getImageUrl(dto.hippoventionCenterSection),
            pros: toProsList(
                resolveText(activeLoc?.hippoventionCenterSection?.pros, dto.hippoventionCenterSection.pros),
            ),
            text: resolvePlain(
                activeLoc?.hippoventionCenterSection?.description,
                dto.hippoventionCenterSection.description,
            ),
        },
        advantagesSection: {
            title: resolvePlain(activeLoc?.advantagesSection?.title, dto.advantagesSection.title),
            advantages: toSwipedCards(dto.advantagesSection.cards, activeLoc?.advantagesSection?.cards),
        },
        analysisSection: {
            title: resolveText(activeLoc?.analysisSection?.title, dto.analysisSection.title),
            text: resolveText(activeLoc?.analysisSection?.description, dto.analysisSection.description),
        },
        researchSection: {
            title: resolvePlain(activeLoc?.scientificReferencesSection?.title, dto.scientificReferencesSection.title),
            description: resolvePlain(
                activeLoc?.scientificReferencesSection?.description,
                dto.scientificReferencesSection.description,
            ),
            researches: dto.scientificReferencesSection.scientificReferences.map((reference, index) => {
                const localizedRefs =
                    (activeLoc?.scientificReferencesSection as any)?.references ??
                    (activeLoc?.scientificReferencesSection as any)?.scientificReferences;
                const localizedRef =
                    localizedRefs?.find((r: any) => (r.referenceId ?? r.id) === reference.id) ?? localizedRefs?.[index];

                return {
                    text: resolveText(localizedRef?.name, reference.name),
                    url: reference.url,
                };
            }),
        },
        anotherQuoteSection: toQuote(dto.anotherQuoteSection, activeLoc?.anotherQuoteSection ?? undefined),
        participantsSection: {
            title: resolvePlain(activeLoc?.participantsSection?.title, dto.participantsSection.title),
            participants: toSwipedCards(dto.participantsSection.cards, activeLoc?.participantsSection?.cards),
        },
        ethicsSection: {
            title: resolvePlain(activeLoc?.ethicsSection?.title, dto.ethicsSection.title),
            imgURL: getImageUrl(dto.ethicsSection),
            imgAlternativeText: '',
            text: resolvePlain(activeLoc?.ethicsSection?.description, dto.ethicsSection.description),
            principles: dto.ethicsSection.principles.map((principle, index) => {
                const localizedPrinciple = activeLoc?.ethicsSection?.principles?.[index];
                return resolvePlain(localizedPrinciple?.text, principle);
            }),
        },
    };
};
