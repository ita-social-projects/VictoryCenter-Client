import {
    FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS,
    FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
    FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS,
    FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
    FEEDBACK_VIDEO_TRANSLATION_VALIDATION_FUNCTIONS,
    FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
} from './feedback-translation-schema';
import {
    FEEDBACK_HISTORY_VALIDATION,
    FEEDBACK_REVIEW_VALIDATION,
    VIDEO_REVIEW_VALIDATION,
} from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

describe('FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS (real-time)', () => {
    it('returns undefined for a valid title', () => {
        expect(FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle('Valid title')).toBeUndefined();
    });

    it('returns undefined for an empty title (not flagged in real-time)', () => {
        expect(FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle('')).toBeUndefined();
    });

    it('returns max-length error when title exceeds max', () => {
        const longTitle = 'a'.repeat(FEEDBACK_HISTORY_VALIDATION.title.max + 1);
        expect(FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
            FEEDBACK_HISTORY_VALIDATION.title.getMaxError(),
        );
    });

    it('returns max-length error when story exceeds max', () => {
        const longStory = 'a'.repeat(FEEDBACK_HISTORY_VALIDATION.story.max + 1);
        expect(FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateStory(longStory)).toBe(
            FEEDBACK_HISTORY_VALIDATION.story.getMaxError(),
        );
    });
});

describe('FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS (on blur)', () => {
    it('returns required error for empty title', () => {
        expect(FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle('')).toBe(
            FEEDBACK_HISTORY_VALIDATION.title.getRequiredError(),
        );
    });

    it('returns required error for empty story', () => {
        expect(FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateStory('   ')).toBe(
            FEEDBACK_HISTORY_VALIDATION.story.getRequiredError(),
        );
    });

    it('returns min-length error for a too-short title', () => {
        const shortTitle = 'a'.repeat(FEEDBACK_HISTORY_VALIDATION.title.min - 1);
        expect(FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(shortTitle)).toBe(
            FEEDBACK_HISTORY_VALIDATION.title.getMinError(),
        );
    });

    it('returns undefined for a valid title', () => {
        const validTitle = 'a'.repeat(FEEDBACK_HISTORY_VALIDATION.title.min);
        expect(FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(validTitle)).toBeUndefined();
    });

    it('returns max error for a too-long title', () => {
        const longTitle = 'a'.repeat(FEEDBACK_HISTORY_VALIDATION.title.max + 1);
        expect(FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
            FEEDBACK_HISTORY_VALIDATION.title.getMaxError(),
        );
    });
});

describe('FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS (real-time)', () => {
    it('returns undefined for a valid authorName', () => {
        expect(FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS.validateAuthorName('John')).toBeUndefined();
    });

    it('returns max-length error when authorName exceeds max', () => {
        const longName = 'a'.repeat(FEEDBACK_REVIEW_VALIDATION.authorName.max + 1);
        expect(FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS.validateAuthorName(longName)).toBe(
            FEEDBACK_REVIEW_VALIDATION.authorName.getMaxError(),
        );
    });

    it('returns max-length error when text exceeds max', () => {
        const longText = 'a'.repeat(FEEDBACK_REVIEW_VALIDATION.text.max + 1);
        expect(FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS.validateText(longText)).toBe(
            FEEDBACK_REVIEW_VALIDATION.text.getMaxError(),
        );
    });
});

describe('FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS (on blur)', () => {
    it('returns required error for empty authorName', () => {
        expect(FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateAuthorName('')).toBe(
            FEEDBACK_REVIEW_VALIDATION.authorName.getRequiredError(),
        );
    });

    it('returns required error for empty text', () => {
        expect(FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateText('')).toBe(
            FEEDBACK_REVIEW_VALIDATION.text.getRequiredError(),
        );
    });

    it('returns min-length error for a too-short text', () => {
        const shortText = 'a'.repeat(FEEDBACK_REVIEW_VALIDATION.text.min - 1);
        expect(FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateText(shortText)).toBe(
            FEEDBACK_REVIEW_VALIDATION.text.getMinError(),
        );
    });

    it('returns undefined for valid authorName and text', () => {
        const validText = 'a'.repeat(FEEDBACK_REVIEW_VALIDATION.text.min);
        expect(FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateAuthorName('John')).toBeUndefined();
        expect(FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateText(validText)).toBeUndefined();
    });
});

describe('FEEDBACK_VIDEO_TRANSLATION_VALIDATION_FUNCTIONS (real-time)', () => {
    it('returns undefined for a valid title', () => {
        expect(FEEDBACK_VIDEO_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle('Valid title')).toBeUndefined();
    });

    it('returns max-length error when title exceeds max', () => {
        const longTitle = 'a'.repeat(VIDEO_REVIEW_VALIDATION.title.max + 1);
        expect(FEEDBACK_VIDEO_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(VIDEO_REVIEW_VALIDATION.title.max),
        );
    });
});

describe('FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS (on blur)', () => {
    it('returns required error for empty title', () => {
        expect(FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle('')).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        );
    });

    it('returns min-length error for a too-short title', () => {
        const shortTitle = 'a'.repeat(VIDEO_REVIEW_VALIDATION.title.min - 1);
        expect(FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(shortTitle)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(VIDEO_REVIEW_VALIDATION.title.min),
        );
    });

    it('returns undefined for a valid title', () => {
        const validTitle = 'a'.repeat(VIDEO_REVIEW_VALIDATION.title.min);
        expect(FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(validTitle)).toBeUndefined();
    });

    it('returns max error for a too-long title', () => {
        const longTitle = 'a'.repeat(VIDEO_REVIEW_VALIDATION.title.max + 1);
        expect(FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(VIDEO_REVIEW_VALIDATION.title.max),
        );
    });
});
