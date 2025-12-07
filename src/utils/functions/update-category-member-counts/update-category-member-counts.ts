import { TeamCategory } from '@app-types/admin/team-category';
import { TeamMember } from '@app-types/admin/team-members';

export const updateCategoryMemberCounts = (
    prevCategories: TeamCategory[],
    selectedCategoryId: number,
    updatedMember: TeamMember,
): TeamCategory[] => {
    return prevCategories.map((category) => {
        if (category.id === selectedCategoryId) {
            return { ...category, teamMembersCount: category.teamMembersCount - 1 };
        } else if (category.id === updatedMember.categoryId) {
            return { ...category, teamMembersCount: category.teamMembersCount + 1 };
        }
        return category;
    });
};
