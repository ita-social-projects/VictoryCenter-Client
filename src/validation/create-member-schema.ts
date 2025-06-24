import * as yup from 'yup';
//export type TeamCategory = "Основна команда" | "Наглядова рада" | "Радники";
// export type MemberFormValues = {
//     category: TeamCategory,
//     fullName: string,
//     description: string,
//     img: FileList | null
// };
const FILE_SIZE_LIMIT = 100 * 1024; // 100 кілобайт
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
        .matches(
            /^[A-Za-zА-Яа-яҐґЄєІіЇї'’\-\s]+$/,
            "Поле може містити лише літери, пробіли, ’ -. Поле не може містити цифри"),
    description: yup
        .string()
        .required('Введіть опис')
        .max(200, 'Не більше 200 символів'),

    img: yup
        .mixed()
        .defined()
        .required("Завантажте файл")
        .test("fileSize", "Файл має бути не більше 100KB", (value) => {
            if (value && value instanceof FileList && value.length > 0) {
                return value[0].size <= FILE_SIZE_LIMIT;
            }
            return false;
        })
        .test("fileType", "Допустимі формати: jpg, jpeg, pdf", (value) => {
            if (value && value instanceof FileList && value.length > 0) {
                return SUPPORTED_FORMATS.includes(value[0].type);
            }
            return false;
        }),
});