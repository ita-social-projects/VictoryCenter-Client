import { ContentType } from '@/types/common/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';

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

const loadSchema = (over?: { programValidation?: any; sectionValidation?: any; templateValidation?: any }) => {
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
            location: { max: 20, getRequiredWhenPublishingError: () => 'loc required' },
            participantsCount: { max: 20, getRequiredWhenPublishingError: () => 'pc required' },
            meetingCount: { max: 20, getRequiredWhenPublishingError: () => 'mc required' },
            images: { maxSizeMB: 1 },
            ...(over?.programValidation ?? {}),
        };

        const sv = {
            title: { getRequiredError: () => 'title required' },
            description: { getRequiredError: () => 'description required' },
            author: { getRequiredError: () => 'author required' },
            cardAuthor: { getRequiredError: () => 'card author required' },
            ...(over?.sectionValidation ?? {}),
        };

        const tv: any = {
            [ProgramSectionTemplate.TextOnly]: {
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

            [ProgramSectionTemplate.SingleImageBottom]: {
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

            [ProgramSectionTemplate.DualTitleDescriptionPairs]: {
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

            [ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs]: {
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
            PROGRAM_VALIDATION: pv,
            PROGRAM_SECTION_VALIDATION: sv,
            PROGRAM_SECTION_TEMPLATE_VALIDATION: tv,
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

const validTextOnly = () => sec(ProgramSectionTemplate.TextOnly, [t('aa', 0), d('bbbb', 1)]);

const validSingleImage = (imgExtra?: any) =>
    sec(ProgramSectionTemplate.SingleImageBottom, [t('a', 0), d('b', 1), im(2, imgExtra)]);

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
        expect(
            m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [{ contentType: 'x', order: 0 }]), false),
        ).toBe(false);
    });

    it('basic values: unknown numeric contentType fails', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [{ contentType: 999, order: 0 }]), false),
        ).toBe(false);
    });

    it('basic values: negative order fails', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('aa', -1), d('bbbb', 1)]), false)).toBe(
            false,
        );
    });

    it('basic values: groupIndex wrong type fails', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('aa', 0, { groupIndex: '0' })]), false),
        ).toBe(false);
    });

    it('basic values: negative groupIndex fails', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('aa', 0, { groupIndex: -1 })]), false),
        ).toBe(false);
    });

    it('orders: duplicate numeric orders fail', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('aa', 0), d('bbbb', 0)]), false)).toBe(
            false,
        );
    });

    it('orders: non-number orders are ignored', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(ProgramSectionTemplate.TextOnly, [t('aa', undefined), d('bbbb', undefined)]),
                true,
            ),
        ).toBe(true);
    });

    it('image ids: duplicates via imageId and image.id fail', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(
                sec(ProgramSectionTemplate.SingleImageBottom, [
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
                sec(ProgramSectionTemplate.SingleImageBottom, [
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
                sec(ProgramSectionTemplate.SingleImageBottom, [
                    t('a', 0),
                    d('b', 1),
                    im(2, { imageId: 1 }),
                    im(3, { imageId: 2 }),
                ]),
                false,
            ),
        ).toBe(false);
    });

    it('counts: publish fails when not in range', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(sec(ProgramSectionTemplate.SingleImageBottom, [t('a', 0), d('b', 1)]), true),
        ).toBe(false);
    });

    it('counts: 0..0 branch fails when author exists', () => {
        const m = loadSchema();
        expect(
            m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('aa', 0), d('bbbb', 1), a('x', 2)]), true),
        ).toBe(false);
    });

    it('lengths: publish fails when text is empty after trim', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('   ', 0), d('bbbb', 1)]), true)).toBe(
            false,
        );
    });

    it('lengths: draft allows empty after trim', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('   ', 0), d('bbbb', 1)]), false)).toBe(
            true,
        );
    });

    it('lengths: fails when above max', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('aaaa', 0), d('bbbb', 1)]), false)).toBe(
            false,
        );
    });

    it('lengths: publish fails when below min', () => {
        const m = loadSchema();
        expect(m.isProgramSectionValid(sec(ProgramSectionTemplate.TextOnly, [t('aa', 0), d('x', 1)]), true)).toBe(
            false,
        );
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
                sec(ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs, [
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
        expect(
            m.validateProgramSections([validTextOnly(), sec(ProgramSectionTemplate.TextOnly, [t('aa', 0)])], true),
        ).toBe('invalid');
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
                ProgramSectionTemplate.TextOnly,
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
                ProgramSectionTemplate.TextOnly,
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
                ProgramSectionTemplate.TextOnly,
            ),
        ).toBe('min 2');
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: does not enforce min in draft', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                'a',
                ContentType.Title,
                false,
                ProgramSectionTemplate.TextOnly,
            ),
        ).toBeUndefined();
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: validateSectionTitle returns required', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionTitle('', true, ProgramSectionTemplate.TextOnly),
        ).toBe('title required');
    });

    it('PROGRAM_SECTION_VALIDATION_FUNCTIONS: validateSectionDescription returns max error', () => {
        const m = loadSchema();
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(
                'aaaaaaaaaaa',
                false,
                ProgramSectionTemplate.TextOnly,
            ),
        ).toBe('max 4');
    });

    it('programSectionValidationSchema is executed', async () => {
        const m = loadSchema();
        await expect(
            m.programSectionValidationSchema.validate(
                { sectionTitle: 'aa', sectionDescription: 'bbbb' },
                { context: { isPublishing: true, template: ProgramSectionTemplate.TextOnly } },
            ),
        ).resolves.toBeDefined();
    });
});

describe('program-schema.ts required-message fallbacks', () => {
    it('author required uses cardAuthor when author is missing', () => {
        const m = loadSchema({
            sectionValidation: { author: undefined, cardAuthor: { getRequiredError: () => 'card author required' } },
        });
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                '',
                ContentType.Author,
                true,
                ProgramSectionTemplate.TextOnly,
            ),
        ).toBe('card author required');
    });

    it('author required falls back to FIELD_REQUIRED when author and cardAuthor are missing', () => {
        const m = loadSchema({ sectionValidation: { author: undefined, cardAuthor: undefined } });
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                '',
                ContentType.Author,
                true,
                ProgramSectionTemplate.TextOnly,
            ),
        ).toBe('required');
    });

    it('unknown content type required falls back to FIELD_REQUIRED', () => {
        const m = loadSchema({
            sectionValidation: { title: undefined, description: undefined, author: undefined, cardAuthor: undefined },
        });
        expect(
            m.PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(
                '',
                999 as any,
                true,
                ProgramSectionTemplate.TextOnly,
            ),
        ).toBe('required');
    });
});
