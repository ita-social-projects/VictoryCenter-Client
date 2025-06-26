import * as yup from 'yup';

const FILE_SIZE_LIMIT = 100 * 1024; 
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'application/pdf'];
export const useCreateMemberSchema = yup.object({
    category: yup
        .string()
        .required("Категорія обовʼязкова")
        .oneOf(['Основна команда', 'Наглядова рада', 'Радники'], "Виберіть категорію"), 
    
    fullName: yup
        .string()
        .required('Введіть ім\'я та прізвище')
        .max(50, 'Не більше 50 символів')
        .min(2, 'Не менше 2 символів')
        .matches(
            /^[A-Za-zА-Яа-яҐґЄєІіЇї'’\-\s]+$/,
            "Поле може містити лише літери, пробіли, ’ -. Поле не може містити цифри"),
    
    description: yup
        .string()
        .required('Введіть опис')
        .max(200, 'Не більше 200 символів')
        .min(10, 'Не менше 10 символів'),

    img: yup
        .mixed()
        .defined()
        .notRequired()
        .test("fileSize", "Файл має бути не більше 100KB", (value) => {
            if (value && value instanceof FileList && value.length > 0) {
                return value[0].size <= FILE_SIZE_LIMIT;
            }
            return true;
        })
        .test("fileType", "Допустимі формати: jpg, jpeg, pdf", (value) => {
            if (value && value instanceof FileList && value.length > 0) {
                return SUPPORTED_FORMATS.includes(value[0].type);
            }
            return true;
        }),
});