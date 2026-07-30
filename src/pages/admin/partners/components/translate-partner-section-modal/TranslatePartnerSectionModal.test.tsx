import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PartnerSection, PartnerSectionLocalizationDto } from '@/types/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import { useTranslatePartnerSection } from '@/hooks/admin/use-translate-partner-section/useTranslatePartnerSection';
import { TranslatePartnerSectionModal } from './TranslatePartnerSectionModal';

let mockFormIsValid = true;
let mockFormIsDirty = true;

const mockTranslateSection = jest.fn();

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: (props: unknown) => require('@/utils/test-mocks/test-mocks').MockLocalizationModal(props),
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({ selectedLanguage, languages, onLanguageChange, isSubmitting }: any) => (
        <div data-testid="translation-controls">
            <span data-testid="selected-language">{selectedLanguage?.code ?? 'none'}</span>
            <span data-testid="is-submitting">{String(isSubmitting)}</span>
            <button
                data-testid="choose-last-language"
                onClick={() => onLanguageChange?.(languages?.[languages.length - 1] ?? null)}
            >
                choose last language
            </button>
        </div>
    ),
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => <div data-testid={`inline-loader-${size}`} />,
}));

jest.mock('../translate-partner-section-form/TranslatePartnerSectionForm', () => {
    const React = require('react');

    return {
        TranslatePartnerSectionForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange, initialData, formDisabled }: any, ref: React.Ref<any>) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () =>
                        onSubmit({
                            title: 'Translated section title',
                            description: 'Translated section description',
                            partners: initialData.partners,
                        }),
                    isValid: () => mockFormIsValid,
                    isDirty: () => mockFormIsDirty,
                }));

                React.useEffect(() => {
                    onValidationChange?.(true);
                    onDirtyChange?.(mockFormIsDirty);
                }, [onValidationChange, onDirtyChange]);

                return (
                    <div
                        data-testid="translate-partner-section-form"
                        data-initial={JSON.stringify(initialData)}
                        data-disabled={String(Boolean(formDisabled))}
                    />
                );
            },
        ),
    };
});

jest.mock('@/hooks/admin/use-translate-partner-section/useTranslatePartnerSection', () => ({
    useTranslatePartnerSection: jest.fn(() => ({
        translateSection: mockTranslateSection,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
        isEditMode: false,
        existingTranslation: null,
        isLoadingTranslation: false,
        translationFetchError: '',
    })),
}));

const mockUseTranslatePartnerSection = jest.mocked(useTranslatePartnerSection);

const UK_LANGUAGE: LocalizationLanguage = { id: 1, code: 'uk', name: 'Ukrainian' };
const EN_LANGUAGE: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };
const PL_LANGUAGE: LocalizationLanguage = { id: 3, code: 'pl', name: 'Polish' };

const SECTION: PartnerSection = {
    id: 10,
    title: 'Section title',
    description: 'Section description',
    partners: [
        { id: 5, description: 'Partner 1', image: null, imageId: null },
        { id: 6, description: 'Partner 2', image: null, imageId: null },
    ],
    localizations: [],
};

const EXISTING_TRANSLATION: PartnerSectionLocalizationDto = {
    entityId: 10,
    title: 'Section title EN',
    description: 'Section description EN',
    partners: [{ partnerId: 5, description: 'Partner 1 EN' }],
    localizationInfoDto: { id: EN_LANGUAGE.id, code: EN_LANGUAGE.code },
    translationStatus: 1,
};

const defaultHookReturn = () => ({
    translateSection: mockTranslateSection,
    isSubmitting: false,
    error: '',
    clearError: jest.fn(),
    isEditMode: false,
    existingTranslation: null as PartnerSectionLocalizationDto | null,
    isLoadingTranslation: false,
    translationFetchError: '',
});

