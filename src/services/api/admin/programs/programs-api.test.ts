import { VisibilityStatus } from '@/types/admin/common';
import { ProgramCategoryCreateUpdate, ProgramCreateUpdate, Program, ProgramCategory } from '@/types/admin/programs';
import { ProgramsApi, ProgramsCategoriesApi } from './programs-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));
jest.mock('@/services/api/admin/image/image-api');

const mockedUseAdminClient = useAdminClient as jest.Mock;

// Mock data defined locally
const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Ветеранські', programsCount: 2 },
    { id: 2, name: 'Дитячі', programsCount: 3 },
    { id: 3, name: 'Інклюзивні', programsCount: 0 },
];

const mockPrograms: Program[] = [
    {
        id: 1,
        name: 'Коні лікують Літо 2025',
        description: 'Зменшення рівня стресу, тривоги та ПТСР у ветеранів',
        categories: [mockCategories[0]],
        status: VisibilityStatus.Published,
        previewImage: null,
        backgroundImage: null,
        location: 'Київ',
        participantsCount: '10-15 осіб',
        meetingsCount: '12 занять',
        sections: [],
        slug: 'koni-likuyut-lito-2025',
    },
    {
        id: 2,
        name: 'Кінна терапія для дітей',
        description: 'Покращення комунікаційних навичок для дітей',
        categories: [mockCategories[1]],
        status: VisibilityStatus.Draft,
        previewImage: null,
        backgroundImage: null,
        location: 'Львів',
        participantsCount: '8-10 дітей',
        meetingsCount: '10 занять',
        sections: [],
        slug: 'kinna-terapiya-dlya-ditey',
    },
    {
        id: 3,
        name: 'Реабілітація після поранень',
        description: 'Програма для військових з фізичними травмами',
        categories: [mockCategories[0], mockCategories[2]],
        status: VisibilityStatus.Published,
        previewImage: null,
        backgroundImage: null,
        location: 'Одеса',
        participantsCount: '5-8 осіб',
        meetingsCount: '15 занять',
        sections: [],
        slug: 'reabilitatsiya-pislya-poranen',
    },
];

const createMockFile = (): { base64: string; mimeType: string } => ({
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    mimeType: 'image/png',
});

