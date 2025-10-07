import { VisibilityStatus } from '../../../../types/admin/common';
import { ProgramCategoryCreateUpdate, ProgramCreateUpdate } from '../../../../types/admin/programs';
import { mockCategories, mockPrograms } from '../../../../utils/mock-data/admin/programs';
import { ProgramsApi, ProgramsCategoriesApi } from './programs-api';
import { useAdminClient } from '../../../../hooks/admin/use-admin-client/useAdminClient';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { ImageApi } from '../image/image-api';

jest.mock('../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));
jest.mock('../image/image-api');

const mockedUseAdminClient = useAdminClient as jest.Mock;

let mockClient: any;

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    };

    mockClient.get.mockResolvedValue({ data: mockPrograms });
    mockClient.post.mockResolvedValue({ data: mockPrograms[0] });
    mockClient.put.mockResolvedValue({ data: mockPrograms[0] });
    mockClient.delete.mockResolvedValue({ data: { success: true } });

    mockedUseAdminClient.mockReturnValue({ client: mockClient });
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('fetchProgramCategories', () => {
    it('should fetch categories and add the correct programsCount property', async () => {
        const mockApiData = [
            { id: 1, name: 'Yoga', programs: [{}, {}, {}] },
            { id: 2, name: 'Pilates', programs: [{}] },
            { id: 3, name: 'Cardio', programs: [] },
        ];

        mockClient.get.mockResolvedValue({ data: mockApiData });

        const result = await ProgramsCategoriesApi.fetchProgramCategories(mockClient);

        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PROGRAMCATEGORY.BASE);

        expect(result).toHaveLength(3);

        expect(result[0].programsCount).toBe(3);
        expect(result[1].programsCount).toBe(1);
        expect(result[2].programsCount).toBe(0);

        expect(result[0].name).toBe('Yoga');
    });

    it('should return an empty array if the API provides no categories', async () => {
        mockClient.get.mockResolvedValue({ data: [] });

        const result = await ProgramsCategoriesApi.fetchProgramCategories(mockClient);

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });
});

describe('fetchProgramById', () => {
    it('should return program when found', async () => {
        mockClient.get.mockResolvedValueOnce({ data: mockPrograms[0] });
        const promise = ProgramsApi.fetchProgramById(1, mockClient);
        const result = await promise;

        expect(result).toEqual(mockPrograms[0]);
        expect(result?.id).toBe(1);
    });

    it('should return null when program not found', async () => {
        mockClient.get.mockResolvedValueOnce({ data: null });
        const promise = ProgramsApi.fetchProgramById(999, mockClient);
        const result = await promise;

        expect(result).toBeNull();
    });
});

describe('fetchPrograms', () => {
    it('should return paginated programs for category', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.filter((p) => p.categories.some((c) => c.id === 1)), totalItemsCount: 5 },
        });
        const promise = ProgramsApi.fetchPrograms(mockClient, 1, 0, 5);
        const result = await promise;

        expect(result.items).toBeDefined();
        expect(result.totalItemsCount).toBeDefined();
        expect(result.items.every((program) => program.categories.some((cat) => cat.id === 1))).toBe(true);
    });

    it('should filter by status when provided', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.filter((p) => p.status === VisibilityStatus.Published), totalItemsCount: 6 },
        });
        const promise = ProgramsApi.fetchPrograms(mockClient, 1, 0, 10, VisibilityStatus.Published);
        const result = await promise;

        expect(result.items.every((program) => program.status === VisibilityStatus.Published)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
        const pageSize = 2;
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.slice(0, pageSize), totalItemsCount: mockPrograms.length },
        });
        const promise = ProgramsApi.fetchPrograms(mockClient, 1, 0, pageSize);
        const result = await promise;

        expect(result.items).toHaveLength(Math.min(pageSize, result.totalItemsCount));
    });

    it('should return empty array for non-existent category', async () => {
        mockClient.get.mockResolvedValueOnce({ data: { items: [], totalItemsCount: 0 } });
        const promise = ProgramsApi.fetchPrograms(mockClient, 999, 0, 10);
        const result = await promise;

        expect(result.items).toHaveLength(0);
        expect(result.totalItemsCount).toBe(0);
    });

    it('should handle second page correctly', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.slice(1, 2), totalItemsCount: mockPrograms.length },
        });
        const promise = ProgramsApi.fetchPrograms(mockClient, 1, 1, 1);
        const result = await promise;

        expect(result).toBeDefined();
    });
});

