import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';

type Range = { min: number; max: number };

const R = (min: number, max: number): Range => ({ min, max });

const T_ONLY_TITLE = 91001 as any;
const T_GROUP_ONLY = 91002 as any;
const T_GROUP_STRICT = 91003 as any;
const T_GROUPCOUNT_ZERO = 91004 as any;
const T_GROUP_ZERO_FAIL = 91005 as any;
const T_GROUP_ZERO_PASS = 91006 as any;
const T_IMG_REQ_UNDEF = 91007 as any;
const T_LEN_IMAGE = 91008 as any;
const T_IMG_SORT = 91009 as any;

const loadSchema = (over?: { programValidation?: any; templateValidation?: any }) => {
    jest.resetModules();

    jest.doMock('@/const/admin/common', () => ({
        COMMON_TEXT_ADMIN: {
            VALIDATION_MESSAGE: {
                FIELD_REQUIRED: 'required',
                getMaxError: (n: number) => `max ${n}`,
                getMinError: (n: number) => `min ${n}`,
            },
        },
    }));

    jest.doMock('@/const/admin/programs', () => {
        const pv = {
            name: { min: 1, max: 10, getRequiredError: () => 'name required' },
            categories: { getAtLeastOneRequiredError: () => 'categories required' },
            description: { min: 1, max: 50, getRequiredWhenPublishingError: () => 'desc required' },
            previewImage: { getRequiredWhenPublishingError: () => 'preview required' },
            backgroundImage: { getRequiredWhenPublishingError: () => 'bg required' },
            location: { min: 2, max: 20, getRequiredWhenPublishingError: () => 'loc required' },
            participantsCount: { max: 20, getRequiredWhenPublishingError: () => 'pc required' },
            meetingCount: { max: 20, getRequiredWhenPublishingError: () => 'mc required' },
            ...(over?.programValidation ?? {}),
        };

        return {
            PROGRAM_VALIDATION: pv,
        };
    });

    jest.doMock('@/const/admin/sections', () => {
        const pv = {
            images: { maxSizeMB: 1 },
            ...(over?.programValidation ?? {}),
        };

        const tv: any = {
            [SectionTemplate.TextOnly]: {
                counts: {
                    [ContentType.Title]: R(1, 1),
                    [ContentType.Description]: R(1, 1),
                    [ContentType.Image]: R(0, 0),
                    [ContentType.Author]: R(0, 0),
                },
                lengths: {
                    [ContentType.Title]: R(2, 3),
                    [ContentType.Description]: R(2, 4),
                },
            },

            [SectionTemplate.SingleImageBottom]: {
                counts: {
                    [ContentType.Title]: R(1, 1),
                    [ContentType.Description]: R(1, 1),
                    [ContentType.Image]: R(1, 1),
                    [ContentType.Author]: R(0, 0),
                },
                lengths: {
                    [ContentType.Title]: R(1, 10),
                    [ContentType.Description]: R(1, 10),
                },
            },

            [SectionTemplate.DualTitleDescriptionPairs]: {
                counts: {
                    [ContentType.Title]: R(2, 2),
                    [ContentType.Description]: R(2, 2),
                    [ContentType.Image]: R(0, 0),
                    [ContentType.Author]: R(0, 0),
                },
                lengths: {
                    [ContentType.Title]: R(1, 10),
                    [ContentType.Description]: R(1, 10),
                },
                grouping: {
                    groupCount: R(2, 2),
                    perGroupCounts: {
                        [ContentType.Title]: R(1, 1),
                        [ContentType.Description]: R(1, 1),
                    },
                },
            },

            [SectionTemplate.SingleTitleDescriptionAuthorPairs]: {
                counts: {
                    [ContentType.Title]: R(1, 1),
                    [ContentType.Description]: R(1, 5),
                    [ContentType.Author]: R(1, 5),
                    [ContentType.Image]: R(0, 0),
                },
                lengths: {
                    [ContentType.Title]: R(1, 10),
                    [ContentType.Description]: R(1, 10),
                    [ContentType.Author]: R(1, 10),
                },
                grouping: {
                    groupCount: R(1, 5),
                    perGroupCounts: {
                        [ContentType.Description]: R(1, 1),
                        [ContentType.Author]: R(1, 1),
                    },
                },
            },

            [T_ONLY_TITLE]: {
                counts: {
                    [ContentType.Title]: R(1, 1),
                    x: R(0, 0),
                },
                lengths: {
                    [ContentType.Title]: R(1, 10),
                },
            },

            [T_GROUP_ONLY]: {
                grouping: {
                    groupCount: R(1, 1),
                    perGroupCounts: {
                        [ContentType.Description]: R(1, 1),
                    },
                },
            },

            [T_GROUP_STRICT]: {
                grouping: {
                    groupCount: R(1, 1),
                    perGroupCounts: {
                        [ContentType.Description]: R(1, 1),
                    },
                },
            },

            [T_GROUPCOUNT_ZERO]: {
                grouping: {
                    groupCount: R(0, 0),
                    perGroupCounts: {
                        [ContentType.Description]: R(1, 1),
                    },
                },
            },

            [T_GROUP_ZERO_FAIL]: {
                grouping: {
                    groupCount: R(1, 1),
                    perGroupCounts: {
                        [ContentType.Title]: R(0, 0),
                    },
                },
            },

            [T_GROUP_ZERO_PASS]: {
                grouping: {
                    groupCount: R(1, 1),
                    perGroupCounts: {
                        [ContentType.Description]: R(1, 1),
                        [ContentType.Author]: R(0, 0),
                    },
                },
            },

            [T_IMG_REQ_UNDEF]: {
                counts: {
                    [ContentType.Title]: R(1, 1),
                },
                lengths: {
                    [ContentType.Title]: R(1, 10),
                },
                grouping: {
                    groupCount: R(1, 1),
                    perGroupCounts: {
                        [ContentType.Image]: R(1, 1),
                    },
                },
            },

            [T_LEN_IMAGE]: {
                counts: {
                    [ContentType.Image]: R(1, 1),
                },
                lengths: {
                    [ContentType.Image]: R(1, 1),
                },
            },

            [T_IMG_SORT]: {
                counts: {
                    [ContentType.Title]: R(1, 1),
                    [ContentType.Image]: R(1, 2),
                },
                lengths: {
                    [ContentType.Title]: R(1, 10),
                },
            },

            ...(over?.templateValidation ?? {}),
        };

        return {
            SECTION_VALIDATION: pv,
            SECTION_TEMPLATE_VALIDATION: tv,
        };
    });

    let m: any;
    jest.isolateModules(() => {
        m = require('./program-schema');
    });
    return m;
};

