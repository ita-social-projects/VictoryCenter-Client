import { MockQuestions } from '../../../../utils/mock-data/public/programs-page';
import { axiosInstance } from '../../axios';
import { ProgramsPageData, PublishedProgramDto } from '../../../../types/public/programs-page';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';

export const programPageDataFetch = async (): Promise<ProgramsPageData> => {
    const response = await axiosInstance.get<PublishedProgramDto[]>(API_ROUTES.PROGRAMS.PUBLISHED);

    const programsCategories = Array.from(
        new Map(response.data.flatMap((x) => x.categories).map((x) => [x.id, x])).values(),
    );

    return {
        programsData: response.data,
        programsCategories: programsCategories,
    };
};
export const questionDataFetch = async () => MockQuestions;
