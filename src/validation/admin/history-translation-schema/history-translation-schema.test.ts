import {
    HISTORY_TRANSLATION_VALIDATION,
    HISTORY_TRANSLATION_VALIDATION_FUNCTIONS,
    HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
    HistoryTranslationValidationSchema,
} from './history-translation-schema';

describe('HISTORY_TRANSLATION_VALIDATION_FUNCTIONS (real-time / onChange)', () => {
    describe('validateTitle', () => {
        it('returns undefined for a valid title', () => {
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle('Valid title')).toBeUndefined();
        });

        it('returns undefined for an empty string (not flagged in real-time)', () => {
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle('')).toBeUndefined();
        });

        it('returns undefined for a title shorter than min (not flagged in real-time)', () => {
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle('Hi')).toBeUndefined();
        });

        it('returns max-length error when title exceeds max', () => {
            const longTitle = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.title.max + 1);
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
                HISTORY_TRANSLATION_VALIDATION.title.getMaxError(),
            );
        });

        it('strips leading spaces before counting characters', () => {
            const titleWithLeadingSpaces = ' '.repeat(5) + 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.title.max - 3);
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(titleWithLeadingSpaces)).toBeUndefined();
        });

        it('collapses consecutive spaces before counting characters', () => {
            const titleWithConsecutiveSpaces = `${'a'.repeat(HISTORY_TRANSLATION_VALIDATION.title.max - 5)}     b`;
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle(titleWithConsecutiveSpaces)).toBeUndefined();
        });
    });

    describe('validateDescription', () => {
        it('returns undefined for a valid description', () => {
            const validDesc = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.description.min + 1);
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateDescription(validDesc)).toBeUndefined();
        });

        it('returns undefined for an empty string (not flagged in real-time)', () => {
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateDescription('')).toBeUndefined();
        });

        it('returns max-length error when description exceeds max', () => {
            const longDesc = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.description.max + 1);
            expect(HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateDescription(longDesc)).toBe(
                HISTORY_TRANSLATION_VALIDATION.description.getMaxError(),
            );
        });
    });
});

describe('HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS (on-blur)', () => {
    describe('validateTitle', () => {
        it('returns undefined for a valid title', () => {
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle('Valid title')).toBeUndefined();
        });

        it('returns required error for an empty string', () => {
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle('')).toBe(
                HISTORY_TRANSLATION_VALIDATION.title.getRequiredError(),
            );
        });

        it('returns required error for a whitespace-only string', () => {
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle('   ')).toBe(
                HISTORY_TRANSLATION_VALIDATION.title.getRequiredError(),
            );
        });

        it('returns min-length error when title is too short after trim', () => {
            const shortTitle = 'Hi';
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(shortTitle)).toBe(
                HISTORY_TRANSLATION_VALIDATION.title.getMinError(),
            );
        });

        it('returns max-length error when title exceeds max after trim', () => {
            const longTitle = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.title.max + 1);
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
                HISTORY_TRANSLATION_VALIDATION.title.getMaxError(),
            );
        });

        it('trims trailing/leading spaces before length checks', () => {
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle('  ab  ')).toBe(
                HISTORY_TRANSLATION_VALIDATION.title.getMinError(),
            );
        });

        it('returns undefined for title at exactly min length', () => {
            const minTitle = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.title.min);
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(minTitle)).toBeUndefined();
        });

        it('returns undefined for title at exactly max length', () => {
            const maxTitle = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.title.max);
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle(maxTitle)).toBeUndefined();
        });
    });

    describe('validateDescription', () => {
        it('returns undefined for a valid description', () => {
            const validDesc = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.description.min + 1);
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription(validDesc)).toBeUndefined();
        });

        it('returns required error for an empty string', () => {
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription('')).toBe(
                HISTORY_TRANSLATION_VALIDATION.description.getRequiredError(),
            );
        });

        it('returns required error for a whitespace-only string', () => {
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription('   ')).toBe(
                HISTORY_TRANSLATION_VALIDATION.description.getRequiredError(),
            );
        });

        it('returns min-length error when description is too short after trim', () => {
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription('Short')).toBe(
                HISTORY_TRANSLATION_VALIDATION.description.getMinError(),
            );
        });

        it('returns max-length error when description exceeds max', () => {
            const longDesc = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.description.max + 1);
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription(longDesc)).toBe(
                HISTORY_TRANSLATION_VALIDATION.description.getMaxError(),
            );
        });

        it('returns undefined for description at exactly min length', () => {
            const minDesc = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.description.min);
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription(minDesc)).toBeUndefined();
        });

        it('returns undefined for description at exactly max length', () => {
            const maxDesc = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.description.max);
            expect(HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription(maxDesc)).toBeUndefined();
        });
    });
});

describe('HistoryTranslationValidationSchema', () => {
    it('validates a correct object', async () => {
        const valid = { title: 'Valid Title', description: 'Valid Description' };
        await expect(HistoryTranslationValidationSchema.validate(valid)).resolves.toEqual(valid);
    });

    it('validates empty/null fields as valid (optional fields allowed)', async () => {
        const valid = { title: '', description: null };
        await expect(HistoryTranslationValidationSchema.validate(valid)).resolves.toEqual(valid);
    });

    it('fails validation if title is too short', async () => {
        const invalid = { title: 'Hi', description: 'Valid Description' };
        await expect(HistoryTranslationValidationSchema.validate(invalid)).rejects.toThrow(
            HISTORY_TRANSLATION_VALIDATION.title.getMinError(),
        );
    });

    it('fails validation if title is too long', async () => {
        const invalid = { title: 'a'.repeat(100), description: 'Valid Description' };
        await expect(HistoryTranslationValidationSchema.validate(invalid)).rejects.toThrow(
            HISTORY_TRANSLATION_VALIDATION.title.getMaxError(),
        );
    });

    it('fails validation if description is too short', async () => {
        const invalid = { title: 'Valid Title', description: 'Short' };
        await expect(HistoryTranslationValidationSchema.validate(invalid)).rejects.toThrow(
            HISTORY_TRANSLATION_VALIDATION.description.getMinError(),
        );
    });

    it('fails validation if description is too long', async () => {
        const invalid = { title: 'Valid Title', description: 'a'.repeat(700) };
        await expect(HistoryTranslationValidationSchema.validate(invalid)).rejects.toThrow(
            HISTORY_TRANSLATION_VALIDATION.description.getMaxError(),
        );
    });
});
