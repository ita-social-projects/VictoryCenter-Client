import {
    PROGRAM_VALIDATION,
    PROGRAM_SECTION_VALIDATION,
    PROGRAM_SECTION_TEMPLATE_VALIDATION,
} from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramCategory } from '@/types/admin/programs';
import { Image, ImageValues } from '@/types/common/image';
import { ProgramSection } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import * as Yup from 'yup';

export interface ProgramValidationContext {
    isPublishing: boolean;
}

type Range = { min: number; max: number };

type TemplateRules = {
    counts?: Record<string | number, Range>;
    lengths?: Record<string | number, Range>;
    grouping?: {
        groupCount: Range;
        perGroupCounts: Record<string | number, Range>;
    };
};

type SectionTemplate = ProgramSection['template'];
type SectionContent = NonNullable<ProgramSection['contents']>[number];

const TEMPLATE_RULES = PROGRAM_SECTION_TEMPLATE_VALIDATION as unknown as Partial<
    Record<SectionTemplate, TemplateRules>
>;

const getTemplateRules = (template: SectionTemplate): TemplateRules | undefined => TEMPLATE_RULES[template];

const getRuleEntry = <T>(map: Record<string | number, T> | undefined, key: number): T | undefined =>
    map?.[key] ?? map?.[String(key)];

const keysAsNumbers = (map: Record<string | number, unknown> | undefined): number[] =>
    map
        ? Object.keys(map)
              .map(Number)
              .filter((n) => !Number.isNaN(n))
        : [];

const inRange = (actual: number, req: Range): boolean => {
    if (req.min === 0 && req.max === 0) return actual === 0;
    return actual >= req.min && actual <= req.max;
};

const countByType = (contents: SectionContent[], type: ContentType): number =>
    contents.filter((c) => c?.contentType === type).length;

const getTextValue = (content: SectionContent): string | undefined => {
    switch (content?.contentType) {
        case ContentType.Title:
            return (content as any).title;
        case ContentType.Description:
            return (content as any).description;
        case ContentType.Author:
            return (content as any).author;
        default:
            return undefined;
    }
};

const getRequiredMessage = (type: ContentType): string => {
    const v = PROGRAM_SECTION_VALIDATION as any;

    switch (type) {
        case ContentType.Title:
            return v?.title?.getRequiredError?.() ?? COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
        case ContentType.Description:
            return v?.description?.getRequiredError?.() ?? COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
        case ContentType.Author:
            return (
                v?.author?.getRequiredError?.() ??
                v?.cardAuthor?.getRequiredError?.() ??
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED
            );
        default:
            return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    }
};

const createTemplateTextSchema = (type: ContentType) =>
    Yup.string()
        .trim()
        .required(getRequiredMessage(type))
        .test('template-length', function (value) {
            const ctx = (this.options.context ?? {}) as ProgramValidationContext & { template?: SectionTemplate };
            const template = ctx.template;
            if (!template) return true;

            const rules = getTemplateRules(template);
            const req = getRuleEntry(rules?.lengths, type);

            if (!req) return true;

            const t = (value ?? '').trim();
            if (!t) return true;

            if (t.length > req.max) {
                return this.createError({ message: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(req.max) });
            }

            if (ctx.isPublishing && t.length < req.min) {
                return this.createError({ message: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(req.min) });
            }

            return true;
        });

export const programValidationSchema = Yup.object({
    name: Yup.string()
        .required(PROGRAM_VALIDATION.name.getRequiredError())
        .min(PROGRAM_VALIDATION.name.min, COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.name.min))
        .max(
            PROGRAM_VALIDATION.name.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.name.max),
        ),

    categories: Yup.array<ProgramCategory>()
        .of(
            Yup.object({
                id: Yup.number().required(),
                name: Yup.string().required(),
                programsCount: Yup.number().required(),
            }),
        )
        .required(PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError())
        .min(1, PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError()),

    description: Yup.string()
        .max(
            PROGRAM_VALIDATION.description.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.description.max),
        )
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema
                      .required(PROGRAM_VALIDATION.description.getRequiredWhenPublishingError())
                      .min(
                          PROGRAM_VALIDATION.description.min,
                          COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.description.min),
                      )
                : schema.notRequired(),
        ),

    previewImage: Yup.mixed<Image | ImageValues>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.previewImage.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            return value;
        }),

    backgroundImage: Yup.mixed<Image | ImageValues>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.backgroundImage.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            return value;
        }),

    location: Yup.string()
        .max(
            PROGRAM_VALIDATION.location.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.location.max),
        )
        .notRequired(),

    participantsCount: Yup.string()
        .max(
            PROGRAM_VALIDATION.participantsCount.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.participantsCount.max),
        )
        .notRequired(),

    meetingsCount: Yup.string()
        .max(
            PROGRAM_VALIDATION.meetingCount.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.meetingCount.max),
        )
        .notRequired(),
});

