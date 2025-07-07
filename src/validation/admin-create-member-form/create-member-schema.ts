import * as yup from 'yup';
import { TeamCategory } from "../../pages/admin/team/TeamPage";
import {
    TEAM_CATEGORY_MAIN,
    TEAM_CATEGORY_SUPERVISORY,
    TEAM_CATEGORY_ADVISORS
} from '../../const/team';

import {
    CATEGORY_REQUIRED,
    CHOOSE_CATEGORY,
    FULLNAME_REQUIRED,
    FULLNAME_MAX,
    FULLNAME_MIN,
    FORBIDDEN_SYMBOLS,
    DESCRIPTIONS_MAX,
    DESCRIPTIONS_MIN,
    FILE_SIZE,
    FILE_FORMAT,
    IMG_REQUIRED,
    MAX_FULLNAME_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    MIN_FULLNAME_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    FILE_SIZE_LIMIT,
    SUPPORTED_FORMATS
} from '../../const/admin/data-validation';

export const useCreateMemberSchema = (isDraft: boolean) => {
    return yup.object({
        category: yup
            .mixed<TeamCategory>()
            .required(CATEGORY_REQUIRED)
            .oneOf(
                [TEAM_CATEGORY_MAIN, TEAM_CATEGORY_SUPERVISORY, TEAM_CATEGORY_ADVISORS],
                CHOOSE_CATEGORY
            ),

        fullName: yup
            .string()
            .required(FULLNAME_REQUIRED)
            .max(MAX_FULLNAME_LENGTH, FULLNAME_MAX)
            .min(MIN_FULLNAME_LENGTH, FULLNAME_MIN)
            .matches(/^[A-Za-zА-Яа-яҐґЄєІіЇї'’\-\s]+$/, FORBIDDEN_SYMBOLS),

        description: yup
            .string()
            .transform(value => (value === null ? undefined : value))
            .max(MAX_DESCRIPTION_LENGTH, DESCRIPTIONS_MAX)
            .test(
                'min-if-not-draft',
                `Мінімум ${DESCRIPTIONS_MIN} символів`,
                value => {
                    if (isDraft) return true; 
                    if (typeof value === 'string') return value.length >= MIN_DESCRIPTION_LENGTH;
                    return false; 
                }
            )
            .notRequired(),
        
        img: yup
            .mixed<FileList | string>()
            .transform((value) => (value === null ? undefined : value))
            .test("img-required-if-not-draft", IMG_REQUIRED, (value) => {
                if (isDraft) return true;
                if (typeof value === "string") return true; 
                return value instanceof FileList && value.length > 0;
            })
            .test("fileSize", FILE_SIZE, (value) => {
                if (typeof value === "string") return true;
                if (value && value instanceof FileList && value.length > 0) {
                    return value[0].size <= FILE_SIZE_LIMIT;
                }
                return true;
            })
            .test("fileType", FILE_FORMAT, (value) => {
                if (typeof value === "string") return true;
                if (value && value instanceof FileList && value.length > 0) {
                    return SUPPORTED_FORMATS.includes(value[0].type);
                }
                return true;
            })
            .notRequired(),
    });
};

export type MemberFormSchemaType = yup.InferType<ReturnType<typeof useCreateMemberSchema>>;