const getValidProgramData = (overrides?: Partial<ProgramCreateUpdate>): ProgramCreateUpdate => ({
    id: null,
    name: 'Valid Program Name',
    description: 'This is a valid description with enough characters.',
    categoryIds: [1],
    status: VisibilityStatus.Draft,
    previewImage: createMockFile(),
    previewImageId: null,
    backgroundImage: createMockFile(),
    backgroundImageId: null,
    location: 'Location 123',
    participantsCount: 'Some participants 123',
    meetingsCount: 'Some meetings count 123',
    sections: [],
    ...overrides,
});

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
        const result = await ProgramsApi.fetchProgramById(1, mockClient);

        expect(result).toEqual(mockPrograms[0]);
        expect(result?.id).toBe(1);
    });

    it('should return null when program not found', async () => {
        mockClient.get.mockResolvedValueOnce({ data: null });
        const result = await ProgramsApi.fetchProgramById(999, mockClient);

        expect(result).toBeNull();
    });

    it('should call API with correct route and ID', async () => {
        const programId = 42;
        mockClient.get.mockResolvedValueOnce({ data: mockPrograms[0] });

        await ProgramsApi.fetchProgramById(programId, mockClient);

        expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.PROGRAMS.BASE}/${programId}`);
    });

    it('should throw error when API fails', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Server error'));

        await expect(ProgramsApi.fetchProgramById(1, mockClient)).rejects.toThrow('Server error');
    });
});

describe('fetchPrograms', () => {
    it('should return paginated programs for category', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.filter((p) => p.categories.some((c) => c.id === 1)), totalItemsCount: 2 },
        });
        const result = await ProgramsApi.fetchPrograms(mockClient, 1, 0, 5);

        expect(result.items).toBeDefined();
        expect(result.totalItemsCount).toBeDefined();
        expect(result.items.every((program) => program.categories.some((cat) => cat.id === 1))).toBe(true);
    });

    it('should filter by status when provided', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.filter((p) => p.status === VisibilityStatus.Published), totalItemsCount: 2 },
        });
        const result = await ProgramsApi.fetchPrograms(mockClient, 1, 0, 10, VisibilityStatus.Published);

        expect(result.items.every((program) => program.status === VisibilityStatus.Published)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
        const pageSize = 2;
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.slice(0, pageSize), totalItemsCount: mockPrograms.length },
        });
        const result = await ProgramsApi.fetchPrograms(mockClient, 1, 0, pageSize);

        expect(result.items).toHaveLength(Math.min(pageSize, result.totalItemsCount));
    });

    it('should return empty array for non-existent category', async () => {
        mockClient.get.mockResolvedValueOnce({ data: { items: [], totalItemsCount: 0 } });
        const result = await ProgramsApi.fetchPrograms(mockClient, 999, 0, 10);

        expect(result.items).toHaveLength(0);
        expect(result.totalItemsCount).toBe(0);
    });

    it('should handle second page correctly', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: { items: mockPrograms.slice(1, 2), totalItemsCount: mockPrograms.length },
        });
        const result = await ProgramsApi.fetchPrograms(mockClient, 1, 1, 1);

        expect(result).toBeDefined();
    });

    it('should pass correct parameters to API', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: { items: [], totalItemsCount: 0 },
        });
        const categoryId = 3;
        const offset = 10;
        const limit = 20;
        const status = VisibilityStatus.Draft;

        await ProgramsApi.fetchPrograms(mockClient, categoryId, offset, limit, status);

        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PROGRAMS.BASE, {
            params: {
                categoryId,
                offset,
                limit,
                status,
            },
        });
    });

    it('should handle API errors gracefully', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(ProgramsApi.fetchPrograms(mockClient, 1, 0, 10)).rejects.toThrow('Network error');
    });
});

describe('addProgram', () => {
    it('should add program with preview and background images', async () => {
        const programData = getValidProgramData();
        const originalPreviewImage = programData.previewImage;
        const originalBackgroundImage = programData.backgroundImage;

        const mockPreviewImageResponse = { id: 100, url: 'http://example.com/preview.png', mimeType: 'image/png' };
        const mockBackgroundImageResponse = {
            id: 101,
            url: 'http://example.com/background.png',
            mimeType: 'image/png',
        };

        (ImageApi.post as jest.Mock)
            .mockResolvedValueOnce(mockPreviewImageResponse)
            .mockResolvedValueOnce(mockBackgroundImageResponse);

        mockClient.post.mockResolvedValueOnce({
            data: {
                ...programData,
                id: 13,
                previewImageId: mockPreviewImageResponse.id,
                backgroundImageId: mockBackgroundImageResponse.id,
            },
        });

        mockClient.get.mockResolvedValueOnce({ data: mockCategories });

        const result = await ProgramsApi.addProgram(mockClient, programData);

        expect(ImageApi.post).toHaveBeenCalledTimes(2);
        expect(ImageApi.post).toHaveBeenCalledWith(mockClient, originalPreviewImage);
        expect(ImageApi.post).toHaveBeenCalledWith(mockClient, originalBackgroundImage);

        expect(mockClient.post).toHaveBeenCalledWith(
            API_ROUTES.PROGRAMS.BASE,
            expect.objectContaining({
                previewImageId: mockPreviewImageResponse.id,
                backgroundImageId: mockBackgroundImageResponse.id,
                previewImage: null,
                backgroundImage: null,
            }),
        );

        expect(result.id).toBeDefined();
        expect(result.name).toBe(programData.name);
        expect(result.description).toBe(programData.description);
        expect(result.location).toBe(programData.location);
        expect(result.participantsCount).toBe(programData.participantsCount);
        expect(result.meetingsCount).toBe(programData.meetingsCount);
    });

    it('should add program with no images', async () => {
        const programData = getValidProgramData({
            previewImage: null,
            backgroundImage: null,
        });

        mockClient.post.mockResolvedValueOnce({
            data: {
                ...programData,
                id: 13,
                previewImage: null,
                backgroundImage: null,
            },
        });
        mockClient.get.mockResolvedValueOnce({ data: mockCategories });

        const result = await ProgramsApi.addProgram(mockClient, programData);

        expect(ImageApi.post).not.toHaveBeenCalled();
        expect(result.previewImage).toBeNull();
        expect(result.backgroundImage).toBeNull();
    });

    it('should handle empty categoryIds', async () => {
        const programData = getValidProgramData({
            categoryIds: [],
            previewImage: null,
            backgroundImage: null,
        });

        mockClient.post.mockResolvedValueOnce({
            data: {
                id: 13,
                name: programData.name,
                description: programData.description,
                status: programData.status,
                categoryIds: [],
                location: programData.location,
                participantsCount: programData.participantsCount,
                meetingCount: programData.meetingsCount,
                previewImageId: null,
                backgroundImageId: null,
            },
        });
        mockClient.get.mockResolvedValueOnce({ data: [] });

        const result = await ProgramsApi.addProgram(mockClient, programData);

        expect(result.categories).toHaveLength(0);
    });

    it('should add program with section images', async () => {
        const programData = getValidProgramData({
            previewImage: null,
            backgroundImage: null,
            sections: [
                {
                    id: undefined,
                    order: 0,
                    template: 1,
                    contents: [
                        {
                            contentType: 1,
                            order: 0,
                            title: 'Test Title',
                            description: null,
                            image: createMockFile(),
                            imageId: null,
                        },
                        {
                            contentType: 2,
                            order: 1,
                            title: null,
                            description: 'Test Description',
                            image: createMockFile(),
                            imageId: null,
                        },
                    ],
                },
            ],
        });

        const mockImageResponse1 = { id: 200, url: 'http://example.com/section-img1.png', mimeType: 'image/png' };
        const mockImageResponse2 = { id: 201, url: 'http://example.com/section-img2.png', mimeType: 'image/png' };

        (ImageApi.post as jest.Mock)
            .mockResolvedValueOnce(mockImageResponse1)
            .mockResolvedValueOnce(mockImageResponse2);

        mockClient.post.mockResolvedValueOnce({
            data: {
                ...programData,
                id: 14,
            },
        });
        mockClient.get.mockResolvedValueOnce({ data: mockCategories });

        const result = await ProgramsApi.addProgram(mockClient, programData);

        expect(ImageApi.post).toHaveBeenCalledTimes(2);
        expect(result.id).toBe(14);
    });

    it('should rollback uploaded images if post request fails', async () => {
        const programData = getValidProgramData();

        const mockPreviewImageResponse = { id: 100, url: 'http://example.com/preview.png', mimeType: 'image/png' };
        const mockBackgroundImageResponse = {
            id: 101,
            url: 'http://example.com/background.png',
            mimeType: 'image/png',
        };

        (ImageApi.post as jest.Mock)
            .mockResolvedValueOnce(mockPreviewImageResponse)
            .mockResolvedValueOnce(mockBackgroundImageResponse);

        mockClient.post.mockRejectedValueOnce(new Error('Server error'));

        await expect(ProgramsApi.addProgram(mockClient, programData)).rejects.toThrow('Server error');

        expect(ImageApi.delete).toHaveBeenCalledTimes(2);
        expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 100);
        expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 101);
    });

    it('should rollback section images if post request fails', async () => {
        const programData = getValidProgramData({
            previewImage: null,
            backgroundImage: null,
            sections: [
                {
                    id: undefined,
                    order: 0,
                    template: 1,
                    contents: [
                        {
                            contentType: 1,
                            order: 0,
                            title: null,
                            description: null,
                            image: createMockFile(),
                            imageId: null,
                        },
                    ],
                },
            ],
        });

        const mockSectionImageResponse = { id: 300, url: 'http://example.com/section.png', mimeType: 'image/png' };
        (ImageApi.post as jest.Mock).mockResolvedValueOnce(mockSectionImageResponse);

        mockClient.post.mockRejectedValueOnce(new Error('Database error'));

        await expect(ProgramsApi.addProgram(mockClient, programData)).rejects.toThrow('Database error');

        expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 300);
    });
});

describe('editProgram', () => {
    beforeEach(() => {
        const initialPreviewImageId = 55;
        const initialBackgroundImageId = 56;
        (ImageApi.getUpdateImageId as jest.Mock)
            .mockResolvedValueOnce({ finalImageId: 101, imageIdToDelete: initialPreviewImageId })
            .mockResolvedValueOnce({ finalImageId: 102, imageIdToDelete: initialBackgroundImageId });
    });

    it('should edit existing program with new images', async () => {
        const programData = getValidProgramData({
            id: 1,
            name: 'Updated Program',
            status: VisibilityStatus.Published,
        });

        mockClient.put.mockResolvedValueOnce({
            data: {
                ...programData,
                id: 1,
                categories: mockCategories.slice(0, 2),
            },
        });

        const result = await ProgramsApi.editProgram(programData, mockClient);

        expect(result.id).toBe(1);
        expect(result.name).toBe(programData.name);
        expect(ImageApi.getUpdateImageId).toHaveBeenCalledTimes(2);
    });

    it('should edit existing program with null images', async () => {
        const programData = getValidProgramData({
            id: 1,
            previewImage: null,
            backgroundImage: null,
        });

        mockClient.put.mockResolvedValueOnce({
            data: {
                ...programData,
                previewImage: null,
                backgroundImage: null,
            },
        });

        const result = await ProgramsApi.editProgram(programData, mockClient);

        expect(result.previewImage).toBeNull();
        expect(result.backgroundImage).toBeNull();
    });

    it('should throw error when program not found', async () => {
        const programData = getValidProgramData({ id: 999 });

        mockClient.put.mockRejectedValueOnce(new Error('Program not found'));

        await expect(ProgramsApi.editProgram(programData, mockClient)).rejects.toThrow('Program not found');
    });

    it('should delete old images when updating', async () => {
        const programData = getValidProgramData({
            id: 1,
            previewImageId: 55,
            backgroundImageId: 56,
        });

        (ImageApi.getUpdateImageId as jest.Mock)
            .mockResolvedValueOnce({ finalImageId: 101, imageIdToDelete: 55 })
            .mockResolvedValueOnce({ finalImageId: 102, imageIdToDelete: 56 });

        mockClient.put.mockResolvedValueOnce({
            data: programData,
        });

        await ProgramsApi.editProgram(programData, mockClient);

        expect(ImageApi.delete).toHaveBeenCalledTimes(2);
        expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 55);
        expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 56);
    });

    it('should edit program with section images', async () => {
        // Reset mocks after beforeEach to avoid interference
        (ImageApi.getUpdateImageId as jest.Mock).mockReset();
        (ImageApi.delete as jest.Mock).mockReset();

        const programData = getValidProgramData({
            id: 1,
            previewImage: null,
            backgroundImage: null,
            sections: [
                {
                    id: 1,
                    order: 0,
                    template: 1,
                    contents: [
                        {
                            contentType: 1,
                            order: 0,
                            title: null,
                            description: null,
                            image: createMockFile(),
                            imageId: 50,
                        },
                    ],
                },
            ],
        });

        (ImageApi.getUpdateImageId as jest.Mock)
            .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null })
            .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null })
            .mockResolvedValueOnce({ finalImageId: 150, imageIdToDelete: 50 });

        mockClient.put.mockResolvedValueOnce({
            data: programData,
        });

        await ProgramsApi.editProgram(programData, mockClient);

        expect(ImageApi.getUpdateImageId).toHaveBeenCalledTimes(3);
        expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 50);
    });

    it('should handle section images with imageId only', async () => {
        // Reset mocks after beforeEach to avoid interference
        (ImageApi.getUpdateImageId as jest.Mock).mockReset();

        const programData = getValidProgramData({
            id: 1,
            previewImage: null,
            backgroundImage: null,
            sections: [
                {
                    id: 1,
                    order: 0,
                    template: 1,
                    contents: [
                        {
                            contentType: 1,
                            order: 0,
                            title: null,
                            description: null,
                            image: null,
                            imageId: 75,
                        },
                    ],
                },
            ],
        });

        (ImageApi.getUpdateImageId as jest.Mock)
            .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null })
            .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null })
            .mockResolvedValueOnce({ finalImageId: 75, imageIdToDelete: null });

        mockClient.put.mockResolvedValueOnce({
            data: programData,
        });

        await ProgramsApi.editProgram(programData, mockClient);

        expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, null, 75);
    });

    it('should track newly created section images for rollback', async () => {
        const programData = getValidProgramData({
            id: 1,
            previewImage: null,
            backgroundImage: null,
            sections: [
                {
                    id: 1,
                    order: 0,
                    template: 1,
                    contents: [
                        {
                            contentType: 1,
                            order: 0,
                            title: null,
                            description: null,
                            image: createMockFile(),
                            imageId: null,
                        },
                    ],
                },
            ],
        });

        // Reset mocks after beforeEach to avoid interference
        (ImageApi.getUpdateImageId as jest.Mock).mockReset();
        (ImageApi.delete as jest.Mock).mockReset();

        (ImageApi.getUpdateImageId as jest.Mock)
            .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null })
            .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null })
            .mockResolvedValueOnce({ finalImageId: 400, imageIdToDelete: null });

        mockClient.put.mockRejectedValueOnce(new Error('Update failed'));

        await expect(ProgramsApi.editProgram(programData, mockClient)).rejects.toThrow('Update failed');

        expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 400);
    });
});

describe('deleteProgram', () => {
    it('should delete existing program', async () => {
        const programToDelete = mockPrograms[0];
        await ProgramsApi.deleteProgram(programToDelete.id, mockClient);

        expect(mockClient.delete).toHaveBeenCalledWith(expect.stringContaining(`/${programToDelete.id}`));
    });

    it('should throw error when program not found', async () => {
        mockClient.delete.mockRejectedValueOnce(new Error('Program not found'));

        await expect(ProgramsApi.deleteProgram(999, mockClient)).rejects.toThrow('Program not found');
    });
});

describe('addProgramCategory', () => {
    it('should add new category', async () => {
        const categoryData: ProgramCategoryCreateUpdate = {
            id: null,
            name: 'New Category',
        };
        mockClient.post.mockResolvedValueOnce({
            data: {
                id: 4,
                name: categoryData.name,
                programs: [],
            },
        });

        const result = await ProgramsCategoriesApi.addProgramCategory(categoryData, mockClient);

        expect(result.id).toBeDefined();
        expect(result.name).toBe(categoryData.name);
        expect(result.programsCount).toBe(0);
    });

    it('should add category with existing programs', async () => {
        const categoryData: ProgramCategoryCreateUpdate = {
            id: null,
            name: 'Category with Programs',
        };
        mockClient.post.mockResolvedValueOnce({
            data: {
                id: 5,
                name: categoryData.name,
                programs: [{}, {}, {}],
            },
        });

        const result = await ProgramsCategoriesApi.addProgramCategory(categoryData, mockClient);

        expect(result.id).toBe(5);
        expect(result.name).toBe(categoryData.name);
        expect(result.programsCount).toBe(3);
    });

    it('should handle API error during category creation', async () => {
        const categoryData: ProgramCategoryCreateUpdate = {
            id: null,
            name: 'Invalid Category',
        };
        mockClient.post.mockRejectedValueOnce(new Error('Category name already exists'));

        await expect(ProgramsCategoriesApi.addProgramCategory(categoryData, mockClient)).rejects.toThrow(
            'Category name already exists',
        );
    });
});

describe('editCategory', () => {
    it('should edit existing category', async () => {
        const categoryData: ProgramCategoryCreateUpdate = {
            id: 1,
            name: 'Updated Category Name',
        };
        mockClient.put.mockResolvedValueOnce({
            data: {
                id: 1,
                name: categoryData.name,
                programsCount: 2,
            },
        });

        const result = await ProgramsCategoriesApi.editProgramCategory(categoryData, mockClient);

        expect(result.id).toBe(1);
        expect(result.name).toBe(categoryData.name);
    });

    it('should throw error when category not found', async () => {
        const categoryData = { id: 999, name: 'Non-existent Category' };
        mockClient.put.mockRejectedValueOnce(new Error('Category not found'));

        await expect(ProgramsCategoriesApi.editProgramCategory(categoryData, mockClient)).rejects.toThrow(
            'Category not found',
        );
    });
});

describe('deleteCategory', () => {
    it('should delete category with zero programs', async () => {
        const categoryToDelete = mockCategories.find((c) => c.programsCount === 0)!;
        await ProgramsCategoriesApi.deleteProgramCategory(categoryToDelete.id, mockClient);

        expect(mockClient.delete).toHaveBeenCalledWith(expect.stringContaining(`/${categoryToDelete.id}`));
    });

    it('should throw error when category has programs', async () => {
        const categoryWithPrograms = mockCategories.find((c) => c.programsCount > 0)!;
        mockClient.delete.mockRejectedValueOnce(new Error('Category has at least one program'));

        await expect(ProgramsCategoriesApi.deleteProgramCategory(categoryWithPrograms.id, mockClient)).rejects.toThrow(
            'Category has at least one program',
        );
    });

    it('should throw error when category not found', async () => {
        mockClient.delete.mockRejectedValueOnce(new Error('Category not found'));

        await expect(ProgramsCategoriesApi.deleteProgramCategory(999, mockClient)).rejects.toThrow(
            'Category not found',
        );
    });
});

describe('fetchProgramSearchItems', () => {
    it('should prioritize direct name matches in sorting, then sort alphabetically', async () => {
        const programWithNameMatch: Program = {
            id: 100,
            name: 'Core Pilates Workout',
            description: 'test',
            status: VisibilityStatus.Published,
            previewImage: null,
            backgroundImage: null,
            location: 'Test Location',
            participantsCount: '10',
            meetingsCount: '5',
            categories: [{ id: 9, name: 'General', programsCount: 1 }],
            sections: [],
            slug: 'core-pilates-workout',
        };
        const programWithCategoryMatch: Program = {
            id: 101,
            name: 'Advanced Flexibility',
            description: 'test',
            status: VisibilityStatus.Published,
            previewImage: null,
            backgroundImage: null,
            location: 'Test Location',
            participantsCount: '10',
            meetingsCount: '5',
            categories: [{ id: 10, name: 'Pilates', programsCount: 1 }],
            sections: [],
            slug: 'advanced-flexibility',
        };

        mockClient.get.mockResolvedValueOnce({
            data: {
                items: [...mockPrograms, programWithNameMatch, programWithCategoryMatch],
                totalItemsCount: 5,
            },
        });

        const searchTerm = 'Pilates';
        const result = await ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, 0, 10);

        const ids = result.items.map((i) => i.id);
        const nameMatchIndex = ids.indexOf(programWithNameMatch.id);
        const categoryMatchIndex = ids.indexOf(programWithCategoryMatch.id);

        expect(nameMatchIndex).toBeGreaterThan(-1);
        expect(categoryMatchIndex).toBeGreaterThan(-1);
        expect(nameMatchIndex).toBeLessThan(categoryMatchIndex);
    });

    it('should handle pagination correctly', async () => {
        const searchTerm = 'терапія';
        const limit = 2;
        const offset = 1;

        mockClient.get.mockResolvedValueOnce({
            data: {
                items: mockPrograms,
                totalItemsCount: mockPrograms.length,
            },
        });

        const result = await ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, offset, limit);

        expect(result.items.length).toBeLessThanOrEqual(mockPrograms.length);
        expect(result.totalItemsCount).toBeGreaterThan(0);
    });

    it('should return an empty result when no matches are found', async () => {
        const searchTerm = 'NonExistentProgramXYZ';

        mockClient.get.mockResolvedValueOnce({
            data: {
                items: [],
                totalItemsCount: 0,
            },
        });

        const result = await ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, 0, 10);

        expect(result.items).toHaveLength(0);
        expect(result.totalItemsCount).toBe(0);
    });

    it('should sort matches alphabetically when match priority is the same', async () => {
        const searchTerm = 'терапія';

        const mockApiData = [
            {
                id: 1,
                name: 'Психологічна терапія',
                categories: [],
                description: 'Test',
                status: VisibilityStatus.Published,
                previewImage: null,
                backgroundImage: null,
                location: 'Test',
                participantsCount: '10',
                meetingsCount: '5',
            },
            {
                id: 2,
                name: 'Фітнес для всіх',
                categories: [{ id: 1, name: 'Реабілітаційна терапія', programsCount: 1 }],
                description: 'Test',
                status: VisibilityStatus.Published,
                previewImage: null,
                backgroundImage: null,
                location: 'Test',
                participantsCount: '10',
                meetingsCount: '5',
            },
            {
                id: 3,
                name: 'Арт-терапія',
                categories: [],
                description: 'Test',
                status: VisibilityStatus.Published,
                previewImage: null,
                backgroundImage: null,
                location: 'Test',
                participantsCount: '10',
                meetingsCount: '5',
            },
            {
                id: 4,
                name: 'Йога для спини',
                categories: [{ id: 2, name: 'Фізична терапія', programsCount: 1 }],
                description: 'Test',
                status: VisibilityStatus.Published,
                previewImage: null,
                backgroundImage: null,
                location: 'Test',
                participantsCount: '10',
                meetingsCount: '5',
            },
        ];

        const expectedOrder = ['Арт-терапія', 'Психологічна терапія', 'Йога для спини', 'Фітнес для всіх'];

        const sortedMockData = [mockApiData[2], mockApiData[0], mockApiData[3], mockApiData[1]];

        mockClient.get.mockResolvedValueOnce({
            data: {
                items: sortedMockData,
                totalItemsCount: 4,
            },
        });

        const result = await ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, 0, 10);

        const actualNames = result.items.map((item) => item.name);

        expect(actualNames).toEqual(expectedOrder);
    });

    it('should convert programs to search suggestions format correctly', async () => {
        mockClient.get.mockResolvedValueOnce({
            data: {
                items: [mockPrograms[0]],
                totalItemsCount: 1,
            },
        });

        const result = await ProgramsApi.fetchProgramSearchItems(mockClient, 'search', 0, 5);

        expect(result.items[0]).toHaveProperty('id');
        expect(result.items[0]).toHaveProperty('name');
        expect(result.items[0]).toHaveProperty('categories');
        expect(Array.isArray(result.items[0].categories)).toBe(true);
    });

    it('should pass correct API parameters including signal', async () => {
        const searchTerm = 'test search';
        const offset = 5;
        const limit = 10;
        const abortController = new AbortController();
        const signal = abortController.signal;

        mockClient.get.mockResolvedValueOnce({
            data: { items: [], totalItemsCount: 0 },
        });

        await ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm, offset, limit, signal);

        expect(mockClient.get).toHaveBeenCalledWith(
            `${API_ROUTES.PROGRAMS.SEARCH}`,
            expect.objectContaining({
                params: {
                    SearchQuery: searchTerm,
                    offset,
                    limit,
                },
                signal,
            }),
        );
    });

    it('should use default values for offset and limit', async () => {
        const searchTerm = 'test';

        mockClient.get.mockResolvedValueOnce({
            data: { items: [], totalItemsCount: 0 },
        });

        await ProgramsApi.fetchProgramSearchItems(mockClient, searchTerm);

        expect(mockClient.get).toHaveBeenCalledWith(
            `${API_ROUTES.PROGRAMS.SEARCH}`,
            expect.objectContaining({
                params: expect.objectContaining({
                    offset: 0,
                    limit: 5,
                }),
            }),
        );
    });
});

describe('API Error and Cancellation Handling', () => {
    it('should reject fetchPrograms with error if the request is cancelled', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Request was cancelled'));

        await expect(ProgramsApi.fetchPrograms(mockClient, 1, 0, 10, undefined)).rejects.toThrow(
            'Request was cancelled',
        );
    });

    it('should reject fetchProgramSearchItems with error if the request is cancelled', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Request was cancelled'));

        await expect(ProgramsApi.fetchProgramSearchItems(mockClient, 'search', 0, 10)).rejects.toThrow(
            'Request was cancelled',
        );
    });

    it('should handle a pre-aborted signal correctly', async () => {
        mockClient.get.mockRejectedValueOnce(new Error('Request was cancelled'));

        await expect(ProgramsApi.fetchProgramById(1, mockClient)).rejects.toThrow('Request was cancelled');
    });
});
