import { HippotherapyPageContentModel, HippotherapyPageLocalization } from '@/types/admin/hippotherapy-page';

const pick = (translated: string | null | undefined, base: string): string => (translated?.trim() ? translated : base);

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

    const mapCards = (
        base: HippotherapyPageContentModel['advantagesSection'],
        translated?: { description: string }[],
    ) => base.cards.map((card, i) => ({ ...card, description: pick(translated?.[i]?.description, card.description) }));

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
            cards: mapCards(content.advantagesSection, advantagesSection?.cards),
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
                name: pick(
                    scientificReferencesSection?.scientificReferences?.find((item) => item.id === reference.id)?.name,
                    reference.name,
                ),
            })),
        },
        anotherQuoteSection: {
            ...content.anotherQuoteSection,
            quoteText: pick(anotherQuoteSection?.quoteText, content.anotherQuoteSection.quoteText),
            authorName: pick(anotherQuoteSection?.authorName, content.anotherQuoteSection.authorName),
        },
        participantsSection: {
            title: pick(participantsSection?.title, content.participantsSection.title),
            cards: mapCards(content.participantsSection, participantsSection?.cards),
        },
        ethicsSection: {
            ...content.ethicsSection,
            title: pick(ethicsSection?.title, content.ethicsSection.title),
            description: pick(ethicsSection?.description, content.ethicsSection.description),
            principles: content.ethicsSection.principles.map((principle, i) =>
                pick(ethicsSection?.principles?.[i], principle),
            ),
        },
    };
};
