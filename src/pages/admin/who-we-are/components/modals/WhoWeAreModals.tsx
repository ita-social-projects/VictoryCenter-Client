import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';
import { WhoWeAreSection } from '@/types/admin/who-we-are';
import { LocalizationLanguage } from '@/types/common/language';
import { TranslateWhoWeAreModal } from './translate-modal/TranslateWhoWeAreModal';

export interface WhoWeAreModalsProps {
    modalsStateControl: UseModalsStateResult<WhoWeAreSection>;
    translatedLanguages: LocalizationLanguage[];
    onTranslateWhoWeAreSection: (translatedSection: WhoWeAreSection) => void;
}

export const WhoWeAreModals = ({
    modalsStateControl,
    translatedLanguages,
    onTranslateWhoWeAreSection,
}: WhoWeAreModalsProps) => {
    const { modalState, closeModalActions } = modalsStateControl;

    const isEditTranslation = !!modalState.itemToEditTranslation;
    const activeSection = modalState.itemToEditTranslation ?? modalState.itemToTranslate;
    const isOpen = !!activeSection;

    const handleClose = isEditTranslation
        ? closeModalActions.closeEditTranslationModal
        : closeModalActions.closeTranslateItemModal;

    return (
        <>
            <TranslateWhoWeAreModal
                isOpen={isOpen}
                onClose={handleClose}
                sectionToTranslate={activeSection}
                onTranslateSection={onTranslateWhoWeAreSection}
                translatedLanguages={translatedLanguages}                
            />
        </>
    );
};
