import { useMemo, useRef, useState } from 'react';
import {
    TranslateMemberForm,
    TranslateTeamMemberFormRef,
    TranslateTeamMemberFormValues,
} from '../translate-member-form/TranslateMemberForm';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal'; // Импорт новой обертки
import { useTranslateTeamMember } from '@/hooks/admin/use-translate-team-member/useTranslateTeamMember';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TeamMember } from '@/types/admin/team-members';
import { LocalizationLanguage } from '@/types/common/language';
import { ModalMode } from '@/types/admin/common';

interface TranslateTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberToTranslate: TeamMember | null;
    onTranslateMember: (member: TeamMember) => void;
    language: LocalizationLanguage;
    mode: ModalMode;
}

export const TranslateTeamMemberModal = ({
    isOpen,
    onClose,
    memberToTranslate,
    onTranslateMember,
    language,
    mode,
}: TranslateTeamMemberModalProps) => {
    const formRef = useRef<TranslateTeamMemberFormRef>(null);

    const [isFormValid, setIsFormValid] = useState(false);

    const existingLocalization = useMemo(() => {
        return memberToTranslate?.localizations?.find((loc) => loc.language.id === language.id);
    }, [memberToTranslate?.localizations, language.id]);

    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslateTeamMemberFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            fullName: existingLocalization.fullName,
            description: existingLocalization.description,
        };
    }, [existingLocalization, isEditMode]);

    const { translateMember, isSubmitting, error } = useTranslateTeamMember({
        member: memberToTranslate,
        language,
        onSuccess: (updatedMember) => {
            onTranslateMember(updatedMember);
            onClose();
        },
        mode,
    });

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslateTeamMemberFormValues) => {
        await translateMember(data);
    };

    if (!memberToTranslate) return null;

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            onSave={handleSaveClick}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
        >
            {error && <div className="translate-member-error">{error}</div>}

            <TranslateMemberForm
                ref={formRef}
                onSubmit={handleFormSubmit}
                initialData={initialData}
                onValidationChange={setIsFormValid}
            />
        </LocalizationModal>
    );
};