describe('addProgram', () => {
    const programData: ProgramCreateUpdate = {
        id: null,
        name: 'Test Program',
        description: 'Test Description',
        status: VisibilityStatus.Draft,
        image: null,
        imageId: null,
        categoryIds: [1, 2],
    };

    it('should add program with File image and call ImageApi', async () => {
        const programData: ProgramCreateUpdate = {
            id: null,
            name: 'Test Program',
            description: 'Test Description',
            status: VisibilityStatus.Draft,
            image: { base64: 'test-base64-string', mimeType: 'image/png' },
            imageId: null,
            categoryIds: [1, 2],
        };

        const mockImageResponse = { id: 100, url: 'http://example.com/img.png', mimeType: 'image/png' };
        (ImageApi.post as jest.Mock).mockResolvedValue(mockImageResponse);

        mockClient.post.mockResolvedValueOnce({
            data: {
                ...programData,
                id: 13,
                imageId: mockImageResponse.id,
                categories: mockCategories.slice(0, 2),
            },
        });

        mockClient.get.mockResolvedValueOnce({ data: mockCategories });

        const result = await ProgramsApi.addProgram(mockClient, programData);

        expect(ImageApi.post).toHaveBeenCalledTimes(1);
        expect(ImageApi.post).toHaveBeenCalledWith(mockClient, programData.image);

        expect(mockClient.post).toHaveBeenCalledWith(
            API_ROUTES.PROGRAMS.BASE,
            expect.objectContaining({
                ...programData,
                imageId: mockImageResponse.id,
            }),
        );

        expect(result.id).toBeDefined();
        expect(result.name).toBe(programData.name);
        expect(result.description).toBe(programData.description);
        expect(result.status).toBe(programData.status);
        expect(result.categories).toHaveLength(4);
    });

    it('should add program with no image', async () => {
        const noImgData = { ...programData, img: null };
        mockClient.post.mockResolvedValueOnce({
            data: {
                ...noImgData,
                id: 13,
                categories: mockCategories.slice(0, 1),
                img: null,
            },
        });
        mockClient.get.mockResolvedValueOnce({ data: mockCategories });
        const promise = ProgramsApi.addProgram(mockClient, noImgData);
        const result = await promise;

        expect(result.image).toBeNull();
    });

    it('should handle empty categoryIds', async () => {
        const emptyData = { ...programData, categoryIds: [] };
        mockClient.post.mockResolvedValueOnce({
            data: {
                ...emptyData,
                id: 13,
                categories: [],
                img: null,
            },
        });
        mockClient.get.mockResolvedValueOnce({ data: [] });
        const promise = ProgramsApi.addProgram(mockClient, emptyData);
        const result = await promise;

        expect(result.categories).toHaveLength(0);
    });
});

