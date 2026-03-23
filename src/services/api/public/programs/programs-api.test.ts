import { programPageDataFetch, fetchProgramBySlug } from './programs-api';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PublishedProgramDto, DetailedProgramDto } from '@/types/public/programs-page';

jest.mock('@/services/api/axios');
jest.mock('@/utils/mock-data/public/programs-page', () => ({
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
                    previewImage: null,
                    name: 'Program A',
                    description: 'Description A',
                    categories: [
                        { id: 1, name: 'Category 1' },
                        { id: 2, name: 'Category 2' },
                    ],
                    slug: 'program-a',
                    localizations: [],
                },
                {
                    id: 2,
                    previewImage: null,
                    name: 'Program B',
                    description: 'Description B',
                    categories: [{ id: 1, name: 'Category 1' }],
                    slug: 'program-b',
                    localizations: [],
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

    describe('fetchProgramBySlug', () => {
        it('should fetch program by slug and return detailed program data', async () => {
            const mockProgram: DetailedProgramDto = {
                id: 1,
                name: 'Test Program',
                slug: 'test-program',
                description: 'Test Description',
                backgroundImage: null,
                previewImage: null,
                sections: [],
                location: '',
                participantsCount: '0',
                meetingsCount: '0',
                localizations: [],
            };

            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockProgram });

            const result = await fetchProgramBySlug('test-program');

            expect(axiosInstance.get).toHaveBeenCalledWith(`${API_ROUTES.PROGRAMS.BY_SLUG}/test-program`);
            expect(result).toEqual(mockProgram);
        });

        it('should handle different slug formats', async () => {
            const mockProgram: DetailedProgramDto = {
                id: 2,
                name: 'Another Program',
                slug: 'another-program-2024',
                description: 'Description',
                previewImage: null,
                backgroundImage: null,
                location: '',
                participantsCount: '0',
                meetingsCount: '0',
                sections: [],
                localizations: [],
            };

            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockProgram });

            const result = await fetchProgramBySlug('another-program-2024');

            expect(axiosInstance.get).toHaveBeenCalledWith(`${API_ROUTES.PROGRAMS.BY_SLUG}/another-program-2024`);
            expect(result).toEqual(mockProgram);
        });

        it('should throw an error when program is not found', async () => {
            (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Program not found'));

            await expect(fetchProgramBySlug('non-existent-program')).rejects.toThrow('Program not found');
            expect(axiosInstance.get).toHaveBeenCalledWith(`${API_ROUTES.PROGRAMS.BY_SLUG}/non-existent-program`);
        });

        it('should throw an error when API fails', async () => {
            (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Network error'));

            await expect(fetchProgramBySlug('test-slug')).rejects.toThrow('Network error');
        });
    });
});
