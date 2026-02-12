import { FAQ_VALIDATION } from '@/const/admin/faq';
import { FAQ_VALIDATION_FUNCTIONS } from './faq-schema';

describe('FAQ_VALIDATION_FUNCTIONS', () => {
    describe('validateQuestion', () => {
        it('returns undefined for valid question', () => {
            expect(FAQ_VALIDATION_FUNCTIONS.validateQuestion('Valid question with enough length')).toBeUndefined();
        });

        it('returns required error for empty question', () => {
            const result = FAQ_VALIDATION_FUNCTIONS.validateQuestion('');
            expect(Array.isArray(result)).toBe(true);
            expect(result?.[0]).toBe(FAQ_VALIDATION.question.getRequiredError());
        });

        it('returns error for too short question', () => {
            const result = FAQ_VALIDATION_FUNCTIONS.validateQuestion('Test');

            expect(Array.isArray(result)).toBe(true);
            expect(result?.[0]).toBe(FAQ_VALIDATION.question.getMinError());
        });

        it('returns error for too long question', () => {
            const longStr = 'a'.repeat(FAQ_VALIDATION.question.max + 1);
            const result = FAQ_VALIDATION_FUNCTIONS.validateQuestion(longStr);

            expect(Array.isArray(result)).toBe(true);
            expect(result?.[0]).toBe(FAQ_VALIDATION.question.getMaxError());
        });
    });

    describe('validateAnswer', () => {
        it('returns undefined for valid answer', () => {
            const validAnswer = 'a'.repeat(FAQ_VALIDATION.answer.min + 1);
            expect(FAQ_VALIDATION_FUNCTIONS.validateAnswer(validAnswer)).toBeUndefined();
        });

        it('returns required error for empty answer', () => {
            const result = FAQ_VALIDATION_FUNCTIONS.validateAnswer('');
            expect(typeof result).toBe('string');
            expect(result).toBe(FAQ_VALIDATION.answer.getRequiredWhenPublishingError());
        });

        it('returns error for too short answer', () => {
            const result = FAQ_VALIDATION_FUNCTIONS.validateAnswer('Too short');

            expect(typeof result).toBe('string');
            expect(result).toBe(FAQ_VALIDATION.answer.getMinError());
        });

        it('returns error for too long answer', () => {
            const longStr = 'a'.repeat(FAQ_VALIDATION.answer.max + 1);
            const result = FAQ_VALIDATION_FUNCTIONS.validateAnswer(longStr);

            expect(typeof result).toBe('string');
            expect(result).toBe(FAQ_VALIDATION.answer.getMaxError());
        });
    });

    describe('validatePages', () => {
        it('returns undefined for valid pages', () => {
            expect(FAQ_VALIDATION_FUNCTIONS.validatePages([{ id: 1, name: 'Page' }] as any)).toBeUndefined();
        });

        it('returns error for empty pages', () => {
            const result = FAQ_VALIDATION_FUNCTIONS.validatePages([]);
            expect(typeof result).toBe('string');
            expect(result).toBe(FAQ_VALIDATION.pages.getAtLeastOneRequiredError());
        });
    });
});
