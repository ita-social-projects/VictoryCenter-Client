import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ModalMode } from '@/types/admin/common';
import { TeamCategory } from '@/types/admin/team-category';
import { TranslationStatus, LocalizationLanguage } from '@/types/common/language';
import { useTranslateTeamCategory } from '@/hooks/admin/use-translate-team-category/useTranslateTeamCategory';
import { TranslateTeamCategoryModal } from './TranslateTeamCategoryModal';

let mockFormIsValid = true;
let mockFormIsDirty = true;
let mockAutoSelectCategoryIndex = 0;

const mockTranslateTeamCategory = jest.fn();

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: (props: unknown) => require('@/utils/test-mocks/test-mocks').MockLocalizationModal(props),
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({ selectedLanguage, languages, onLanguageChange, isSubmitting }: any) => (
        <div data-testid="translation-controls">
            <span data-testid="selected-language">{selectedLanguage?.code ?? 'none'}</span>
            <span data-testid="is-submitting">{String(isSubmitting)}</span>
            <span data-testid="languages-count">{String(languages?.length ?? 0)}</span>
            <button
                data-testid="choose-last-language"
                onClick={() => onLanguageChange?.(languages?.[languages.length - 1] ?? null)}
            >
                choose last language
            </button>
        </div>
    ),
}));

jest.mock('../translate-team-category-form/TranslateTeamCategoryForm', () => {
    const React = require('react');

    return {
        TranslateTeamCategoryForm: React.forwardRef(
            (
                {
                    onSubmit,
                    onValidationChange,
                    onDirtyChange,
                    onCategoryChange,
                    categories,
                    initialData,
                    formDisabled,
                }: any,
                ref: React.Ref<any>,
            ) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () =>
                        onSubmit({
                            name: 'Translated category name',
                            description: 'Translated category description',
                        }),
                    isValid: () => mockFormIsValid,
                    isDirty: () => mockFormIsDirty,
                }));

                React.useEffect(() => {
                    onValidationChange?.(true);
                    onDirtyChange?.(mockFormIsDirty);

                    const selectedCategory =
                        mockAutoSelectCategoryIndex >= 0 ? (categories?.[mockAutoSelectCategoryIndex] ?? null) : null;
                    onCategoryChange?.(selectedCategory);
                }, [onValidationChange, onDirtyChange, onCategoryChange, categories]);

                return (
                    <div
                        data-testid="translate-team-category-form"
                        data-initial={initialData ? JSON.stringify(initialData) : 'null'}
                        data-disabled={String(Boolean(formDisabled))}
                        data-categories={String(categories?.length ?? 0)}
                    />
                );
            },
        ),
    };
});

