import { TEAM_MEMBER_VALIDATION } from '@/const/admin/team';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from './team-member-schema';

describe('teamMemberValidationSchema', () => {
    const validFullName = 'John Doe';
    const invalidFullNameShort = 'J'.repeat(TEAM_MEMBER_VALIDATION.fullName.min - 1);
    const invalidFullNameLong = 'J'.repeat(TEAM_MEMBER_VALIDATION.fullName.max + 1);
    const invalidFullNamePattern = 'John123#';

    const validDescription = 'This is a valid description';
    const invalidDescriptionShort = 'a'.repeat(TEAM_MEMBER_VALIDATION.description.min - 1);
    const invalidDescriptionLong = 'a'.repeat(TEAM_MEMBER_VALIDATION.description.max + 1);

    const validCategory = 1;
    const invalidCategory = null;

    const validImageObj = { base64: 'abc', mimeType: 'image/png', size: 1000 };
    const validImageValue = { url: 'https://localhost:8080', mimeType: 'image/png', id: 1000 };

    describe('fullName validation', () => {
        it('accepts valid fullName', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(validFullName, false)).toBeUndefined();
        });

        it('rejects empty fullName', () => {
            const errors = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName('', false);
            expect(errors).toEqual([TEAM_MEMBER_VALIDATION.fullName.getRequiredError()]);
        });

        it('rejects too short fullName', () => {
            const errors = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(invalidFullNameShort, false);
            expect(errors).toEqual([TEAM_MEMBER_VALIDATION.fullName.getMinError()]);
        });

        it('rejects too long fullName', () => {
            const errors = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(invalidFullNameLong, false);
            expect(errors).toEqual([TEAM_MEMBER_VALIDATION.fullName.getMaxError()]);
        });

        it('rejects fullName with digits and special characters', () => {
            const errors = TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(invalidFullNamePattern, false);
            expect(errors).toHaveLength(2);
            expect(errors).toContain(TEAM_MEMBER_VALIDATION.fullName.getDigitsError());
            expect(errors).toContain(TEAM_MEMBER_VALIDATION.fullName.getInvalidCharsError());
        });
    });

    describe('description validation', () => {
        it('rejects short description when not publishing', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(invalidDescriptionShort, false)).toBe(
                TEAM_MEMBER_VALIDATION.description.getMinError(),
            );
        });

        it('accepts description with multiple spaces', () => {
            const descriptionWithMultipleSpaces = 'Valid  text with multiple spaces';
            expect(
                TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(descriptionWithMultipleSpaces, false),
            ).toBeUndefined();
        });
        it('rejects empty description when not publishing', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription('', false)).toBe(
                TEAM_MEMBER_VALIDATION.description.getRequiredError(),
            );
        });

        it('rejects description too long', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(invalidDescriptionLong, false)).toBe(
                TEAM_MEMBER_VALIDATION.description.getMaxError(),
            );
        });

        it('requires description when publishing and not provided', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription('', true)).toBe(
                TEAM_MEMBER_VALIDATION.description.getRequiredError(),
            );
        });

        it('requires description to be minimum length when publishing', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(invalidDescriptionShort, true)).toBe(
                TEAM_MEMBER_VALIDATION.description.getMinError(),
            );
        });

        it('accepts valid description when publishing', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(validDescription, true)).toBeUndefined();
        });

        it('accepts description with multiple spaces when publishing', () => {
            const descriptionWithMultipleSpaces = 'Valid  text with multiple spaces';
            expect(
                TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(descriptionWithMultipleSpaces, true),
            ).toBeUndefined();
        });

        it('accepts valid image object with id property', () => {
            const imageWithId = { id: 123 };
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(imageWithId as any, true)).toBeUndefined();
        });

        it('accepts image object with id that is a number', () => {
            const imageWithNumericId = { id: 456, someOtherProp: 'value' };
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(imageWithNumericId as any, true)).toBeUndefined();
        });
    });

    describe('category validation', () => {
        it('accepts valid category', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateCategory(validCategory, false)).toBeUndefined();
        });

        it('rejects missing category', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateCategory(invalidCategory as any, false)).toBe(
                TEAM_MEMBER_VALIDATION.category.getRequiredError(),
            );
        });
    });

    describe('image validation', () => {
        it('accepts null image when not publishing', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(null, false)).toBeUndefined();
        });

        it('requires image when publishing', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(null, true)).toBe(
                TEAM_MEMBER_VALIDATION.img.getRequiredWhenPublishingError(),
            );
        });

        it('accepts valid image object with id', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(validImageObj, true)).toBeUndefined();
        });

        it('accepts valid image string', () => {
            expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateImage(validImageValue, true)).toBeUndefined();
        });
    });
});
