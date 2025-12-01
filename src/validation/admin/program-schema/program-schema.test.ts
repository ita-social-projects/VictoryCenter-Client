import { programValidationSchema, ProgramValidationContext } from './program-schema';
import { PROGRAM_VALIDATION } from '../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { ImageValues } from '../../../types/common/image';
import { Program } from '../../../types/admin/programs';

const createMockFile = (type = 'image/jpeg', size = 1024) => {
    const image: ImageValues = {
        base64: 'fsdgdsgdsdgsdgsd',
        mimeType: type,
    };
    return image;
};

const mockCategory = {
    id: 1,
    name: 'Test Category',
    programsCount: 5,
};

const getValidData = (overrides?: Partial<Program>): Partial<Program> => ({
    name: 'Valid Program Name',
    categories: [mockCategory],
    description: 'This is a valid description with enough characters.',
    participantsCount: 'Some participants 123',
    meetingCount: 'Some meetings count 123',
    backgroundImage: createMockFile(),
    previewImage: createMockFile(),
    location: 'Location 123',
    ...overrides,
});

const expectValidationToPass = async (data: any, context?: ProgramValidationContext) => {
    await expect(programValidationSchema.validate(data, { context })).resolves.toBeDefined();
};

const expectValidationToFail = async (data: any, expectedError: string, context?: ProgramValidationContext) => {
    await expect(programValidationSchema.validate(data, { context })).rejects.toThrow(expectedError);
};

describe('Program Validation Schema', () => {
    describe('Name validation', () => {
        const invalidNameCases = [
            {
                description: 'is empty',
                data: getValidData({ name: '' }),
                expectedError: PROGRAM_VALIDATION.name.getRequiredError(),
            },
            {
                description: 'is too short',
                data: getValidData({ name: 'A' }),
                expectedError: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.name.min),
            },
            {
                description: 'is too long',
                data: getValidData({ name: 'A'.repeat(PROGRAM_VALIDATION.name.max + 1) }),
                expectedError: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.name.max),
            },
        ];

        it('should pass with a valid name', async () => {
            await expectValidationToPass(getValidData());
        });

        it.each(invalidNameCases)('should fail when name $description', async ({ data, expectedError }) => {
            await expectValidationToFail(data, expectedError);
        });
    });

    describe('Categories validation', () => {
        const invalidCategoryCases = [
            {
                description: 'is an empty array',
                data: getValidData({ categories: [] }),
                expectedError: PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError(),
            },
            {
                description: 'is null',
                data: getValidData({ categories: null! }),
                expectedError: PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError(),
            },
        ];

        it('should pass with valid categories', async () => {
            await expectValidationToPass(getValidData());
        });

        it.each(invalidCategoryCases)('should fail when categories $description', async ({ data, expectedError }) => {
            await expectValidationToFail(data, expectedError);
        });
    });

    describe('Description validation (Draft mode)', () => {
        it('should pass with empty description', async () => {
            await expectValidationToPass(getValidData({ description: '' }));
        });

        it('should fail when description exceeds max length', async () => {
            const data = getValidData({ description: 'A'.repeat(PROGRAM_VALIDATION.description.max + 1) });
            await expectValidationToFail(
                data,
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.description.max),
            );
        });
    });

    describe('Description validation (Publish mode)', () => {
        const publishContext = { isPublishing: true };
        const validDataForPublish = getValidData({ previewImage: createMockFile(), backgroundImage: createMockFile() });

        const invalidPublishCases = [
            {
                description: 'is empty',
                data: { ...validDataForPublish, description: '' },
                expectedError: PROGRAM_VALIDATION.description.getRequiredWhenPublishingError(),
            },
            {
                description: 'is too short',
                data: { ...validDataForPublish, description: 'Short' },
                expectedError: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.description.min),
            },
            {
                description: 'is too long',
                data: { ...validDataForPublish, description: 'A'.repeat(PROGRAM_VALIDATION.description.max + 1) },
                expectedError: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.description.max),
            },
        ];

        it('should pass with a valid description', async () => {
            await expectValidationToPass(validDataForPublish, publishContext);
        });

        it.each(invalidPublishCases)('should fail when description $description', async ({ data, expectedError }) => {
            await expectValidationToFail(data, expectedError, publishContext);
        });
    });
});
