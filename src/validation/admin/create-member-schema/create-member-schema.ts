import * as yup from 'yup';
import { TeamCategory } from '../../types/admin/TeamMembers';
import { ImageValues } from '../../../types/common/image';

import {
    CATEGORY_REQUIRED,
    FULLNAME_REQUIRED,
    FULLNAME_MAX,
    FULLNAME_MIN,
    FORBIDDEN_SYMBOLS,
    DESCRIPTIONS_MAX,
    DESCRIPTIONS_MIN,
    FILE_SIZE,
    FILE_FORMAT,
    MAX_FULLNAME_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    MIN_FULLNAME_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    FILE_SIZE_LIMIT,
    SUPPORTED_FORMATS,
    DESCRIPTIONS_REQUIRED,
    IMG_REQUIRED,
} from '../../../const/admin/data-validation';

export const useCreateMemberSchema = (isDraft: boolean) => {
    return yup.object({
        category: yup
            .mixed<TeamCategory>()
            .transform((value) => (value === '' ? undefined : value))
            .required(CATEGORY_REQUIRED),

        fullName: yup
            .string()
            .transform((value) => (value === '' ? undefined : value))
            .required(FULLNAME_REQUIRED)
            .max(MAX_FULLNAME_LENGTH, FULLNAME_MAX)
            .min(MIN_FULLNAME_LENGTH, FULLNAME_MIN)
            .matches(/^[A-Za-zА-Яа-яҐґЄєІіЇї'’\-\s]+$/, FORBIDDEN_SYMBOLS),

        description: yup
            .string()
            .transform((value) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
            .max(MAX_DESCRIPTION_LENGTH, DESCRIPTIONS_MAX)
            .test('description-required-if-not-draft', DESCRIPTIONS_REQUIRED, (value) => {
                if (isDraft) return true;
                return typeof value === 'string' && value.trim().length > 0;
            })
            .test('description-min-length-if-not-draft', DESCRIPTIONS_MIN, (value) => {
                if (isDraft) return true;
                return typeof value === 'string' && value.trim().length >= MIN_DESCRIPTION_LENGTH;
            }),

        image: yup
            .mixed<ImageValues | string>()
            .transform((value) => (value === null ? undefined : value))
            .test('image-required-if-not-draft', IMG_REQUIRED, (value) => {
                if (isDraft) return true;
                return value !== undefined && value !== null;
            })
            .test('fileSize', FILE_SIZE, (value) => {
                if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
                    return true;
                }
                if (typeof value === 'string') return true;
                if (value) {
                    return value.size <= FILE_SIZE_LIMIT;
                }
                return true;
            })
            .test('fileType', FILE_FORMAT, (value) => {
                if (!value || typeof value === 'string') return true;
                if (value) {
                    return SUPPORTED_FORMATS.includes(value.mimeType);
                }
                return true;
            })
            .notRequired(),

        imageId: yup
            .number()
            .transform((value) => (value === null ? undefined : value))
            .nullable()
            .notRequired(),
    });
};

export type MemberFormSchemaType = yup.InferType<ReturnType<typeof useCreateMemberSchema>>;
