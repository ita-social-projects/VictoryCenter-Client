import { TeamCategoryDto } from '@/types/admin/team-category';
import { TranslationStatus } from '@/types/common/language';
import { mapTeamCategoryDtoToTeamCategory } from './team-category-mappers';

describe('mapTeamCategoryDtoToModel', () => {
    it('should correctly map all fields from DTO to Model', () => {
        const mockDto: TeamCategoryDto = {
            id: 1,
            name: 'Розробники',
            description: 'Опис для розробників українською',
            teamMembersCount: 10,
            localizations: [
                {
                    entityId: 1,
                    name: 'Engineering',
                    localizationInfoDto: {
                        id: 1,
                        code: 'en',
                    },
                    translationStatus: TranslationStatus.Relevant,
                    description: 'New description for category',
                },
            ],
        };

        const result = mapTeamCategoryDtoToTeamCategory(mockDto);

        expect(result.id).toBe(mockDto.id);
        expect(result.name).toBe(mockDto.name);
        expect(result.description).toBe(mockDto.description);
        expect(result.teamMembersCount).toBe(mockDto.teamMembersCount);
        expect(result.localizations).toHaveLength(1);
    });
    it('should handle empty localizations array', () => {
        const mockDto: TeamCategoryDto = {
            id: 21,
            name: 'Empty',
            description: 'No localizations',
            teamMembersCount: 0,
            localizations: [],
        };

        const result = mapTeamCategoryDtoToTeamCategory(mockDto);

        expect(result.localizations).toEqual([]);
    });
});