describe('editProgram', () => {
    const programData: ProgramCreateUpdate = {
        id: 1,
        name: 'Updated Program',
        description: 'Updated Description',
        status: VisibilityStatus.Published,
        image: null,
        imageId: null,
        categoryIds: [2],
    };

    beforeEach(() => {
        const initialImageId = 55;
        const mockUpdateImageResponse = { finalImageId: 101, imageIdToDelete: initialImageId };
        (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue(mockUpdateImageResponse);
    });

    it('should edit existing program with File image', async () => {
        mockClient.put.mockResolvedValueOnce({
            data: {
                ...programData,
                id: 1,
                categories: mockCategories.slice(0, 2),
                img: null,
            },
        });
        const promise = ProgramsApi.editProgram(programData, mockClient);
        const result = await promise;

        expect(result.id).toBe(1);
        expect(result.name).toBe(programData.name);
    });

    it('should edit existing program with null image', async () => {
        const noImgData = { ...programData, img: null };
        mockClient.put.mockResolvedValueOnce({ data: { ...noImgData, img: null } });
        const promise = ProgramsApi.editProgram(noImgData, mockClient);
        const result = await promise;

        expect(result.image).toBeNull();
    });

    it('should throw error when program not found', async () => {
        mockClient.put.mockRejectedValueOnce(new Error('Program not found'));
        const promise = ProgramsApi.editProgram({ ...programData, id: 999 }, mockClient);
        await expect(promise).rejects.toThrow('Program not found');
    });
});

describe('deleteProgram', () => {
    beforeEach(() => {
        const initialImageId = 55;
        const mockUpdateImageResponse = { finalImageId: 101, imageIdToDelete: initialImageId };
        (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue(mockUpdateImageResponse);
    });

    it('should delete existing program', async () => {
        const programToDelete = mockPrograms[0];
        const promise = ProgramsApi.deleteProgram(programToDelete.id, mockClient);
        await promise;

        expect(mockClient.delete).toHaveBeenCalledWith(expect.stringContaining(`/${programToDelete.id}`));
    });

    it('should throw error when program not found', async () => {
        mockClient.delete.mockRejectedValueOnce(new Error('Program not found'));
        const promise = ProgramsApi.deleteProgram(999, mockClient);
        await expect(promise).rejects.toThrow('Program not found');
    });
});

describe('addProgramCategory', () => {
    it('should add new category', async () => {
        const categoryData: ProgramCategoryCreateUpdate = {
            id: null,
            name: 'New Category',
        };
        mockClient.post.mockResolvedValueOnce({ data: { id: 4, name: categoryData.name, programsCount: 0 } });
        const promise = ProgramsCategoriesApi.addProgramCategory(categoryData, mockClient);
        const result = await promise;

        expect(result.id).toBeDefined();
        expect(result.name).toBe(categoryData.name);
        expect(result.programsCount).toBe(0);
    });
});

describe('editCategory', () => {
    it('should edit existing category', async () => {
        const categoryData: ProgramCategoryCreateUpdate = {
            id: 1,
            name: 'Updated Category Name',
        };
        mockClient.put.mockResolvedValueOnce({ data: { id: 1, name: categoryData.name, programsCount: 5 } });
        const promise = ProgramsCategoriesApi.editProgramCategory(categoryData, mockClient);
        const result = await promise;

        expect(result.id).toBe(1);
        expect(result.name).toBe(categoryData.name);
    });

    it('should throw error when category not found', async () => {
        const categoryData = { id: 999, name: 'Non-existent Category' };
        mockClient.put.mockRejectedValueOnce(new Error('Category not found'));
        const promise = ProgramsCategoriesApi.editProgramCategory(categoryData, mockClient);
        await expect(promise).rejects.toThrow('Category not found');
    });
});

describe('deleteCategory', () => {
    it('should delete category with zero programs', async () => {
        const categoryToDelete = mockCategories.find((c) => c.programsCount === 0)!;
        const promise = ProgramsCategoriesApi.deleteProgramCategory(categoryToDelete.id, mockClient);
        await promise;

        expect(mockClient.delete).toHaveBeenCalledWith(expect.stringContaining(`/${categoryToDelete.id}`));
    });

    it('should throw error when category has programs', async () => {
        const categoryWithPrograms = mockCategories.find((c) => c.programsCount > 0)!;
        mockClient.delete.mockRejectedValueOnce(new Error('Category has at least one program'));
        const promise = ProgramsCategoriesApi.deleteProgramCategory(categoryWithPrograms.id, mockClient);
        await expect(promise).rejects.toThrow('Category has at least one program');
    });

    it('should throw error when category not found', async () => {
        mockClient.delete.mockRejectedValueOnce(new Error('Category not found'));
        const promise = ProgramsCategoriesApi.deleteProgramCategory(999, mockClient);
        await expect(promise).rejects.toThrow('Category not found');
    });
});

describe('fetchProgramSearchItems', () => {
    it('should prioritize direct name matches in sorting, then sort alphabetically', async () => {
        const programWithNameMatch = {
            id: 100,
            name: 'Core Pilates Workout',
            description: 'test',
            status: VisibilityStatus.Published,
            img: null,
            categories: [{ id: 9, name: 'General', programsCount: 1 }],
        };
        const programWithCategoryMatch = {
            id: 101,
            name: 'Advanced Flexibility',
            description: 'test',
            status: VisibilityStatus.Published,
            img: null,
            categories: [{ id: 10, name: 'Pilates', programsCount: 1 }],
        };

        mockClient.get.mockResolvedValueOnce({
            data: [...mockPrograms, programWithNameMatch, programWithCategoryMatch],
        });
        const searchTerm = 'Pilates';
        const promise = ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, 0, 10);
        const result = await promise;

        const ids = result.items.map((i) => i.id);
        const nameMatchIndex = ids.indexOf(programWithNameMatch.id);
        const categoryMatchIndex = ids.indexOf(programWithCategoryMatch.id);

        expect(nameMatchIndex).toBeGreaterThan(-1);
        expect(categoryMatchIndex).toBeGreaterThan(-1);
        expect(nameMatchIndex).toBeLessThan(categoryMatchIndex);
    });

    it('should handle pagination correctly', async () => {
        const searchTerm = 'program';
        const limit = 2;
        const offset = 2;

        mockClient.get.mockResolvedValueOnce({ data: mockPrograms });
        const promise = ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, offset, limit);
        const result = await promise;

        const fullResults = mockPrograms.filter(
            (p) =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.categories.some((c) => c.name.toLowerCase().includes(searchTerm)),
        );

        expect(result.items).toHaveLength(Math.min(limit, Math.max(0, fullResults.length - offset)));
        expect(result.totalItemsCount).toBe(fullResults.length);
    });

    it('should return an empty result when no matches are found', async () => {
        const searchTerm = 'NonExistentProgramXYZ';
        mockClient.get.mockResolvedValueOnce({ data: [] });
        const promise = ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, 0, 10);
        const result = await promise;

        expect(result.items).toHaveLength(0);
        expect(result.totalItemsCount).toBe(0);
    });

    it('should sort matches alphabetically when match priority is the same', async () => {
        const searchTerm = 'терапія';

        const mockApiData = [
            { id: 1, name: 'Психологічна терапія', categories: [] },
            { id: 2, name: 'Фітнес для всіх', categories: [{ name: 'Реабілітаційна терапія' }] },
            { id: 3, name: 'Арт-терапія', categories: [] }, // Збіг за назвою
            { id: 4, name: 'Йога для спини', categories: [{ name: 'Фізична терапія' }] },
        ];

        mockClient.get.mockResolvedValueOnce({ data: mockApiData });

        const result = await ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, 0, 10);

        const expectedOrder = ['Арт-терапія', 'Психологічна терапія', 'Йога для спини', 'Фітнес для всіх'];

        const actualNames = result.items.map((item) => item.name);

        expect(actualNames).toEqual(expectedOrder);
    });
});

describe('API Error and Cancellation Handling', () => {
    it('should reject fetchPrograms with AbortError if the request is cancelled', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Request was cancelled'));
        const promise = ProgramsApi.fetchPrograms(mockClient, 1, 0, 10, undefined);
        await expect(promise).rejects.toThrow('Request was cancelled');
    });

    it('should reject fetchProgramSearchItems with AbortError if the request is cancelled', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Request was cancelled'));
        const promise = ProgramsApi.fetchProgramSearchItems(mockClient, 'search', 0, 10);
        await expect(promise).rejects.toThrow('Request was cancelled');
    });

    it('should handle a pre-aborted signal correctly', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Request was cancelled'));
        const promise = ProgramsApi.fetchProgramById(1, mockClient);
        await expect(promise).rejects.toThrow('Request was cancelled');
    });
});
