import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    PublicCategoryWithTeamMembersDto,
    PublicTeamMemberDto,
    MemberCard,
    TeamItem,
    TeamPageData,
} from '@/types/public/team-page';
import { axiosInstance } from '@/services/api/axios';

const isValidCategory = (category: PublicCategoryWithTeamMembersDto): boolean => {
    return Boolean(
        category?.categoryName?.trim() && Array.isArray(category.teamMembers) && category.teamMembers.length > 0,
    );
};

const isValidTeamMember = (member: PublicTeamMemberDto): boolean => {
    return Boolean(member?.fullName?.trim());
};

const mapTeamMemberDtoToTeamMember = (dto: PublicTeamMemberDto): MemberCard => ({
    id: dto.id,
    name: dto.fullName,
    role: dto.description || '',
    photo: dto.image?.url ?? null,
});

const mapCategoryDtoToTeamCategory = (dto: PublicCategoryWithTeamMembersDto): TeamItem => {
    const validMembers = dto.teamMembers.filter(isValidTeamMember).map(mapTeamMemberDtoToTeamMember);

    return {
        title: dto.categoryName,
        description: dto.description || '',
        members: validMembers,
    };
};

export const teamPageDataFetch = async (): Promise<TeamPageData> => {
    const response = await axiosInstance.get<PublicCategoryWithTeamMembersDto[]>(API_ROUTES.TEAM.PUBLISHED);

    const teamCategories = response.data
        .filter(isValidCategory)
        .map(mapCategoryDtoToTeamCategory)
        .filter((category) => category.members.length > 0);

    return { teamData: teamCategories };
};
