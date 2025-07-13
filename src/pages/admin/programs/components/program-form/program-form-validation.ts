import {ProgramCategory, ProgramStatus} from "../../../../../types/ProgramAdminPage";
import { PROGRAM_VALIDATION } from "../../../../../const/admin/programs";
import * as Yup from 'yup';

export const getProgramValidationSchema = (status: ProgramStatus) =>
    Yup.object({
        name: Yup.string()
            .min(PROGRAM_VALIDATION.name.min, PROGRAM_VALIDATION.name.getMinError())
            .max(PROGRAM_VALIDATION.name.max, PROGRAM_VALIDATION.name.getMaxError())
            .matches(PROGRAM_VALIDATION.name.allowed_chars, PROGRAM_VALIDATION.name.getAllowedCharsError())
            .required(PROGRAM_VALIDATION.name.getRequiredError()),

    categories: Yup.array<ProgramCategory>()
      .of(
        Yup.object({
          id: Yup.number().required(),
          name: Yup.string().required(),
          programsCount: Yup.number().required(),
        })
      )
      .min(1, PROGRAM_VALIDATION.categories.getMinError()),

    description: Yup.string()
      .max(PROGRAM_VALIDATION.description.max, PROGRAM_VALIDATION.description.getMaxError())
      .when([], {
        is: () => status === 'Published',
        then: schema => schema.required(PROGRAM_VALIDATION.description.getRequiredError()),
        otherwise: schema => schema.notRequired(),
      }),

    img: Yup.mixed<FileList | string>()
        .transform((value) => (value === null ? undefined : value))
        .test('fileFormat', PROGRAM_VALIDATION.img.getFormatError(), (value) => {
            if (typeof value === "string") return true;
            if (value && value instanceof FileList && value.length > 0) {
                return  PROGRAM_VALIDATION.img.allowedFormats.includes(value[0].type);
            }
            return true;
        })
        .test('fileSize', PROGRAM_VALIDATION.img.getSizeError(), (value) => {
            if (typeof value === "string") return true;
            if (value && value instanceof FileList && value.length > 0) {
                return value[0].size <= PROGRAM_VALIDATION.img.maxSizeBytes;
            }
            return true;
      }),
  });
