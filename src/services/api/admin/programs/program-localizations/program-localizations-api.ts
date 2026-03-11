import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateHippotherapyProgramLocalizationDto, HippotherapyProgramLocalizationDto } from '@/types/admin/programs';

type UpdateHippotherapyProgramLocalizationDto = Omit<
    CreateHippotherapyProgramLocalizationDto,
    'entityId' | 'languageId'
>;

export const ProgramLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateHippotherapyProgramLocalizationDto,
    ): Promise<HippotherapyProgramLocalizationDto> => {
        const response = await client.post<HippotherapyProgramLocalizationDto>(
            API_ROUTES.PROGRAM_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },
    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateHippotherapyProgramLocalizationDto,
    ): Promise<HippotherapyProgramLocalizationDto> => {
        const response = await client.put<HippotherapyProgramLocalizationDto>(
            `${API_ROUTES.PROGRAM_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
