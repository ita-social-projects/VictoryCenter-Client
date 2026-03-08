import { useEffect, useMemo, useRef, useState } from 'react';
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
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';

interface TranslateTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberToTranslate: TeamMember | null;
    onTranslateMember: (member: TeamMember) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateTeamMemberModal = ({
    isOpen,
    onClose,
    memberToTranslate,
    onTranslateMember,
    translatedLanguages,
}: TranslateTeamMemberModalProps) => {
    const formRef = useRef<TranslateTeamMemberFormRef>(null);

    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(translatedLanguages?.[0] ?? null);

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!memberToTranslate?.localizations || !language) return null;
        return memberToTranslate?.localizations?.find((loc) => loc.language.id === language?.id);
    }, [memberToTranslate?.localizations, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
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
        language: language!,
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
            isDirty={isDirty}
        >
            <TranslationControls
                selectedLanguage={language}
                isSubmitting={isSubmitting}
                languages={translatedLanguages}
                onLanguageChange={setLanguage}
            />
            {error && <div className="translate-member-error">{error}</div>}

            <TranslateMemberForm
                key={language?.id}
                ref={formRef}
                onSubmit={handleFormSubmit}
                initialData={initialData}
                onValidationChange={setIsFormValid}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
