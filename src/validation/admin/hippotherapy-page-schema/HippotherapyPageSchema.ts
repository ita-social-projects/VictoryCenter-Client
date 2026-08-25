import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { HippotherapyImageValue, HippotherapyPageContentModel } from '@/types/admin/hippotherapy-page';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

export const HippotherapyPageTextSchema = (length: number) =>
    Yup.object({
        text: Yup.string()
            .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
            .min(length, COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(length)),
    });

export const HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS = {
    validateText: (
        value: string | null,
        length: number = HIPPOTHERAPY_PAGE_TEXT.MIN_TEXT_LENGTH,
    ): string | undefined => {
        try {
            HippotherapyPageTextSchema(length).validateSyncAt('text', { text: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

const isValidText = (value: string, minLength?: number): boolean =>
    !HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(value, minLength);

const isValidHtmlText = (value: string, minLength?: number): boolean =>
    isValidText(getPlainTextFromHtml(value), minLength);

const isValidTitle = (value: string): boolean => isValidHtmlText(value, HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH);

const isValidOptionalHtmlText = (value: string): boolean =>
    !getPlainTextFromHtml(value).trim() || isValidHtmlText(value);

const isValidImage = (value: HippotherapyImageValue): boolean => !!(value.image || value.imageId);

export const isHippotherapyPageContentValid = (content: HippotherapyPageContentModel): boolean => {
    return (
        isValidImage(content.introSection) &&
        isValidTitle(content.introSection.title) &&
        isValidHtmlText(content.introSection.description) &&
        isValidTitle(content.descriptionSection.title) &&
        isValidHtmlText(content.descriptionSection.description) &&
        isValidImage(content.quoteSection) &&
        isValidHtmlText(content.quoteSection.quoteText) &&
        isValidHtmlText(content.quoteSection.authorName) &&
        isValidTitle(content.hippoventionSection.title) &&
        isValidHtmlText(content.hippoventionSection.description) &&
        isValidImage(content.hippoventionCenterSection) &&
        isValidTitle(content.hippoventionCenterSection.title) &&
        isValidOptionalHtmlText(content.hippoventionCenterSection.description) &&
        isValidHtmlText(content.hippoventionCenterSection.pros) &&
        isValidTitle(content.advantagesSection.title) &&
        content.advantagesSection.cards.every((card) => isValidImage(card) && isValidHtmlText(card.description)) &&
        isValidTitle(content.analysisSection.title) &&
        isValidHtmlText(content.analysisSection.description) &&
        isValidTitle(content.scientificReferencesSection.title) &&
        isValidHtmlText(content.scientificReferencesSection.description) &&
        content.scientificReferencesSection.scientificReferences.every(
            (reference) => isValidText(reference.name) && isValidText(reference.url),
        ) &&
        isValidImage(content.anotherQuoteSection) &&
        isValidHtmlText(content.anotherQuoteSection.quoteText) &&
        isValidHtmlText(content.anotherQuoteSection.authorName) &&
        isValidTitle(content.participantsSection.title) &&
        content.participantsSection.cards.every((card) => isValidImage(card) && isValidHtmlText(card.description)) &&
        isValidImage(content.ethicsSection) &&
        isValidTitle(content.ethicsSection.title) &&
        isValidHtmlText(content.ethicsSection.description) &&
        content.ethicsSection.principles.every((principle) => isValidHtmlText(principle))
    );
};
