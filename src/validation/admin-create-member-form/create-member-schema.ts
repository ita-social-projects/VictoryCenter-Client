import * as yup from 'yup';
import { TEAM_CATEGORY_MAIN, TEAM_CATEGORY_SUPERVISORY, TEAM_CATEGORY_ADVISORS } from '../../const/team';
import { 
    CATEGORY_REQUIRED,
    CHOOSE_CATEGORY,
    FULLNAME_REQUIRED,
    FULLNAME_MAX,
    FULLNAME_MIN,
    FORBIDDEN_SYMBOLS,
    DESCRIPTIONS_REQUIRED,
    DESCRIPTIONS_MAX,
    DESCRIPTIONS_MIN,
    FILE_SIZE,
    FILE_FORMAT,
    IMG_REQUIRED } from '../../const/admin/data-validation';

const FILE_SIZE_LIMIT = 3 * 1024 * 1024; 
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const useCreateMemberSchema = yup.object({
    category: yup
        .string()
        .required(CATEGORY_REQUIRED)
        .oneOf([TEAM_CATEGORY_MAIN, TEAM_CATEGORY_SUPERVISORY, TEAM_CATEGORY_ADVISORS], CHOOSE_CATEGORY), 
    
    fullName: yup
        .string()
        .required(FULLNAME_REQUIRED)
        .max(50, FULLNAME_MAX)
        .min(2, FULLNAME_MIN)
        .matches(
            /^[A-Za-zА-Яа-яҐґЄєІіЇї'’\-\s]+$/,
            FORBIDDEN_SYMBOLS),
    
    description: yup
        .string()
        .required(DESCRIPTIONS_REQUIRED)
        .max(200, DESCRIPTIONS_MAX)
        .min(10, DESCRIPTIONS_MIN),

    img: yup
        .mixed()
        .defined()
        .test("required", IMG_REQUIRED, (value) => {
            return value && value instanceof FileList && value.length > 0;
        })
        .test("fileSize", FILE_SIZE, (value) => {
            if (value && value instanceof FileList && value.length > 0) {
                return value[0].size <= FILE_SIZE_LIMIT;
            }
            return true;
        })
        .test("fileType", FILE_FORMAT, (value) => {
            if (value && value instanceof FileList && value.length > 0) {
                return SUPPORTED_FORMATS.includes(value[0].type);
            }
            return true;
        }),
});
