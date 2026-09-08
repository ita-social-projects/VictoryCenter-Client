import {
    HippotherapyGalleryCardContent,
    HippotherapyImageValue,
    HippotherapyPageContentDto,
    HippotherapyQuoteContent,
} from '@/types/admin/hippotherapy-page';
import { HippotherapyAbout, HippotherapySwipedCard, Quote } from '@/types/public/hippotherapy-page';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

const toPlain = (value: string): string => getPlainTextFromHtml(value).trim();

const getImageUrl = (value: HippotherapyImageValue): string =>
    value.image && 'url' in value.image ? value.image.url : '';

const toQuote = (section: HippotherapyQuoteContent): Quote => ({
    text: toPlain(section.authorName) ? `${section.quoteText}<br /><br />${section.authorName}` : section.quoteText,
    imgURL: getImageUrl(section),
});

const toSwipedCards = (cards: HippotherapyGalleryCardContent[]): HippotherapySwipedCard[] =>
    cards.map((card) => ({
        imgURL: getImageUrl(card),
        imgAlternativeText: '',
        text: toPlain(card.description),
    }));

const toProsList = (pros: string): string[] =>
    pros
        .split(/<br\s*\/?>/i)
        .map((item) => toPlain(item))
        .filter(Boolean);

export const mapHippotherapyPageToAbout = (dto: HippotherapyPageContentDto): HippotherapyAbout => ({
    introSection: {
        imgURL: getImageUrl(dto.introSection),
        title: dto.introSection.title,
        description: dto.introSection.description,
    },
    descriptionSection: {
        title: dto.descriptionSection.title,
        text: dto.descriptionSection.description,
    },
    quoteSection: toQuote(dto.quoteSection),
    hippoventionSection: {
        title: dto.hippoventionSection.title,
        text: dto.hippoventionSection.description,
    },
    hippoventionCenterSection: {
        title: toPlain(dto.hippoventionCenterSection.title),
        imgURL: getImageUrl(dto.hippoventionCenterSection),
        pros: toProsList(dto.hippoventionCenterSection.pros),
        text: toPlain(dto.hippoventionCenterSection.description),
    },
    advantagesSection: {
        title: toPlain(dto.advantagesSection.title),
        advantages: toSwipedCards(dto.advantagesSection.cards),
    },
    analysisSection: {
        title: dto.analysisSection.title,
        text: dto.analysisSection.description,
    },
    researchSection: {
        title: toPlain(dto.scientificReferencesSection.title),
        description: toPlain(dto.scientificReferencesSection.description),
        researches: dto.scientificReferencesSection.scientificReferences.map((reference) => ({
            text: reference.name,
            url: reference.url,
        })),
    },
    anotherQuoteSection: toQuote(dto.anotherQuoteSection),
    participantsSection: {
        title: toPlain(dto.participantsSection.title),
        participants: toSwipedCards(dto.participantsSection.cards),
    },
    ethicsSection: {
        title: toPlain(dto.ethicsSection.title),
        imgURL: getImageUrl(dto.ethicsSection),
        imgAlternativeText: '',
        text: toPlain(dto.ethicsSection.description),
        principles: dto.ethicsSection.principles.map(toPlain),
    },
});
