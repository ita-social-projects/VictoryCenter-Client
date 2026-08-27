import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateProgramCategoryLocalizationDto,
    ProgramCategoryLocalizationDto,
    UpdateProgramCategoryLocalizationDto,
} from '@/types/admin/programs';

export const ProgramCategoryLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateProgramCategoryLocalizationDto,
    ): Promise<ProgramCategoryLocalizationDto> => {
        const response = await client.post<ProgramCategoryLocalizationDto>(
            API_ROUTES.PROGRAM_CATEGORY_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateProgramCategoryLocalizationDto,
    ): Promise<ProgramCategoryLocalizationDto> => {
        const response = await client.put<ProgramCategoryLocalizationDto>(
            `${API_ROUTES.PROGRAM_CATEGORY_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
