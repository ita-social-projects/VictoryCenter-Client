import { TEAM_CATEGORY_VALIDATION } from '@/const/admin/team';
import { TEAM_CATEGORY_VALIDATION_FUNCTIONS } from './team-category-schema';

describe('TeamCategoryValidationSchema', () => {
    const validName = 'N'.repeat(TEAM_CATEGORY_VALIDATION.name.min + 1);
    const shortName = 'N'.repeat(TEAM_CATEGORY_VALIDATION.name.min - 1);
    const longName = 'N'.repeat(TEAM_CATEGORY_VALIDATION.name.max + 1);
    const leadingSpaceName = ` ${validName}`;
    const trailingSpaceName = `${validName} `;

    const validDescription = 'D'.repeat(TEAM_CATEGORY_VALIDATION.description.min + 1);
    const shortDescription = 'D'.repeat(TEAM_CATEGORY_VALIDATION.description.min - 1);
    const longDescription = 'D'.repeat(TEAM_CATEGORY_VALIDATION.description.max + 1);
    const leadingSpaceDescription = ` ${validDescription}`;
    const trailingSpaceDescription = `${validDescription} `;

    describe('name validation', () => {
        it('passes with valid name', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(validName)).toBeUndefined();
        });

        it('fails when name is missing', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(null!)).toBe(
                TEAM_CATEGORY_VALIDATION.name.getRequiredError(),
            );
        });

        it('fails when name is empty', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName('')).toBe(
                TEAM_CATEGORY_VALIDATION.name.getRequiredError(),
            );
        });

        it('fails when name is only whitespace', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName('   ')).toBe(
                TEAM_CATEGORY_VALIDATION.name.getRequiredError(),
            );
        });

        it('fails when name is too short', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(shortName)).toBe(
                TEAM_CATEGORY_VALIDATION.name.getMinError(),
            );
        });

        it('fails when name is too long', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(longName)).toBe(
                TEAM_CATEGORY_VALIDATION.name.getMaxError(),
            );
        });

        it('fails when name has a leading space', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(leadingSpaceName)).toBe(
                TEAM_CATEGORY_VALIDATION.name.getNoSpacesError(),
            );
        });

        it('fails when name has a trailing space', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateName(trailingSpaceName)).toBe(
                TEAM_CATEGORY_VALIDATION.name.getNoSpacesError(),
            );
        });
    });

    describe('description validation', () => {
        it('passes with valid description', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(validDescription)).toBeUndefined();
        });

        it('fails when description is missing', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(null!)).toBe(
                TEAM_CATEGORY_VALIDATION.description.getRequiredError(),
            );
        });

        it('fails when description is empty', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription('')).toBe(
                TEAM_CATEGORY_VALIDATION.description.getRequiredError(),
            );
        });

        it('fails when description is only whitespace', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription('   ')).toBe(
                TEAM_CATEGORY_VALIDATION.description.getRequiredError(),
            );
        });

        it('fails when description is too short', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(shortDescription)).toBe(
                TEAM_CATEGORY_VALIDATION.description.getMinError(),
            );
        });

        it('fails when description is too long', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(longDescription)).toBe(
                TEAM_CATEGORY_VALIDATION.description.getMaxError(),
            );
        });

        it('fails when description has a leading space', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(leadingSpaceDescription)).toBe(
                TEAM_CATEGORY_VALIDATION.description.getNoSpacesError(),
            );
        });

        it('fails when description has a trailing space', async () => {
            expect(TEAM_CATEGORY_VALIDATION_FUNCTIONS.validateDescription(trailingSpaceDescription)).toBe(
                TEAM_CATEGORY_VALIDATION.description.getNoSpacesError(),
            );
        });
    });
});
