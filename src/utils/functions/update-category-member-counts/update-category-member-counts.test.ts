import { updateCategoryMemberCounts } from './update-category-member-counts';
import { TeamCategory } from '@/types/admin/team-category';
import { TeamMember } from '@/types/admin/team-members';

describe('updateCategoryMemberCounts', () => {
    const mockCategories: TeamCategory[] = [
        { id: 1, name: 'Category 1', description: 'Description 1', localizations: [], teamMembersCount: 5 },
        { id: 2, name: 'Category 2', description: 'Description 2', localizations: [], teamMembersCount: 3 },
        { id: 3, name: 'Category 3', description: 'Description 3', localizations: [], teamMembersCount: 7 },
    ];

    const mockMember: TeamMember = {
        id: 1,
        image: null,
        fullName: 'John Doe',
        description: 'Test member',
        status: 1,
        categoryId: 2,
        localizations: [],
    };

    it('should decrement the selected category member count by 1', () => {
        const result = updateCategoryMemberCounts(mockCategories, 1, mockMember);

        const selectedCategory = result.find((cat) => cat.id === 1);
        expect(selectedCategory?.teamMembersCount).toBe(4);
    });

    it('should increment the target category member count by 1', () => {
        const result = updateCategoryMemberCounts(mockCategories, 1, mockMember);

        const targetCategory = result.find((cat) => cat.id === mockMember.categoryId);
        expect(targetCategory?.teamMembersCount).toBe(4);
    });

    it('should keep other categories unchanged', () => {
        const result = updateCategoryMemberCounts(mockCategories, 1, mockMember);

        const otherCategory = result.find((cat) => cat.id === 3);
        expect(otherCategory?.teamMembersCount).toBe(7);
    });
});
