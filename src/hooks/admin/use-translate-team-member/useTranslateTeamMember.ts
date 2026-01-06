import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import { TranslateTeamMemberFormValues } from '@/pages/admin/team/components/translate-member-form/TranslateMemberForm';
import { TeamMemberLocalizationsApi } from '@/services/api/admin/team/team-member-localizations/team-member-localizations-api';
import { TeamMember, TeamMemberLocalization } from '@/types/admin/team-members';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { useState } from 'react';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { ModalMode } from '@/types/admin/common';

interface UseTranslateTeamMemberParams {
    member: TeamMember | null;
    language: LocalizationLanguage;
    onSuccess: (updatedMember: TeamMember) => void;
    mode: ModalMode;
}

export const useTranslateTeamMember = ({ member, language, onSuccess, mode }: UseTranslateTeamMemberParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateMember = async (data: TranslateTeamMemberFormValues) => {
        if (!member) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await TeamMemberLocalizationsApi.update(client, member.id, language.id, {
                    fullName: data.fullName,
                    description: data.description,
                });

                const updatedLocalization = mapLocalizationDtoToModel<
                    typeof updatedLocalizationDto,
                    TeamMemberLocalization
                >(updatedLocalizationDto);

                const updatedMember: TeamMember = {
                    ...member,
                    localizations:
                        member.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };

                onSuccess(updatedMember);
            } else {
                const createdLocalizationDto = await TeamMemberLocalizationsApi.create(client, {
                    entityId: member.id,
                    languageId: language.id,
                    fullName: data.fullName,
                    description: data.description,
                });

                const createdLocalization = mapLocalizationDtoToModel<
                    typeof createdLocalizationDto,
                    TeamMemberLocalization
                >(createdLocalizationDto);

                const updatedMember: TeamMember = {
                    ...member,
                    localizations: [...(member.localizations || []), createdLocalization],
                };

                onSuccess(updatedMember);
            }
        } catch (err) {
            const errorMessage = isEditMode
                ? TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_TRANSLATION
                : TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE_MEMBER;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateMember,
        isSubmitting,
        error,
        clearError,
    };
};
