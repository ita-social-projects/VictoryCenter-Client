import { HippotherapyPageContentModel, HippotherapyPageLocalization } from '@/types/admin/hippotherapy-page';

const pick = (translated: string | null | undefined, base: string): string => (translated?.trim() ? translated : base);

const translatedById = <TItem, TKey extends keyof TItem>(
    items: TItem[] | undefined,
    idKey: TKey,
): Map<TItem[TKey], TItem> => new Map((items ?? []).map((item) => [item[idKey], item]));

const mapCards = <T extends { id: number | null; description: string }>(
    baseCards: T[],
    translated: { cardId: number; description: string }[] | undefined,
): T[] => {
    const byId = translatedById(translated, 'cardId');
    return baseCards.map((card) => ({
        ...card,
        description: pick(card.id === null ? undefined : byId.get(card.id)?.description, card.description),
    }));
};

export const applyHippotherapyLocalization = (
    content: HippotherapyPageContentModel,
    localization: HippotherapyPageLocalization | null,
): HippotherapyPageContentModel => {
    if (!localization) return content;

    const {
        introSection,
        descriptionSection,
        quoteSection,
        hippoventionSection,
        hippoventionCenterSection,
        advantagesSection,
        analysisSection,
        scientificReferencesSection,
        anotherQuoteSection,
        participantsSection,
        ethicsSection,
    } = localization;

    const referencesById = translatedById(scientificReferencesSection?.scientificReferences, 'id');
    const principlesById = translatedById(ethicsSection?.principles, 'principleId');

    return {
        ...content,
        introSection: {
            ...content.introSection,
            title: pick(introSection?.title, content.introSection.title),
            description: pick(introSection?.description, content.introSection.description),
        },
        descriptionSection: {
            title: pick(descriptionSection?.title, content.descriptionSection.title),
            description: pick(descriptionSection?.description, content.descriptionSection.description),
        },
        quoteSection: {
            ...content.quoteSection,
            quoteText: pick(quoteSection?.quoteText, content.quoteSection.quoteText),
            authorName: pick(quoteSection?.authorName, content.quoteSection.authorName),
        },
        hippoventionSection: {
            title: pick(hippoventionSection?.title, content.hippoventionSection.title),
            description: pick(hippoventionSection?.description, content.hippoventionSection.description),
        },
        hippoventionCenterSection: {
            ...content.hippoventionCenterSection,
            title: pick(hippoventionCenterSection?.title, content.hippoventionCenterSection.title),
            pros: pick(hippoventionCenterSection?.pros, content.hippoventionCenterSection.pros),
            description: pick(hippoventionCenterSection?.description, content.hippoventionCenterSection.description),
        },
        advantagesSection: {
            title: pick(advantagesSection?.title, content.advantagesSection.title),
            cards: mapCards(content.advantagesSection.cards, advantagesSection?.cards),
        },
        analysisSection: {
            title: pick(analysisSection?.title, content.analysisSection.title),
            description: pick(analysisSection?.description, content.analysisSection.description),
        },
        scientificReferencesSection: {
            title: pick(scientificReferencesSection?.title, content.scientificReferencesSection.title),
            description: pick(
                scientificReferencesSection?.description,
                content.scientificReferencesSection.description,
            ),
            scientificReferences: content.scientificReferencesSection.scientificReferences.map((reference) => ({
                ...reference,
                name: pick(reference.id === null ? undefined : referencesById.get(reference.id)?.name, reference.name),
            })),
        },
        anotherQuoteSection: {
            ...content.anotherQuoteSection,
            quoteText: pick(anotherQuoteSection?.quoteText, content.anotherQuoteSection.quoteText),
            authorName: pick(anotherQuoteSection?.authorName, content.anotherQuoteSection.authorName),
        },
        participantsSection: {
            title: pick(participantsSection?.title, content.participantsSection.title),
            cards: mapCards(content.participantsSection.cards, participantsSection?.cards),
        },
        ethicsSection: {
            ...content.ethicsSection,
            title: pick(ethicsSection?.title, content.ethicsSection.title),
            description: pick(ethicsSection?.description, content.ethicsSection.description),
            principles: content.ethicsSection.principles.map((principle) => ({
                ...principle,
                text: pick(principle.id === null ? undefined : principlesById.get(principle.id)?.text, principle.text),
            })),
        },
    };
};