describe('TranslatePartnerSectionModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslatePartnerSectionModal>> = {}) => {
        const defaultProps: React.ComponentProps<typeof TranslatePartnerSectionModal> = {
            isOpen: true,
            onClose: jest.fn(),
            section: SECTION,
            translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE],
            onTranslated: jest.fn(),
        };

        return render(<TranslatePartnerSectionModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormIsValid = true;
        mockFormIsDirty = true;

        mockTranslateSection.mockResolvedValue(undefined);
        mockUseTranslatePartnerSection.mockReturnValue(defaultHookReturn());
    });

    it('returns null when section is null', () => {
        renderModal({ section: null });

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('uses first non-default language as selected language by default', () => {
        renderModal({ translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE, PL_LANGUAGE] });

        expect(screen.getByTestId('selected-language')).toHaveTextContent('en');
    });

    it('falls back to first language when only default locale exists', () => {
        renderModal({ translatedLanguages: [UK_LANGUAGE] });

        expect(screen.getByTestId('selected-language')).toHaveTextContent('uk');
    });

    it('selects a language once it arrives after the modal has already mounted with no languages', () => {
        const { rerender } = render(
            <TranslatePartnerSectionModal
                isOpen={true}
                onClose={jest.fn()}
                section={SECTION}
                translatedLanguages={[]}
                onTranslated={jest.fn()}
            />,
        );

        expect(screen.getByTestId('selected-language')).toHaveTextContent('none');

        rerender(
            <TranslatePartnerSectionModal
                isOpen={true}
                onClose={jest.fn()}
                section={SECTION}
                translatedLanguages={[UK_LANGUAGE, EN_LANGUAGE]}
                onTranslated={jest.fn()}
            />,
        );

        expect(screen.getByTestId('selected-language')).toHaveTextContent('en');
    });

    it('shows a loader while the translation is being fetched', () => {
        mockUseTranslatePartnerSection.mockReturnValue({
            ...defaultHookReturn(),
            isLoadingTranslation: true,
        });

        renderModal();

        expect(screen.getByTestId('inline-loader-2')).toBeInTheDocument();
        expect(screen.queryByTestId('translate-partner-section-form')).not.toBeInTheDocument();
    });

    it('shows Add mode title and empty rows when no translation exists yet', () => {
        mockUseTranslatePartnerSection.mockReturnValue({
            ...defaultHookReturn(),
            isEditMode: false,
            existingTranslation: null,
        });

        renderModal();

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );

        const initial = JSON.parse(screen.getByTestId('translate-partner-section-form').getAttribute('data-initial')!);
        expect(initial).toEqual({
            title: '',
            description: '',
            partners: [
                { partnerId: 5, description: '' },
                { partnerId: 6, description: '' },
            ],
        });
    });

    it('shows Edit mode and pre-fills from the existing translation, defaulting untranslated partners to empty', () => {
        mockUseTranslatePartnerSection.mockReturnValue({
            ...defaultHookReturn(),
            isEditMode: true,
            existingTranslation: EXISTING_TRANSLATION,
        });

        renderModal();

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );

        const initial = JSON.parse(screen.getByTestId('translate-partner-section-form').getAttribute('data-initial')!);
        expect(initial).toEqual({
            title: 'Section title EN',
            description: 'Section description EN',
            partners: [
                { partnerId: 5, description: 'Partner 1 EN' },
                { partnerId: 6, description: '' },
            ],
        });
    });

    it('submits translation and executes success callback flow', async () => {
        const onTranslated = jest.fn();
        const onClose = jest.fn();

        mockTranslateSection.mockImplementation(async () => {
            onTranslated();
            onClose();
        });

        renderModal({ onTranslated, onClose });

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockTranslateSection).toHaveBeenCalled();
        });

        expect(onTranslated).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not submit when form is invalid', () => {
        mockFormIsValid = false;
        renderModal();

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        expect(mockTranslateSection).not.toHaveBeenCalled();
    });

    it('shows confirmation modal when closing dirty form and closes immediately for clean form', () => {
        const onClose = jest.fn();

        mockFormIsDirty = true;
        const { rerender } = render(
            <TranslatePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                section={SECTION}
                translatedLanguages={[UK_LANGUAGE, EN_LANGUAGE]}
                onTranslated={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();

        mockFormIsDirty = false;
        rerender(
            <TranslatePartnerSectionModal
                isOpen={true}
                onClose={onClose}
                section={SECTION}
                translatedLanguages={[UK_LANGUAGE, EN_LANGUAGE]}
                onTranslated={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders translate error and translation fetch error messages', () => {
        mockUseTranslatePartnerSection.mockReturnValue({
            ...defaultHookReturn(),
            error: 'Translate failed',
            translationFetchError: 'Fetch failed',
        });

        renderModal();

        expect(screen.getByText('Translate failed')).toBeInTheDocument();
        expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });

    it('changes language through translation controls', async () => {
        renderModal({ translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE, PL_LANGUAGE] });

        fireEvent.click(screen.getByTestId('choose-last-language'));

        await waitFor(() => {
            expect(screen.getByTestId('selected-language')).toHaveTextContent('pl');
        });
    });
});