const sec = (template: any, contents: any[]) => ({ template, order: 0, contents });

const t = (value: string, order: any = 0, extra?: any) => ({
    contentType: ContentType.Title,
    ...(order !== undefined ? { order } : {}),
    title: value,
    ...(extra ?? {}),
});

const d = (value: string, order: any = 1, extra?: any) => ({
    contentType: ContentType.Description,
    ...(order !== undefined ? { order } : {}),
    description: value,
    ...(extra ?? {}),
});

const a = (value: string, order: any = 2, extra?: any) => ({
    contentType: ContentType.Author,
    ...(order !== undefined ? { order } : {}),
    author: value,
    ...(extra ?? {}),
});

const im = (order: any = 2, extra?: any) => ({
    contentType: ContentType.Image,
    ...(order !== undefined ? { order } : {}),
    ...(extra ?? {}),
});

const validTextOnly = () => sec(SectionTemplate.TextOnly, [t('aa', 0), d('bbbb', 1)]);

const validSingleImage = (imgExtra?: any) =>
    sec(SectionTemplate.SingleImageBottom, [t('a', 0), d('b', 1), im(2, imgExtra)]);

describe('program-schema.ts coverage (templates are bottom-only)', () => {
    it('validateProgramSections returns undefined for undefined', () => {
        const m = loadSchema();
        expect(m.validateProgramSections(undefined as any, true)).toBeUndefined();
    });

    it('validateProgramSections returns undefined for empty array', () => {
        const m = loadSchema();
        expect(m.validateProgramSections([], true)).toBeUndefined();
    });

    it('unknown template is valid in draft', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(777777, []), false)).toBe(true);
    });

    it('unknown template is invalid in publish', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(777777, []), true)).toBe(false);
    });

    it('basic values: non-number contentType fails', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [{ contentType: 'x', order: 0 }]), false)).toBe(
            false,
        );
    });

    it('basic values: unknown numeric contentType fails', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [{ contentType: 999, order: 0 }]), false)).toBe(
            false,
        );
    });

    it('basic values: negative order fails', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aa', -1), d('bbbb', 1)]), false)).toBe(false);
    });

    it('basic values: groupIndex wrong type fails', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aa', 0, { groupIndex: '0' })]), false)).toBe(
            false,
        );
    });

    it('basic values: negative groupIndex fails', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aa', 0, { groupIndex: -1 })]), false)).toBe(
            false,
        );
    });

    it('orders: duplicate numeric orders fail', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aa', 0), d('bbbb', 0)]), false)).toBe(false);
    });

    it('orders: non-number orders are ignored', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aa', undefined), d('bbbb', undefined)]), true),
        ).toBe(true);
    });

    it('image ids: duplicates via imageId and image.id fail', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(SectionTemplate.SingleImageBottom, [
                    t('a', 0),
                    d('b', 1),
                    im(2, { imageId: 1 }),
                    im(3, { image: { id: 1 } }),
                ]),
                false,
            ),
        ).toBe(false);
    });

    it('image ids: duplicates via image.imageId fail', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(SectionTemplate.SingleImageBottom, [
                    t('a', 0),
                    d('b', 1),
                    im(2, { image: { imageId: 2 } }),
                    im(3, { imageId: 2 }),
                ]),
                false,
            ),
        ).toBe(false);
    });

    it('allowed types: valid type but not allowed by rules fails', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(T_ONLY_TITLE, [t('a', 0), d('b', 1)]), false)).toBe(false);
    });

    it('counts: draft fails when actual > max', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(SectionTemplate.SingleImageBottom, [
                    t('a', 0),
                    d('b', 1),
                    im(2, { imageId: 1 }),
                    im(3, { imageId: 2 }),
                ]),
                false,
            ),
        ).toBe(false);
    });

    it('counts: draft passes when actual < min but <= max', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.SingleImageBottom, [t('a', 0), d('b', 1)]), false)).toBe(
            true,
        );
    });

    it('counts: publish fails when not in range', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.SingleImageBottom, [t('a', 0), d('b', 1)]), true)).toBe(
            false,
        );
    });

    it('counts: 0..0 branch fails when author exists', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aa', 0), d('bbbb', 1), a('x', 2)]), true),
        ).toBe(false);
    });

    it('lengths: publish fails when text is empty after trim', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('   ', 0), d('bbbb', 1)]), true)).toBe(false);
    });

    it('lengths: draft allows empty after trim', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('   ', 0), d('bbbb', 1)]), false)).toBe(true);
    });

    it('lengths: fails when above max', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aaaa', 0), d('bbbb', 1)]), false)).toBe(false);
    });

    it('lengths: publish fails when below min', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(SectionTemplate.TextOnly, [t('aa', 0), d('x', 1)]), true)).toBe(false);
    });

    it('grouping: no grouped items is invalid in publish', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(T_GROUP_ONLY, []), true)).toBe(false);
    });

    it('grouping: no grouped items is valid in draft', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(T_GROUP_ONLY, []), false)).toBe(true);
    });

    it('grouping: missing groupIndex fails', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(SectionTemplate.SingleTitleDescriptionAuthorPairs, [
                    t('a', 0),
                    d('b', 1, { groupIndex: null }),
                    a('c', 2, { groupIndex: 0 }),
                ]),
                false,
            ),
        ).toBe(false);
    });

    it('grouping: publish fails when groupCount out of range', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(T_GROUP_STRICT, [d('b', 0, { groupIndex: 0 }), d('c', 1, { groupIndex: 1 })]),
                true,
            ),
        ).toBe(false);
    });

    it('grouping: draft fails when groupCount exceeds max', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(T_GROUP_STRICT, [d('b', 0, { groupIndex: 0 }), d('c', 1, { groupIndex: 1 })]),
                false,
            ),
        ).toBe(false);
    });

    it('grouping: inRange 0..0 is exercised through groupCount', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(T_GROUPCOUNT_ZERO, [d('b', 0, { groupIndex: 0 })]), true)).toBe(false);
    });

    it('grouping: perGroupCounts 0..0 fails when actual is not 0', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(T_GROUP_ZERO_FAIL, [t('a', 0, { groupIndex: 0 })]), true)).toBe(false);
    });

    it('grouping: perGroupCounts 0..0 passes when actual is 0', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(T_GROUP_ZERO_PASS, [d('b', 0, { groupIndex: 0 })]), true)).toBe(true);
    });

    it('images: min=0 max=0 branch is executed when there are zero images', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(validTextOnly(), true)).toBe(true);
    });

    it('images: publish fails when required image value is missing', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(validSingleImage({ image: null }), true)).toBe(false);
    });

    it('images: publish passes when required image value exists via imageId', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(validSingleImage({ image: null, imageId: 1 }), true)).toBe(true);
    });

    it('images: required-image sorting treats missing order as 0', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(T_IMG_SORT, [t('a', 0), im(undefined, { image: null }), im(5, { imageId: 1 })]),
                true,
            ),
        ).toBe(false);
    });

    it('images: imageReq undefined path is executed (allowed via grouping perGroupCounts)', () => {
        const m = loadSchema({ programValidation: { images: { maxSizeMB: 0 } } });
        expect(
            m.isProgramSectionValid(sec(T_IMG_REQ_UNDEF, [t('a', 0), im(1, { groupIndex: 0, imageId: 1 })]), true),
        ).toBe(true);
    });

    it('lengths: getTextValue default branch is exercised in publish', () => {
        const m = loadSchema({ programValidation: { images: { maxSizeMB: 0 } } });
        expect(m.isProgramSectionValid(sec(T_LEN_IMAGE, [im(0, { imageId: 1 })]), true)).toBe(false);
    });

    it('lengths: getTextValue default branch is exercised in draft', () => {
        const m = loadSchema({ programValidation: { images: { maxSizeMB: 0 } } });
        expect(m.isProgramSectionValid(sec(T_LEN_IMAGE, [im(0, { imageId: 1 })]), false)).toBe(true);
    });

    it('max-size: fails for image.file.size', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(validSingleImage({ image: { file: { size: 2 * 1024 * 1024 } } }), true)).toBe(
            false,
        );
    });

    it('max-size: fails for image.originFileObj.size', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(validSingleImage({ image: { originFileObj: { size: 2 * 1024 * 1024 } } }), true),
        ).toBe(false);
    });

    it('max-size: fails for image.originalFile.size', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(validSingleImage({ image: { originalFile: { size: 2 * 1024 * 1024 } } }), true),
        ).toBe(false);
    });

    it('max-size: fails for image.size', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(validSingleImage({ image: { size: 2 * 1024 * 1024 } }), true)).toBe(false);
    });

    it('max-size: fails for file.size', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(validSingleImage({ file: { size: 2 * 1024 * 1024 }, image: { id: 1 } }), true),
        ).toBe(false);
    });

    it('max-size: fails for originFileObj.size', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                validSingleImage({ originFileObj: { size: 2 * 1024 * 1024 }, image: { id: 1 } }),
                true,
            ),
        ).toBe(false);
    });

    it('max-size: is skipped when maxSizeMB <= 0', () => {
        const m = loadSchema({ programValidation: { images: { maxSizeMB: 0 } } });
        expect(
            m.isProgramSectionValid(validSingleImage({ image: { file: { size: 2 * 1024 * 1024 } }, imageId: 1 }), true),
        ).toBe(true);
    });

    it('validateProgramSections returns invalid when any section is invalid', () => {
        const m = loadSchema();
        expect(m.validateProgramSections([validTextOnly(), sec(SectionTemplate.TextOnly, [t('aa', 0)])], true)).toBe(
            'invalid',
        );
    });

    it('validateProgramSections returns undefined when all sections are valid', () => {
        const m = loadSchema();
        expect(m.validateProgramSections([validTextOnly(), validSingleImage({ imageId: 1 })], true)).toBeUndefined();
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: validateContentText passes when template is missing', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText('aaaaaa', ContentType.Title, true),
        ).toBeUndefined();
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: validateContentText passes when rule is missing', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                'x',
                ContentType.Image as any,
                true,
                SectionTemplate.TextOnly,
            ),
        ).toBeUndefined();
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: returns max error', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                'aaaa',
                ContentType.Title,
                false,
                SectionTemplate.TextOnly,
            ),
        ).toBe('max 3');
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: returns min error in publish', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                'a',
                ContentType.Title,
                true,
                SectionTemplate.TextOnly,
            ),
        ).toBe('min 2');
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: enforces min in draft', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                'a',
                ContentType.Title,
                false,
                SectionTemplate.TextOnly,
            ),
        ).toBe('min 2');
    });
});

