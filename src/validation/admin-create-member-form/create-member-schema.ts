import * as yup from 'yup';
import { TeamCategory } from '../../types/admin/TeamMembers';
<<<<<<< HEAD
// import { TEAM_CATEGORY_MAIN, TEAM_CATEGORY_SUPERVISORY, TEAM_CATEGORY_ADVISORS } from '../../const/team';
=======
>>>>>>> ece11d0

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
} from '../../const/admin/data-validation';

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
            .mixed<FileList | string>()
            .transform((value) => (value === null ? undefined : value))
            .test('fileSize', FILE_SIZE, (value) => {
                if (typeof value === 'string') return true;
                if (value && value instanceof FileList && value.length > 0) {
                    return value[0].size <= FILE_SIZE_LIMIT;
                }
                return true;
            })
            .test('fileType', FILE_FORMAT, (value) => {
                if (typeof value === 'string') return true;
                if (value && value instanceof FileList && value.length > 0) {
                    return SUPPORTED_FORMATS.includes(value[0].type);
                }
                return true;
            })
            .notRequired(),

        imageId: yup
            .number()
            .transform((value) => (value === null ? undefined : value))
<<<<<<< HEAD
=======
            .nullable()
>>>>>>> ece11d0
            .notRequired(),
    });
};

export type MemberFormSchemaType = yup.InferType<ReturnType<typeof useCreateMemberSchema>>;
