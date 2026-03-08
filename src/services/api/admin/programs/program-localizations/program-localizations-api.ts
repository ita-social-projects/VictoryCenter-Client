import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateHippotherapyProgramLocalizationDto, HippotherapyProgramLocalizationDto } from '@/types/admin/programs';

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
};