describe('program-schema.ts required-message fallbacks', () => {
    it('content required uses FIELD_REQUIRED by default', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                '',
                ContentType.Author,
                true,
                SectionTemplate.TextOnly,
            ),
        ).toBe('required');
    });
});

describe('PROGRAM_VALIDATION_FUNCTIONS', () => {
    describe('validateName', () => {
        it('returns undefined for valid name in draft mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateName('Test', false)).toBeUndefined();
        });

        it('returns undefined for valid name in publish mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateName('Test', true)).toBeUndefined();
        });

        it('returns error for empty name', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateName('', false)).toBe('name required');
        });

        it('returns error for empty name in publish mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateName('', true)).toBe('name required');
        });

        it('returns error when name exceeds max length', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateName('12345678901', false)).toBe('max 10');
        });
    });

    describe('validateCategories', () => {
        it('returns undefined for valid categories', () => {
            const m = loadSchema();
            const categories = [{ id: 1, name: 'Cat1', programsCount: 5 }];
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateCategories(categories, false)).toBeUndefined();
        });

        it('returns error for empty categories array', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateCategories([], true)).toBe('categories required');
        });
    });

    describe('validateDescription', () => {
        it('returns undefined for valid description in draft mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription('Test description', false)).toBeUndefined();
        });

        it('returns undefined for empty description in draft mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription('', false)).toBeUndefined();
        });

        it('returns undefined for valid description in publish mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription('Test description', true)).toBeUndefined();
        });

        it('returns error for empty description when publishing', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription('', true)).toBe('desc required');
        });

        it('returns error when description exceeds max length', () => {
            const m = loadSchema();
            const longDesc = 'a'.repeat(51);
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription(longDesc, false)).toBe('max 50');
        });

        it('returns error when description is less than min length in draft mode', () => {
            const m = loadSchema({
                programValidation: {
                    description: { min: 3, max: 50, getRequiredWhenPublishingError: () => 'desc required' },
                },
            });
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription('ab', false)).toBe('min 3');
        });

        it('returns error when description is less than min length when publishing', () => {
            const m = loadSchema({
                programValidation: {
                    description: { min: 3, max: 50, getRequiredWhenPublishingError: () => 'desc required' },
                },
            });
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription('ab', true)).toBe('min 3');
        });

        it('returns undefined for empty description in draft mode (even with min requirement)', () => {
            const m = loadSchema({
                programValidation: {
                    description: { min: 3, max: 50, getRequiredWhenPublishingError: () => 'desc required' },
                },
            });
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateDescription('', false)).toBeUndefined();
        });
    });

    describe('validatePreviewImage', () => {
        it('returns undefined for valid image in draft mode', () => {
            const m = loadSchema();
            const image = { id: 1, path: '/test.jpg', alt: 'Test' };
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(image, false)).toBeUndefined();
        });

        it('returns undefined for null image in draft mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(null, false)).toBeUndefined();
        });

        it('returns undefined for valid image in publish mode', () => {
            const m = loadSchema();
            const image = { id: 1, path: '/test.jpg', alt: 'Test' };
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(image, true)).toBeUndefined();
        });

        it('returns error for null image when publishing', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage(null, true)).toBe('preview required');
        });
    });

    describe('validateBackgroundImage', () => {
        it('returns undefined for valid image in draft mode', () => {
            const m = loadSchema();
            const image = { id: 2, path: '/bg.jpg', alt: 'Background' };
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(image, false)).toBeUndefined();
        });

        it('returns undefined for null image in draft mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(null, false)).toBeUndefined();
        });

        it('returns undefined for valid image in publish mode', () => {
            const m = loadSchema();
            const image = { id: 2, path: '/bg.jpg', alt: 'Background' };
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(image, true)).toBeUndefined();
        });

        it('returns error for null image when publishing', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage(null, true)).toBe('bg required');
        });
    });

    describe('validateLocation', () => {
        it('returns undefined for valid location', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateLocation('Kyiv, Ukraine', false)).toBeUndefined();
        });

        it('allows empty location in draft mode', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateLocation('', false)).toBeUndefined();
        });

        it('returns min 2 for short non-empty location', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateLocation('A', false)).toBe('min 2');
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateLocation('A', true)).toBe('min 2');
        });

        it('returns error when location exceeds max length', () => {
            const m = loadSchema();
            const longLocation = 'a'.repeat(21);
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateLocation(longLocation, false)).toBe('max 20');
        });
    });

    describe('validateParticipantsCount', () => {
        it('returns undefined for valid participants count', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount('10-20', false)).toBeUndefined();
        });

        it('returns undefined for empty participants count (optional field)', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount('', false)).toBeUndefined();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount('', true)).toBeUndefined();
        });

        it('returns error when participants count exceeds max length', () => {
            const m = loadSchema();
            const longCount = 'a'.repeat(21);
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount(longCount, false)).toBe('max 20');
        });
    });

    describe('validateMeetingCount', () => {
        it('returns undefined for valid meeting count', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount('5-10', false)).toBeUndefined();
        });

        it('returns undefined for empty meeting count (optional field)', () => {
            const m = loadSchema();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount('', false)).toBeUndefined();
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount('', true)).toBeUndefined();
        });

        it('returns error when meeting count exceeds max length', () => {
            const m = loadSchema();
            const longCount = 'a'.repeat(21);
            expect(m.PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount(longCount, false)).toBe('max 20');
        });
    });
});
