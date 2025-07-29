import default_team_member_photo from '../../../../assets/images/public/team-page/team_member_not_found_photo.svg';
import { API_ROUTES } from '../../../../const/urls/main-api';
import {
    Member,
    PublicCategoryWithTeamMembersDto,
    PublicTeamMemberDto,
    TeamItem,
    TeamPageData,
} from '../../../../types/public/team-page';
import { axiosInstance } from '../../axios';

const isValidCategory = (category: PublicCategoryWithTeamMembersDto): boolean => {
    return Boolean(
        category?.categoryName?.trim() && Array.isArray(category.teamMembers) && category.teamMembers.length > 0,
    );
};

const isValidTeamMember = (member: PublicTeamMemberDto): boolean => {
    return Boolean(member?.fullName?.trim());
};

const mapTeamMemberDtoToTeamMember = (dto: PublicTeamMemberDto): Member => ({
    id: dto.id,
    name: dto.fullName,
    role: dto.description || '',
    photo: default_team_member_photo,
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
