import { programValidationSchema, ProgramValidationContext, PROGRAM_VALIDATION_FUNCTIONS } from './program-schema';
import { PROGRAM_VALIDATION } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ImageValues, Image } from '@/types/common/image';
import { Program } from '@/types/admin/programs';

const createMockFile = (type = 'image/jpeg'): ImageValues => ({
    base64: 'fsdgdsgdsdgsdgsd',
    mimeType: type,
});

const createMockImage = (id = 1): Image => ({
    id,
    url: 'https://example.com/image.jpg',
    mimeType: 'image/jpeg',
});

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
    meetingsCount: 'Some meetings count 123',
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

        it('should pass with multiple categories', async () => {
            await expectValidationToPass(
                getValidData({
                    categories: [mockCategory, { id: 2, name: 'Another Category', programsCount: 3 }],
                }),
            );
        });

        it.each(invalidCategoryCases)('should fail when categories $description', async ({ data, expectedError }) => {
            await expectValidationToFail(data, expectedError);
        });
    });

    describe('Description validation (Draft mode)', () => {
        it('should pass with empty description', async () => {
            await expectValidationToPass(getValidData({ description: '' }));
        });

        it('should pass with valid description', async () => {
            await expectValidationToPass(getValidData({ description: 'Valid description text' }));
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

    describe('PreviewImage validation (Draft mode)', () => {
        it('should pass with null previewImage', async () => {
            await expectValidationToPass(getValidData({ previewImage: null }));
        });

        it('should pass with ImageValues previewImage', async () => {
            await expectValidationToPass(getValidData({ previewImage: createMockFile() }));
        });

        it('should pass with Image previewImage', async () => {
            await expectValidationToPass(getValidData({ previewImage: createMockImage() }));
        });
    });

    describe('PreviewImage validation (Publish mode)', () => {
        const publishContext = { isPublishing: true };

        it('should fail with null previewImage', async () => {
            await expectValidationToFail(
                getValidData({ previewImage: null }),
                PROGRAM_VALIDATION.previewImage.getRequiredWhenPublishingError(),
                publishContext,
            );
        });

        it('should pass with ImageValues previewImage', async () => {
            await expectValidationToPass(getValidData({ previewImage: createMockFile() }), publishContext);
        });

        it('should pass with Image previewImage', async () => {
            await expectValidationToPass(getValidData({ previewImage: createMockImage() }), publishContext);
        });
    });

    describe('BackgroundImage validation (Draft mode)', () => {
        it('should pass with null backgroundImage', async () => {
            await expectValidationToPass(getValidData({ backgroundImage: null }));
        });

        it('should pass with ImageValues backgroundImage', async () => {
            await expectValidationToPass(getValidData({ backgroundImage: createMockFile() }));
        });

        it('should pass with Image backgroundImage', async () => {
            await expectValidationToPass(getValidData({ backgroundImage: createMockImage() }));
        });
    });

    describe('BackgroundImage validation (Publish mode)', () => {
        const publishContext = { isPublishing: true };

        it('should fail with null backgroundImage', async () => {
            await expectValidationToFail(
                getValidData({ backgroundImage: null }),
                PROGRAM_VALIDATION.previewImage.getRequiredWhenPublishingError(),
                publishContext,
            );
        });

        it('should pass with ImageValues backgroundImage', async () => {
            await expectValidationToPass(getValidData({ backgroundImage: createMockFile() }), publishContext);
        });

        it('should pass with Image backgroundImage', async () => {
            await expectValidationToPass(getValidData({ backgroundImage: createMockImage() }), publishContext);
        });
    });

    describe('Location validation (Draft mode)', () => {
        it('should pass with empty location', async () => {
            await expectValidationToPass(getValidData({ location: '' }));
        });

        it('should pass with valid location', async () => {
            await expectValidationToPass(getValidData({ location: 'Kyiv' }));
        });

        it('should fail when location exceeds max length', async () => {
            await expectValidationToFail(
                getValidData({ location: 'A'.repeat(PROGRAM_VALIDATION.location.max + 1) }),
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.location.max),
            );
        });
    });

    describe('Location validation (Publish mode)', () => {
        const publishContext = { isPublishing: true };

        it('should fail with empty location', async () => {
            await expectValidationToFail(
                getValidData({ location: '' }),
                PROGRAM_VALIDATION.location.getRequiredWhenPublishingError(),
                publishContext,
            );
        });

        it('should pass with valid location', async () => {
            await expectValidationToPass(getValidData({ location: 'Kyiv' }), publishContext);
        });

        it('should fail when location exceeds max length', async () => {
            await expectValidationToFail(
                getValidData({ location: 'A'.repeat(PROGRAM_VALIDATION.location.max + 1) }),
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.location.max),
                publishContext,
            );
        });
    });

    describe('ParticipantsCount validation (Draft mode)', () => {
        it('should pass with empty participantsCount', async () => {
            await expectValidationToPass(getValidData({ participantsCount: '' }));
        });

        it('should pass with valid participantsCount', async () => {
            await expectValidationToPass(getValidData({ participantsCount: '50' }));
        });

        it('should fail when participantsCount exceeds max length', async () => {
            await expectValidationToFail(
                getValidData({ participantsCount: 'A'.repeat(PROGRAM_VALIDATION.participantsCount.max + 1) }),
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.participantsCount.max),
            );
        });
    });

    describe('ParticipantsCount validation (Publish mode)', () => {
        const publishContext = { isPublishing: true };

        it('should fail with empty participantsCount', async () => {
            await expectValidationToFail(
                getValidData({ participantsCount: '' }),
                PROGRAM_VALIDATION.participantsCount.getRequiredWhenPublishingError(),
                publishContext,
            );
        });

        it('should pass with valid participantsCount', async () => {
            await expectValidationToPass(getValidData({ participantsCount: '50' }), publishContext);
        });

        it('should fail when participantsCount exceeds max length', async () => {
            await expectValidationToFail(
                getValidData({ participantsCount: 'A'.repeat(PROGRAM_VALIDATION.participantsCount.max + 1) }),
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.participantsCount.max),
                publishContext,
            );
        });
    });

    describe('MeetingCount validation (Draft mode)', () => {
        it('should pass with empty meetingCount', async () => {
            await expectValidationToPass(getValidData({ meetingsCount: '' }));
        });

        it('should pass with valid meetingCount', async () => {
            await expectValidationToPass(getValidData({ meetingsCount: '10' }));
        });

        it('should fail when meetingCount exceeds max length', async () => {
            await expectValidationToFail(
                getValidData({ meetingsCount: 'A'.repeat(PROGRAM_VALIDATION.meetingCount.max + 1) }),
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.meetingCount.max),
            );
        });
    });

    describe('MeetingCount validation (Publish mode)', () => {
        const publishContext = { isPublishing: true };

        it('should fail with empty meetingCount', async () => {
            await expectValidationToFail(
                getValidData({ meetingsCount: '' }),
                PROGRAM_VALIDATION.meetingCount.getRequiredWhenPublishingError(),
                publishContext,
            );
        });

        it('should pass with valid meetingCount', async () => {
            await expectValidationToPass(getValidData({ meetingsCount: '10' }), publishContext);
        });

        it('should fail when meetingCount exceeds max length', async () => {
            await expectValidationToFail(
                getValidData({ meetingsCount: 'A'.repeat(PROGRAM_VALIDATION.meetingCount.max + 1) }),
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.meetingCount.max),
                publishContext,
            );
        });
    });
});

