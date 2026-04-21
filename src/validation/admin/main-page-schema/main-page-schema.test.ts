import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MAIN_PAGE_VALIDATION_FUNCTIONS } from './main-page-schema';

describe('MAIN_PAGE_VALIDATION_FUNCTIONS', () => {
    describe('validateTitle', () => {
        it('returns undefined for a valid title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('Коні з досвідом зцілення')).toBeUndefined();
        });

        it('returns required error for an empty title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('')).toBe(MAIN_PAGE_VALIDATION.common.REQUIRED);
        });

        it('treats spaces as empty and returns required error', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('   ')).toBe(MAIN_PAGE_VALIDATION.common.REQUIRED);
        });

        it('returns max error for title longer than 50 chars', () => {
            const longTitle = 'a'.repeat(MAIN_PAGE_VALIDATION.title.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
                MAIN_PAGE_VALIDATION.title.getMaxError(),
            );
        });
    });

    describe('validateDescription', () => {
        it('returns undefined for a valid description', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription('Це коректний опис для блоку.')).toBeUndefined();
        });

        it('returns required error for an empty description', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription('')).toBe(MAIN_PAGE_VALIDATION.common.REQUIRED);
        });

        it('treats spaces as empty and returns required error', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription('      ')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns max error for description longer than 1000 chars', () => {
            const longDescription = 'a'.repeat(MAIN_PAGE_VALIDATION.description.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription(longDescription)).toBe(
                MAIN_PAGE_VALIDATION.description.getMaxError(),
            );
        });
    });

    describe('validateImage', () => {
        it('returns undefined for null (optional field)', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateImage(null)).toBeUndefined();
        });

        it('returns undefined for ImageValues object', () => {
            const mockImageValues = {
                file: new File([''], 'test.png', { type: 'image/png' }),
                preview: 'blob:http://localhost/test',
            };
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateImage(mockImageValues as any)).toBeUndefined();
        });

        it('returns undefined for existing Image object', () => {
            const mockImage = {
                id: 123,
                url: 'http://example.com/image.jpg',
            };
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateImage(mockImage as any)).toBeUndefined();
        });
    });
});