jest.mock('@/hooks/admin/use-translate-team-category/useTranslateTeamCategory', () => ({
    useTranslateTeamCategory: jest.fn(() => ({
        translateTeamCategory: mockTranslateTeamCategory,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateTeamCategory = jest.mocked(useTranslateTeamCategory);

const UK_LANGUAGE: LocalizationLanguage = {
    id: 1,
    code: 'uk',
    name: 'Ukrainian',
};

const EN_LANGUAGE: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const PL_LANGUAGE: LocalizationLanguage = {
    id: 3,
    code: 'pl',
    name: 'Polish',
};

const CATEGORY_WITHOUT_LOCALIZATION: TeamCategory = {
    id: 10,
    name: 'Category 1',
    description: 'Description 1',
    teamMembersCount: 2,
    localizations: [],
};

const CATEGORY_WITH_EN_LOCALIZATION: TeamCategory = {
    id: 20,
    name: 'Category 2',
    description: 'Description 2',
    teamMembersCount: 4,
    localizations: [
        {
            name: 'Category EN',
            description: 'Description EN',
            language: {
                id: EN_LANGUAGE.id,
                code: EN_LANGUAGE.code,
            },
            translationStatus: TranslationStatus.Relevant,
        },
    ],
};

const CATEGORY_LIST: TeamCategory[] = [CATEGORY_WITHOUT_LOCALIZATION, CATEGORY_WITH_EN_LOCALIZATION];

describe('TranslateTeamCategoryModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateTeamCategoryModal>> = {}) => {
        const defaultProps: React.ComponentProps<typeof TranslateTeamCategoryModal> = {
            isOpen: true,
            onClose: jest.fn(),
            categoryToTranslate: CATEGORY_WITHOUT_LOCALIZATION,
            onTranslateCategory: jest.fn(),
            translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE],
            categories: CATEGORY_LIST,
        };

        return render(<TranslateTeamCategoryModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormIsValid = true;
        mockFormIsDirty = true;
        mockAutoSelectCategoryIndex = 0;

        mockTranslateTeamCategory.mockResolvedValue(undefined);
        mockUseTranslateTeamCategory.mockReturnValue({
            translateTeamCategory: mockTranslateTeamCategory,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('returns null when categoryToTranslate is null', () => {
        renderModal({ categoryToTranslate: null });

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

    it('uses null selected language when translatedLanguages is empty', () => {
        renderModal({ translatedLanguages: [] });

        expect(screen.getByTestId('selected-language')).toHaveTextContent('none');
        expect(mockUseTranslateTeamCategory).toHaveBeenCalledWith(expect.objectContaining({ language: null }));
    });

    it('starts in add mode and changes to edit mode when selected category has localization for selected language', async () => {
        mockAutoSelectCategoryIndex = 1;
        renderModal({ translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE] });

        expect(mockUseTranslateTeamCategory).toHaveBeenCalledWith(expect.objectContaining({ mode: ModalMode.Add }));

        await waitFor(() => {
            expect(mockUseTranslateTeamCategory).toHaveBeenCalledWith(
                expect.objectContaining({ mode: ModalMode.Edit }),
            );
        });
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );
    });

    it('passes initialData to form in edit mode', async () => {
        mockAutoSelectCategoryIndex = 1;
        renderModal({ translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE] });

        await waitFor(() => {
            expect(screen.getByTestId('translate-team-category-form')).toHaveAttribute(
                'data-initial',
                JSON.stringify({
                    name: 'Category EN',
                    description: 'Description EN',
                }),
            );
        });
    });

    it('submits translation and executes success callback flow', async () => {
        const onTranslateCategory = jest.fn();
        const onClose = jest.fn();

        mockTranslateTeamCategory.mockImplementation(async () => {
            const firstCallArgs = mockUseTranslateTeamCategory.mock.calls[0][0];
            firstCallArgs.onSuccess(CATEGORY_WITH_EN_LOCALIZATION);
        });

        renderModal({ onTranslateCategory, onClose });

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockTranslateTeamCategory).toHaveBeenCalledWith({
                name: 'Translated category name',
                description: 'Translated category description',
            });
        });

        expect(onTranslateCategory).toHaveBeenCalledWith(CATEGORY_WITH_EN_LOCALIZATION);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not submit when form is invalid', () => {
        mockFormIsValid = false;
        renderModal();

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        expect(mockTranslateTeamCategory).not.toHaveBeenCalled();
    });

    it('shows confirmation modal when closing dirty form and closes immediately for clean form', () => {
        const onClose = jest.fn();

        mockFormIsDirty = true;
        const { rerender } = render(
            <TranslateTeamCategoryModal
                isOpen={true}
                onClose={onClose}
                categoryToTranslate={CATEGORY_WITHOUT_LOCALIZATION}
                onTranslateCategory={jest.fn()}
                translatedLanguages={[UK_LANGUAGE, EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();

        mockFormIsDirty = false;
        rerender(
            <TranslateTeamCategoryModal
                isOpen={true}
                onClose={onClose}
                categoryToTranslate={CATEGORY_WITHOUT_LOCALIZATION}
                onTranslateCategory={jest.fn()}
                translatedLanguages={[UK_LANGUAGE, EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders error message and passes submitting state to controls and form', () => {
        mockUseTranslateTeamCategory.mockReturnValue({
            translateTeamCategory: mockTranslateTeamCategory,
            isSubmitting: true,
            error: 'Translation failed',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByText('Translation failed')).toBeInTheDocument();
        expect(screen.getByTestId('is-submitting')).toHaveTextContent('true');
        expect(screen.getByTestId('translate-team-category-form')).toHaveAttribute('data-disabled', 'true');
        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('changes language through translation controls and keeps add mode if localization is missing', async () => {
        mockAutoSelectCategoryIndex = 0;
        renderModal({ translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE, PL_LANGUAGE] });

        fireEvent.click(screen.getByTestId('choose-last-language'));

        await waitFor(() => {
            expect(screen.getByTestId('selected-language')).toHaveTextContent('pl');
        });
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
    });
});