export const PROGRAM_VALIDATION_FUNCTIONS = {
    validateName: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('name', { name: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateCategories: (value: ProgramCategory[], isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('categories', { categories: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('description', { description: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePreviewImage: (value: Image | ImageValues | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('previewImage', { previewImage: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateBackgroundImage: (value: Image | ImageValues | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('backgroundImage', { backgroundImage: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateLocation: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('location', { location: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateParticipantsCount: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('participantsCount', { participantsCount: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateMeetingCount: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('meetingsCount', { meetingsCount: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateSections: (sections: ProgramSection[], isPublishing: boolean): string | undefined => {
        const result = validateProgramSections(sections, isPublishing);
        return result;
    },
};

export const programSectionValidationSchema = Yup.object({
    sectionTitle: createTemplateTextSchema(ContentType.Title),
    sectionDescription: createTemplateTextSchema(ContentType.Description),
});

export const PROGRAM_SECTION_VALIDATION_FUNCTIONS = {
    validateSectionTitle: (value: string, isPublishing: boolean, template?: SectionTemplate): string | undefined => {
        const context: ProgramValidationContext & { template?: SectionTemplate } = { isPublishing, template };
        try {
            programSectionValidationSchema.validateSyncAt('sectionTitle', { sectionTitle: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateSectionDescription: (
        value: string,
        isPublishing: boolean,
        template?: SectionTemplate,
    ): string | undefined => {
        const context: ProgramValidationContext & { template?: SectionTemplate } = { isPublishing, template };
        try {
            programSectionValidationSchema.validateSyncAt(
                'sectionDescription',
                { sectionDescription: value },
                { context },
            );
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateContentText: (
        value: string,
        type: ContentType,
        isPublishing: boolean,
        template?: SectionTemplate,
    ): string | undefined => {
        const context: ProgramValidationContext & { template?: SectionTemplate } = { isPublishing, template };
        try {
            createTemplateTextSchema(type).validateSync(value, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

const isValidContentType = (value: unknown): value is ContentType =>
    typeof value === 'number' && (ContentType as any)[value] !== undefined;

const hasUniqueOrders = (contents: SectionContent[]): boolean => {
    const orders = contents.map((c: any) => c?.order).filter((o) => typeof o === 'number') as number[];
    return new Set(orders).size === orders.length;
};

const getImageId = (c: any): number | undefined => {
    const v = c?.imageId ?? c?.image?.id ?? c?.image?.imageId;
    return typeof v === 'number' && v > 0 ? v : undefined;
};

const hasUniqueImageIds = (contents: SectionContent[]): boolean => {
    const ids = contents
        .filter((c: any) => c?.contentType === ContentType.Image)
        .map(getImageId)
        .filter((x): x is number => typeof x === 'number');
    return new Set(ids).size === ids.length;
};

const validateBasicValues = (contents: SectionContent[]): boolean => {
    for (const c of contents as any[]) {
        if (!isValidContentType(c?.contentType)) return false;
        if (typeof c?.order === 'number' && c.order < 0) return false;

        if (c?.groupIndex !== undefined && c?.groupIndex !== null) {
            if (typeof c.groupIndex !== 'number' || c.groupIndex < 0) return false;
        }
    }
    return true;
};

const validateAllowedContentTypes = (contents: SectionContent[], rules: TemplateRules): boolean => {
    const allowed = new Set<number>([
        ...keysAsNumbers(rules.counts),
        ...keysAsNumbers(rules.lengths),
        ...keysAsNumbers(rules.grouping?.perGroupCounts),
    ]);

    for (const c of contents as any[]) {
        const t = c?.contentType;
        if (typeof t !== 'number' || !allowed.has(t)) return false;
    }

    return true;
};

const validateTemplateCounts = (contents: SectionContent[], rules: TemplateRules, isPublishing: boolean): boolean => {
    const counts = rules.counts ?? {};

    for (const key of Object.keys(counts)) {
        const type = Number(key) as ContentType;
        const req = (counts as any)[key] as Range;
        const actual = countByType(contents, type);

        if (req.min === 0 && req.max === 0) {
            if (actual !== 0) return false;
            continue;
        }

        if (isPublishing) {
            if (!inRange(actual, req)) return false;
        } else {
            if (actual > req.max) return false;
        }
    }

    return true;
};

const validateTemplateLengths = (contents: SectionContent[], rules: TemplateRules, isPublishing: boolean): boolean => {
    const lengths = rules.lengths ?? {};

    for (const key of Object.keys(lengths)) {
        const type = Number(key) as ContentType;
        const req = (lengths as any)[key] as Range;

        const items = contents.filter((c) => c?.contentType === type);

        for (const item of items) {
            const t = getTextValue(item)?.trim();
            if (!t) return false;
            if (t.length > req.max) return false;
            if (isPublishing && t.length < req.min) return false;
        }
    }

    return true;
};

const validateTemplateGrouping = (contents: SectionContent[], rules: TemplateRules, isPublishing: boolean): boolean => {
    const grouping = rules.grouping;
    if (!grouping) return true;

    const groupedTypes = keysAsNumbers(grouping.perGroupCounts) as ContentType[];
    const grouped = contents.filter((c: any) => groupedTypes.includes(c?.contentType));

    if (grouped.length === 0) {
        return !isPublishing;
    }

    if (grouped.some((c: any) => c.groupIndex === null || c.groupIndex === undefined)) return false;

    const groupsMap = new Map<number, SectionContent[]>();
    for (const item of grouped as any[]) {
        const idx = item.groupIndex as number;
        const arr = groupsMap.get(idx) ?? [];
        arr.push(item);
        groupsMap.set(idx, arr);
    }

    const groups = Array.from(groupsMap.values());

    if (isPublishing) {
        if (!inRange(groups.length, grouping.groupCount)) return false;
    } else {
        if (groups.length > grouping.groupCount.max) return false;
    }

    for (const group of groups as any[]) {
        for (const key of Object.keys(grouping.perGroupCounts)) {
            const type = Number(key) as ContentType;
            const req = (grouping.perGroupCounts as any)[key] as Range;

            const actual = group.filter((x: any) => x?.contentType === type).length;

            if (req.min === 0 && req.max === 0) {
                if (actual !== 0) return false;
                continue;
            }

            if (isPublishing) {
                if (!inRange(actual, req)) return false;
            } else {
                if (actual > req.max) return false;
            }
        }
    }

    return true;
};

const getFileSizeBytes = (c: any): number | undefined => {
    const v =
        c?.image?.file?.size ??
        c?.image?.originFileObj?.size ??
        c?.image?.originalFile?.size ??
        c?.image?.size ??
        c?.file?.size ??
        c?.originFileObj?.size;
    return typeof v === 'number' && v > 0 ? v : undefined;
};

const hasRequiredImageValue = (c: any): boolean => Boolean(c?.image) || typeof getImageId(c) === 'number';

const validateTemplateImages = (contents: SectionContent[], rules: TemplateRules, isPublishing: boolean): boolean => {
    const imageReq = getRuleEntry(rules.counts, ContentType.Image);
    const images = contents.filter((c) => c?.contentType === ContentType.Image) as any[];

    if (imageReq) {
        if (imageReq.min === 0 && imageReq.max === 0) {
            if (images.length !== 0) return false;
        } else {
            if (isPublishing) {
                if (!inRange(images.length, imageReq)) return false;
            } else {
                if (images.length > imageReq.max) return false;
            }

            if (isPublishing && imageReq.min > 0) {
                const ordered = images.slice().sort((a, b) => {
                    const ao = typeof a?.order === 'number' ? a.order : 0;
                    const bo = typeof b?.order === 'number' ? b.order : 0;
                    return ao - bo;
                });

                if (ordered.length < imageReq.min) return false;
                if (ordered.slice(0, imageReq.min).some((c) => !hasRequiredImageValue(c))) return false;
            }
        }
    }

    const maxSizeMB = PROGRAM_VALIDATION.images?.maxSizeMB;
    if (typeof maxSizeMB === 'number' && maxSizeMB > 0) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        for (const img of images) {
            const size = getFileSizeBytes(img);
            if (typeof size === 'number' && size > maxBytes) return false;
        }
    }

    return true;
};

const validateProgramSection = (section: ProgramSection, isPublishing: boolean): boolean => {
    const rules = getTemplateRules(section.template);
    if (!rules) return !isPublishing;

    const contents = (section.contents ?? []) as SectionContent[];

    if (!validateBasicValues(contents)) return false;
    if (!hasUniqueOrders(contents)) return false;
    if (!hasUniqueImageIds(contents)) return false;
    if (!validateAllowedContentTypes(contents, rules)) return false;

    if (!validateTemplateCounts(contents, rules, isPublishing)) return false;
    if (!validateTemplateGrouping(contents, rules, isPublishing)) return false;
    if (!validateTemplateLengths(contents, rules, isPublishing)) return false;
    if (!validateTemplateImages(contents, rules, isPublishing)) return false;

    return true;
};

export const validateProgramSections = (sections: ProgramSection[], isPublishing: boolean): string | undefined => {
    if (!sections || sections.length === 0) return undefined;

    for (let i = 0; i < sections.length; i++) {
        if (!validateProgramSection(sections[i], isPublishing)) {
            return 'invalid';
        }
    }

    return undefined;
};

export const isProgramSectionValid = (section: ProgramSection, isPublishing: boolean): boolean => {
    return validateProgramSection(section, isPublishing);
};
