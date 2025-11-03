import { LocalizationLanguage } from './languages';

export type TeamMemberLocalization = {
    id: number;
    fullName: string;
    description: string;
    teamMemberId: number;
    localizationLanguage: LocalizationLanguage;
};

export interface TeamMemberLocalizationCreateRequest {
    fullName: string;
    description: string;
    teamMemberId: number;
    languageId: number;
}

export interface TeamMemberLocalizationUpdateRequest {
    id: number | null;
    fullName: string;
    description: string;
}
