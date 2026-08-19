import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { HippotherapyImageValue, HippotherapyPageContentModel } from '@/types/admin/hippotherapy-page';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

export const HippotherapyPageTextSchema = Yup.object({
    text: Yup.string()
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .min(
            HIPPOTHERAPY_PAGE_TEXT.MIN_LENGTH,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(HIPPOTHERAPY_PAGE_TEXT.MIN_LENGTH),
        ),
});

export const HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS = {
    validateText: (value: string | null): string | undefined => {
        try {
            HippotherapyPageTextSchema.validateSyncAt('text', { text: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

const isValidText = (value: string): boolean => !HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(value);

const isValidHtmlText = (value: string): boolean => isValidText(getPlainTextFromHtml(value));

const isValidImage = (value: HippotherapyImageValue): boolean => !!(value.image || value.imageId);

export const isHippotherapyPageContentValid = (content: HippotherapyPageContentModel): boolean => {
    return (
        isValidImage(content.introSection) &&
        isValidHtmlText(content.introSection.title) &&
        isValidHtmlText(content.introSection.description) &&
        isValidHtmlText(content.descriptionSection.title) &&
        isValidHtmlText(content.descriptionSection.description) &&
        isValidImage(content.quoteSection) &&
        isValidHtmlText(content.quoteSection.quoteText) &&
        isValidHtmlText(content.quoteSection.authorName) &&
        isValidHtmlText(content.hippoventionSection.title) &&
        isValidHtmlText(content.hippoventionSection.description) &&
        isValidImage(content.hippoventionCenterSection) &&
        isValidHtmlText(content.hippoventionCenterSection.title) &&
        isValidHtmlText(content.hippoventionCenterSection.description) &&
        isValidHtmlText(content.hippoventionCenterSection.pros) &&
        isValidHtmlText(content.advantagesSection.title) &&
        content.advantagesSection.cards.every((card) => isValidImage(card) && isValidHtmlText(card.description)) &&
        isValidHtmlText(content.analysisSection.title) &&
        isValidHtmlText(content.analysisSection.description) &&
        isValidHtmlText(content.scientificReferencesSection.title) &&
        isValidHtmlText(content.scientificReferencesSection.description) &&
        content.scientificReferencesSection.scientificReferences.every(
            (reference) => isValidText(reference.name) && isValidText(reference.url),
        ) &&
        isValidImage(content.anotherQuoteSection) &&
        isValidHtmlText(content.anotherQuoteSection.quoteText) &&
        isValidHtmlText(content.anotherQuoteSection.authorName) &&
        isValidHtmlText(content.participantsSection.title) &&
        content.participantsSection.cards.every((card) => isValidImage(card) && isValidHtmlText(card.description)) &&
        isValidImage(content.ethicsSection) &&
        isValidHtmlText(content.ethicsSection.title) &&
        isValidHtmlText(content.ethicsSection.description) &&
        content.ethicsSection.principles.every(isValidHtmlText)
    );
};
