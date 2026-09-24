import * as Yup from 'yup';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

export interface EventsPageTextValidationRule {
    min: number;
    max: number;
    getRequiredError: () => string;
    getMinError: () => string;
    getMaxError: () => string;
}

const getNormalizedVisibleText = (html: string): string => getNormalizedInputText(getPlainTextFromHtml(html));

export const EventsPageTextSchema = (validationRule: EventsPageTextValidationRule) =>
    Yup.object({
        text: Yup.string()
            .transform((_value, originalValue) => getNormalizedVisibleText(String(originalValue ?? '')))
            .required(validationRule.getRequiredError())
            .min(validationRule.min, validationRule.getMinError())
            .max(validationRule.max, validationRule.getMaxError()),
    });

export const getEventsPageTextValidationError = (
    value: string,
    validationRule: EventsPageTextValidationRule,
): string | undefined => {
    try {
        EventsPageTextSchema(validationRule).validateSync({ text: value });
        return undefined;
    } catch (error: unknown) {
        return error instanceof Yup.ValidationError ? error.message : undefined;
    }
};

export const isEventsPageTextOverMaxLength = (value: string, validationRule: EventsPageTextValidationRule): boolean =>
    getNormalizedVisibleText(value).length > validationRule.max;