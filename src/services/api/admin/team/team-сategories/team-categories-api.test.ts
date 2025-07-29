import { AxiosInstance } from 'axios';
import { TeamCategory, TeamCategoryDto } from '../../../../../types/admin/team-members';
import { mapTeamCategoryDtoToTeamCategory, TeamCategoriesApi } from './team-categories-api';

describe('mapTeamCategoryDtoToTeamCategory', () => {
    it('should correctly map DTO to TeamCategory', () => {
        const dto: TeamCategoryDto = {
            id: 1,
            name: 'Main Team',
            description: 'Description here',
        };

        const expected: TeamCategory = {
            id: 1,
            name: 'Main Team',
            description: 'Description here',
        };

        const result = mapTeamCategoryDtoToTeamCategory(dto);

        expect(result).toEqual(expected);
    });
});

describe('TeamCategoriesApi.getAll', () => {
    it('should fetch and map all team categories', async () => {
        const mockClient = {
            get: jest.fn().mockResolvedValue({
                data: [
                    { id: 1, name: 'A', description: 'Desc A' },
                    { id: 2, name: 'B', description: 'Desc B' },
                ],
            }),
        } as unknown as AxiosInstance;

        const result = await TeamCategoriesApi.getAll(mockClient);

        expect(mockClient.get).toHaveBeenCalledWith('/Categories');
        expect(result).toEqual([
            { id: 1, name: 'A', description: 'Desc A' },
            { id: 2, name: 'B', description: 'Desc B' },
        ]);
    });
});
