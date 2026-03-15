import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WhoWeAreModals } from './WhoWeAreModals';
import { SectionType, ContentType } from '@/types/common/about-us';
import { WhoWeAreSection } from '@/types/admin/who-we-are';
import { LocalizationLanguage } from '@/types/common/language';
import { UseModalsStateResult } from '@/hooks/admin/use-modals-state/useModalsState';

const mockTranslateWhoWeAreModal = jest.fn();

jest.mock('./translate-modal/TranslateWhoWeAreModal', () => ({
    TranslateWhoWeAreModal: (props: unknown) => {
        mockTranslateWhoWeAreModal(props);
        return null;
    },
}));

const translatedLanguages: LocalizationLanguage[] = [
    { id: 1, code: 'en', name: 'English' },
    { id: 2, code: 'uk', name: 'Ukrainian' },
];

const buildSection = (id: number): WhoWeAreSection => ({
    id,
    title: `Section ${id}`,
    sectionType: SectionType.Main,
    contents: [
        {
            id: id * 100,
            contentType: ContentType.Description,
            title: null,
            description: 'Some description',
            image: null,
            imageId: null,
            localizations: [],
        },
    ],
});

const buildModalsStateControl = (
    overrides: Partial<UseModalsStateResult<WhoWeAreSection>['modalState']>,
): UseModalsStateResult<WhoWeAreSection> => ({
    modalState: {
        isAddModalOpen: false,
        itemToDelete: null,
        itemToEdit: null,
        itemToTranslate: null,
        itemToEditTranslation: null,
        isAddCategoryModalOpen: false,
        isEditCategoryModalOpen: false,
        isDeleteCategoryModalOpen: false,
        isCategoryToTranslate: false,
        isCategoryToEditTranslation: false,
        isAddSectionModalOpen: false,
        ...overrides,
    },
    closeModalActions: {
        closeAddItemModal: jest.fn(),
        closeEditItemModal: jest.fn(),
        closeDeleteItemModal: jest.fn(),
        closeAddCategoryModal: jest.fn(),
        closeEditCategoryModal: jest.fn(),
        closeTranslateItemModal: jest.fn(),
        closeEditTranslationModal: jest.fn(),
        closeDeleteCategoryModal: jest.fn(),
        closeAddSectionModal: jest.fn(),
        closeTranslateCategoryModal: jest.fn(),
        closeEditCategoryTranslationModal: jest.fn(),
    },
    openModalActions: {
        openAddItemModal: jest.fn(),
        openEditItemModal: jest.fn(),
        openDeleteItemModal: jest.fn(),
        openTranslateItemModal: jest.fn(),
        openEditTranslationModal: jest.fn(),
        openAddCategoryModal: jest.fn(),
        openEditCategoryModal: jest.fn(),
        openDeleteCategoryModal: jest.fn(),
        openTranslateCategoryModal: jest.fn(),
        openEditCategoryTranslationModal: jest.fn(),
        openAddSectionModal: jest.fn(),
    },
    isAnyModalOpened: false,
});

describe('WhoWeAreModals', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('passes itemToTranslate and closeTranslateItemModal for add translation flow', () => {
        const translateSection = buildSection(1);
        const modalsStateControl = buildModalsStateControl({
            itemToTranslate: translateSection,
        });

        render(
            <WhoWeAreModals
                modalsStateControl={modalsStateControl}
                translatedLanguages={translatedLanguages}
                onTranslateWhoWeAreSection={jest.fn()}
            />,
        );

        expect(mockTranslateWhoWeAreModal).toHaveBeenCalledTimes(1);

        const modalProps = mockTranslateWhoWeAreModal.mock.calls[0][0] as {
            isOpen: boolean;
            onClose: () => void;
            sectionToTranslate: WhoWeAreSection | null;
            translatedLanguages: LocalizationLanguage[];
        };

        expect(modalProps.isOpen).toBe(true);
        expect(modalProps.sectionToTranslate).toEqual(translateSection);
        expect(modalProps.translatedLanguages).toEqual(translatedLanguages);

        modalProps.onClose();
        expect(modalsStateControl.closeModalActions.closeTranslateItemModal).toHaveBeenCalledTimes(1);
        expect(modalsStateControl.closeModalActions.closeEditTranslationModal).not.toHaveBeenCalled();
    });

    it('prioritizes edit translation section and uses closeEditTranslationModal', () => {
        const translateSection = buildSection(1);
        const editSection = buildSection(2);
        const modalsStateControl = buildModalsStateControl({
            itemToTranslate: translateSection,
            itemToEditTranslation: editSection,
        });

        render(
            <WhoWeAreModals
                modalsStateControl={modalsStateControl}
                translatedLanguages={translatedLanguages}
                onTranslateWhoWeAreSection={jest.fn()}
            />,
        );

        const modalProps = mockTranslateWhoWeAreModal.mock.calls[0][0] as {
            isOpen: boolean;
            onClose: () => void;
            sectionToTranslate: WhoWeAreSection | null;
        };

        expect(modalProps.isOpen).toBe(true);
        expect(modalProps.sectionToTranslate).toEqual(editSection);

        modalProps.onClose();
        expect(modalsStateControl.closeModalActions.closeEditTranslationModal).toHaveBeenCalledTimes(1);
        expect(modalsStateControl.closeModalActions.closeTranslateItemModal).not.toHaveBeenCalled();
    });

    it('keeps translate modal closed when there is no active section', () => {
        const modalsStateControl = buildModalsStateControl({});

        render(
            <WhoWeAreModals
                modalsStateControl={modalsStateControl}
                translatedLanguages={translatedLanguages}
                onTranslateWhoWeAreSection={jest.fn()}
            />,
        );

        const modalProps = mockTranslateWhoWeAreModal.mock.calls[0][0] as {
            isOpen: boolean;
            sectionToTranslate: WhoWeAreSection | null;
        };

        expect(modalProps.isOpen).toBe(false);
        expect(modalProps.sectionToTranslate).toBeNull();
    });
});
