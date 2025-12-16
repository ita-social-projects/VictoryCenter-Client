import { TranslationStatus } from './common/translation-status';

export type TeamMemberLocalizationDto = {
    entityId: number;
    localizationInfoDto: {
        id: number;
        code: string;
    };
    fullName: string;
    description?: string | null;
    translationStatus: TranslationStatus;
};

export type CreateTeamMemberLocalizationDto = {
    entityId: number;
    languageId: number;
    fullName: string;
    description?: string | null;
};
