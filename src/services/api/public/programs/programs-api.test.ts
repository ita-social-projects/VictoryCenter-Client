import { programPageDataFetch } from './programs-api';
import { axiosInstance } from '../../axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { PublishedProgramDto } from '../../../../types/public/programs-page';

jest.mock('../../axios');
jest.mock('../../../../utils/mock-data/public/programs-page', () => ({
    MockQuestions: [{ id: 1, question: 'Test Question' }],
}));

describe('programs-api', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('programPageDataFetch', () => {
        it('should fetch published programs and return programs + unique categories', async () => {
            const mockPrograms: PublishedProgramDto[] = [
                {
                    id: 1,
                    image: null,
                    name: 'Program A',
                    description: 'Description A',
                    categories: [
                        { id: 1, name: 'Category 1' },
                        { id: 2, name: 'Category 2' },
                    ],
                },
                {
                    id: 2,
                    image: null,
                    name: 'Program B',
                    description: 'Description B',
                    categories: [{ id: 1, name: 'Category 1' }], // duplicate
                },
            ];

            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockPrograms });

            const result = await programPageDataFetch();

            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.PROGRAMS.PUBLISHED);
            expect(result.programsData).toEqual(mockPrograms);
            expect(result.programsCategories).toEqual([
                { id: 1, name: 'Category 1' },
                { id: 2, name: 'Category 2' },
            ]);
        });

        it('should return empty arrays when API returns no data', async () => {
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] });

            const result = await programPageDataFetch();

            expect(result.programsData).toEqual([]);
            expect(result.programsCategories).toEqual([]);
        });

        it('should throw an error when API fails', async () => {
            (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Network error'));

            await expect(programPageDataFetch()).rejects.toThrow('Network error');
        });
    });
});
