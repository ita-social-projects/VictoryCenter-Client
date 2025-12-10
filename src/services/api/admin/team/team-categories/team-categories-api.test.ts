import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { TeamCategory, TeamCategoryCreateUpdate } from '@/types/admin/team-category';
import { TeamCategoriesApi } from './team-categories-api';

describe('TeamCategoriesApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getAll should call GET and return data', async () => {
        const mockCategories: TeamCategory[] = [
            { id: 1, name: 'Category 1', description: 'Description 1', teamMembersCount: 1 },
            { id: 2, name: 'Category 2', description: 'Description 2', teamMembersCount: 2 },
        ];
        mockClient.get.mockResolvedValueOnce({ data: mockCategories });
        const result = await TeamCategoriesApi.getAll(mockClient);
        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.TEAM_CATEGORIES.BASE);
        expect(result).toEqual(mockCategories);
    });

    it('create should call POST with correct payload and return data', async () => {
        const newCategory: TeamCategoryCreateUpdate = {
            id: null,
            name: 'New Category',
            description: 'New Description',
        };
        const createdCategory: TeamCategory = { ...newCategory, id: 3, teamMembersCount: 0 };
        mockClient.post.mockResolvedValueOnce({ data: createdCategory });
        const result = await TeamCategoriesApi.create(mockClient, newCategory);
        expect(mockClient.post).toHaveBeenCalledWith(
            API_ROUTES.TEAM_CATEGORIES.BASE,
            expect.objectContaining({ name: 'New Category', description: 'New Description' }),
        );
        expect(result).toEqual(createdCategory);
    });

    it('update should call PUT with correct payload and return data', async () => {
        const updatedCategory: TeamCategoryCreateUpdate = {
            id: 2,
            name: 'Updated Category',
            description: 'Updated Description',
        };
        const returnedCategory: TeamCategory = {
            ...(updatedCategory as Omit<TeamCategory, 'teamMembersCount'>),
            teamMembersCount: 5,
        };
        mockClient.put.mockResolvedValueOnce({ data: returnedCategory });
        const result = await TeamCategoriesApi.update(mockClient, updatedCategory);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.TEAM_CATEGORIES.BASE}/2`,
            expect.objectContaining({ name: 'Updated Category', description: 'Updated Description' }),
        );
        expect(result).toEqual(returnedCategory);
    });

    it('update should throw error if id is null', async () => {
        const invalidCategory: TeamCategoryCreateUpdate = { id: null, name: 'Invalid', description: 'Invalid' };
        await expect(TeamCategoriesApi.update(mockClient, invalidCategory)).rejects.toThrow(
            'TeamCategoriesApi.update: category.id is required',
        );
        expect(mockClient.put).not.toHaveBeenCalled();
    });

    it('delete should call DELETE with correct id', async () => {
        mockClient.delete.mockResolvedValueOnce({});
        await TeamCategoriesApi.delete(mockClient, 4);
        expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.TEAM_CATEGORIES.BASE}/4`);
    });
});
