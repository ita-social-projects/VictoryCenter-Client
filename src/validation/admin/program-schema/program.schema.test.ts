import { programValidationSchema, ProgramValidationContext } from './program-scheme';
import { PROGRAM_VALIDATION } from '../../../const/admin/programs';

const createMockFile = (type = 'image/jpeg', size = 1024) => {
    const file = new File(['test'], 'test.jpg', { type });
    Object.defineProperty(file, 'size', {
        value: size,
        writable: false,
    });
    return file;
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
        it('should pass with a valid name', async () => {
            await expectValidationToPass(getValidData());
        });

        const invalidCases = [
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

        invalidCases.forEach(({ description, data, expectedError }) => {
            it(`should fail when name ${description}`, async () => {
                await expectValidationToFail(data, expectedError);
            });
        });
    });

    describe('Categories validation', () => {
        it('should pass with valid categories', async () => {
            await expectValidationToPass(getValidData());
        });

        const invalidCases = [
            {
                description: 'is an empty array',
                data: getValidData({ categories: [] }),
            },
            {
                description: 'is null',
                data: getValidData({ categories: null }),
            },
        ];

        invalidCases.forEach(({ description, data }) => {
            it(`should fail when categories ${description}`, async () => {
                await expectValidationToFail(data, PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError());
            });
        });
    });

    describe('Description validation', () => {
        describe('Draft mode (isPublishing: false)', () => {
            it('should pass with empty description', async () => {
                await expectValidationToPass(getValidData({ description: '' }));
            });

            it('should fail when description exceeds max length', async () => {
                const data = getValidData({ description: 'A'.repeat(PROGRAM_VALIDATION.description.max + 1) });
                await expectValidationToFail(data, PROGRAM_VALIDATION.description.getMaxError());
            });
        });

        describe('Publish mode (isPublishing: true)', () => {
            const publishContext = { isPublishing: true };
            const validDataForPublish = getValidData({ img: createMockFile() });

            it('should pass with a valid description', async () => {
                await expectValidationToPass(validDataForPublish, publishContext);
            });

            const invalidCases = [
                {
                    description: 'is empty',
                    data: { ...validDataForPublish, description: '' },
                    expectedError: PROGRAM_VALIDATION.description.getRequiredError(),
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

            invalidCases.forEach(({ description, data, expectedError }) => {
                it(`should fail when description ${description}`, async () => {
                    await expectValidationToFail(data, expectedError, publishContext);
                });
            });
        });
    });

    describe('Image validation', () => {
        describe('General validation', () => {
            const invalidCases = [
                {
                    description: 'is required for publishing but is null',
                    data: getValidData({ img: null }),
                    context: { isPublishing: true },
                    expectedError: PROGRAM_VALIDATION.img.getRequiredWhenPublishingError(),
                },
                {
                    description: 'has invalid file format (GIF)',
                    data: getValidData({ img: createMockFile('image/gif') }),
                    expectedError: PROGRAM_VALIDATION.img.getFormatError(),
                },
                {
                    description: 'is too large',
                    data: getValidData({ img: createMockFile('image/jpeg', PROGRAM_VALIDATION.img.maxSizeBytes + 1) }),
                    expectedError: PROGRAM_VALIDATION.img.getSizeError(),
                },
            ];

            invalidCases.forEach(({ description, data, expectedError, context }) => {
                it(`should fail when image ${description}`, async () => {
                    await expectValidationToFail(data, expectedError, context);
                });
            });
        });

        describe('Valid cases', () => {
            it.each([
                ['is null in draft mode', getValidData({ img: null }), { isPublishing: false }],
                ['is a string path in publish mode', getValidData({ img: 'path/to/img.jpg' }), { isPublishing: true }],
                ['is a valid File in publish mode', getValidData({ img: createMockFile() }), { isPublishing: true }],
            ])('should pass when image %s', async (description, data, context) => {
                // @ts-ignore
                await expectValidationToPass(data, context);
            });
        });

        describe('Transform function', () => {
            it.each([
                ['an empty string', ''],
                ['undefined', undefined],
                ['an empty FileList', { length: 0 } as unknown as FileList],
            ])('should transform %s to null', async (description, value) => {
                const data = getValidData({ img: value });
                const result = await programValidationSchema.validate(data);
                expect(result.img).toBeNull();
            });
        });
    });
});