describe('PROGRAM_VALIDATION_FUNCTIONS', () => {
    describe('validateName', () => {
        it('should return undefined for valid name', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateName('Valid Name', false)).toBeUndefined();
        });

        it('should return error for empty name', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateName('', false)).toBe(
                PROGRAM_VALIDATION.name.getRequiredError(),
            );
        });

        it('should return error for name exceeding max length', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateName('A'.repeat(PROGRAM_VALIDATION.name.max + 1), false)).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.name.max),
            );
        });
    });

    describe('validateCategories', () => {
        it('should return undefined for valid categories', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateCategories([mockCategory], false)).toBeUndefined();
        });

        it('should return error for empty categories', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateCategories([], false)).toBe(
                PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError(),
            );
        });
    });

    describe('validateDescription', () => {
        it('should return undefined for empty description in draft mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateDescription('', false)).toBeUndefined();
        });

        it('should return error for empty description in publish mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateDescription('', true)).toBe(
                PROGRAM_VALIDATION.description.getRequiredWhenPublishingError(),
            );
        });

        it('should return error for description exceeding max length', () => {
            expect(
                PROGRAM_VALIDATION_FUNCTIONS.validateDescription(
                    'A'.repeat(PROGRAM_VALIDATION.description.max + 1),
                    false,
                ),
            ).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.description.max));
        });
    });

    describe('validatePreviewImage', () => {
        it('should return undefined for null image in draft mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(null, false)).toBeUndefined();
        });

        it('should return error for null image in publish mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(null, true)).toBe(
                PROGRAM_VALIDATION.previewImage.getRequiredWhenPublishingError(),
            );
        });

        it('should return undefined for valid ImageValues', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(createMockFile(), true)).toBeUndefined();
        });

        it('should return undefined for valid Image', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(createMockImage(), true)).toBeUndefined();
        });
    });

    describe('validateBackgroundImage', () => {
        it('should return undefined for null image in draft mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(null, false)).toBeUndefined();
        });

        it('should return error for null image in publish mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(null, true)).toBe(
                PROGRAM_VALIDATION.backgroundImage.getRequiredWhenPublishingError(),
            );
        });

        it('should return undefined for valid ImageValues', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(createMockFile(), true)).toBeUndefined();
        });

        it('should return undefined for valid Image', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(createMockImage(), true)).toBeUndefined();
        });
    });

    describe('validateLocation', () => {
        it('should return undefined for empty location in draft mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateLocation('', false)).toBeUndefined();
        });

        it('should return error for empty location in publish mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateLocation('', true)).toBe(
                PROGRAM_VALIDATION.location.getRequiredWhenPublishingError(),
            );
        });

        it('should return error for location exceeding max length', () => {
            expect(
                PROGRAM_VALIDATION_FUNCTIONS.validateLocation('A'.repeat(PROGRAM_VALIDATION.location.max + 1), false),
            ).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.location.max));
        });
    });

    describe('validateParticipantsCount', () => {
        it('should return undefined for empty participantsCount in draft mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount('', false)).toBeUndefined();
        });

        it('should return error for empty participantsCount in publish mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount('', true)).toBe(
                PROGRAM_VALIDATION.participantsCount.getRequiredWhenPublishingError(),
            );
        });

        it('should return error for participantsCount exceeding max length', () => {
            expect(
                PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount(
                    'A'.repeat(PROGRAM_VALIDATION.participantsCount.max + 1),
                    false,
                ),
            ).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.participantsCount.max));
        });
    });

    describe('validateMeetingCount', () => {
        it('should return undefined for empty meetingCount in draft mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount('', false)).toBeUndefined();
        });

        it('should return error for empty meetingCount in publish mode', () => {
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount('', true)).toBe(
                PROGRAM_VALIDATION.meetingCount.getRequiredWhenPublishingError(),
            );
        });

        it('should return error for meetingCount exceeding max length', () => {
            expect(
                PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount(
                    'A'.repeat(PROGRAM_VALIDATION.meetingCount.max + 1),
                    false,
                ),
            ).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.meetingCount.max));
        });
    });
});
