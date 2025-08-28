import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import {
    PublicCategoryWithTeamMembersDto,
    PublicTeamMemberDto,
    MemberCard,
    TeamItem,
    TeamPageData,
} from '../../../../types/public/team-page';
import { mapImageToBase64 } from '../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';
import { axiosInstance } from '../../axios';

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
    photo: mapImageToBase64(dto.image),
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
