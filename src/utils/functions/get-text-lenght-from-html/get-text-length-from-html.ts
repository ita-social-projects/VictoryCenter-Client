import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

export const getTextLengthFromHtml = (html: string): number => {
    return getPlainTextFromHtml(html).length;
};
