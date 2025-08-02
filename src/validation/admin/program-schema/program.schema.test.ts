import { programValidationSchema, ProgramValidationContext } from './program-scheme';
import { PROGRAM_VALIDATION } from '../../../const/admin/programs';
import { Image } from '../../../types/common/image';

const createMockFile = (type = 'image/jpeg', size = 1024) => {
    const image: Image = {
        base64: 'fsdgdsgdsdgsdgsd',
        size: size,
        id: 1,
        mimeType: type,
    };
    return image;
};

const mockCategory = {
    id: 1,
    name: 'Test Category',
    programsCount: 5,
};

const getValidData = (overrides?: any) => ({
    name: 'Valid Program Name',
    categories: [mockCategory],
    description: 'This is a valid description with enough characters.',
    img: 'existing-image.jpg',
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
                expectedError: PROGRAM_VALIDATION.name.getMinError(),
            },
            {
                description: 'is too long',
                data: getValidData({ name: 'A'.repeat(PROGRAM_VALIDATION.name.max + 1) }),
                expectedError: PROGRAM_VALIDATION.name.getMaxError(),
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
                data: getValidData({ categories: null }),
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
            await expectValidationToFail(data, PROGRAM_VALIDATION.description.getMaxError());
        });
    });

    describe('Description validation (Publish mode)', () => {
        const publishContext = { isPublishing: true };
        const validDataForPublish = getValidData({ img: createMockFile() });

        const invalidPublishCases = [
            {
                description: 'is empty',
                data: { ...validDataForPublish, description: '' },
                expectedError: PROGRAM_VALIDATION.description.getRequiredWhenPublishingError(),
            },
            {
                description: 'is too short',
                data: { ...validDataForPublish, description: 'Short' },
                expectedError: PROGRAM_VALIDATION.description.getMinError(),
            },
            {
                description: 'is too long',
                data: { ...validDataForPublish, description: 'A'.repeat(PROGRAM_VALIDATION.description.max + 1) },
                expectedError: PROGRAM_VALIDATION.description.getMaxError(),
            },
        ];

        it('should pass with a valid description', async () => {
            await expectValidationToPass(validDataForPublish, publishContext);
        });

        it.each(invalidPublishCases)('should fail when description $description', async ({ data, expectedError }) => {
            await expectValidationToFail(data, expectedError, publishContext);
        });
    });

    describe('Image validation', () => {
        const invalidImageCases = [
            {
                description: 'is required for publishing but is null',
                data: getValidData({ img: null }),
                context: { isPublishing: true },
                expectedError: PROGRAM_VALIDATION.img.getRequiredWhenPublishingError(),
            },
            {
                description: 'has invalid file format (GIF)',
                data: getValidData({ img: createMockFile('image/gifs') }),
                context: undefined,
                expectedError: PROGRAM_VALIDATION.img.getFormatError(),
            },
            {
                description: 'is too large',
                data: getValidData({ img: createMockFile('image/jpeg', PROGRAM_VALIDATION.img.maxSizeBytes + 1) }),
                context: undefined,
                expectedError: PROGRAM_VALIDATION.img.getSizeError(),
            },
        ];

        const validImageCases: [string, any, ProgramValidationContext | undefined][] = [
            ['is null in draft mode', getValidData({ img: null }), { isPublishing: false }],
            ['is a string path in publish mode', getValidData({ img: 'path/to/img.jpg' }), { isPublishing: true }],
            ['is a valid File in publish mode', getValidData({ img: createMockFile() }), { isPublishing: true }],
        ];

        it.each(invalidImageCases)('should fail when image $description', async ({ data, expectedError, context }) => {
            await expectValidationToFail(data, expectedError, context);
        });

        it.each(validImageCases)('should pass when image %s', async (description, data, context) => {
            await expectValidationToPass(data, context);
        });
    });

    describe('Image transform function', () => {
        const transformCases = [
            { description: 'an empty string', value: '' },
            { description: 'undefined', value: undefined },
        ];

        it.each(transformCases)('should transform $description to null', async ({ value }) => {
            const data = getValidData({ img: value });
            const result = await programValidationSchema.validate(data);
            expect(result.img).toBeNull();
        });
    });
});
