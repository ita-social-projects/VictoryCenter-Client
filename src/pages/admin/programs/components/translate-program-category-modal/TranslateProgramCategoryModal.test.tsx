import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramCategory } from '@/types/admin/programs';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { TranslateProgramCategoryModal } from './TranslateProgramCategoryModal';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

const mockedUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;

let mockFormIsValid = true;
let mockFormIsDirty = true;

const mockFormSubmit = jest.fn();

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: (props: unknown) => require('@/utils/test-mocks/test-mocks').MockLocalizationModal(props),
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({
        selectedLanguage,
        languages,
        onLanguageChange,
        isSubmitting,
        generateDisabled,
        hideGenerateButton,
    }: any) => (
        <div data-testid="translation-controls">
            <span data-testid="selected-language">{selectedLanguage?.code ?? 'none'}</span>
            <span data-testid="is-submitting">{String(isSubmitting)}</span>
            <span data-testid="languages-count">{String(languages?.length ?? 0)}</span>
            <span data-testid="generate-disabled">{String(generateDisabled)}</span>
            <span data-testid="hide-generate-button">{String(hideGenerateButton)}</span>
            <button
                data-testid="choose-last-language"
                onClick={() => onLanguageChange?.(languages?.[languages.length - 1] ?? null)}
            >
                choose last language
            </button>
        </div>
    ),
}));

jest.mock('../translate-program-category-form/TranslateProgramCategoryForm', () => {
    const React = require('react');

    return {
        TranslateProgramCategoryForm: React.forwardRef(
            (
                { onSubmit, onValidationChange, onDirtyChange, onCategoryChange, categories, initialData }: any,
                ref: React.Ref<any>,
            ) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () => {
                        mockFormSubmit();
                        onSubmit({ categoryId: 1, name: 'Translated category name' });
                    },
                    isValid: () => mockFormIsValid,
                    isDirty: () => mockFormIsDirty,
                }));

                React.useEffect(() => {
                    onValidationChange?.(mockFormIsValid);
                    onDirtyChange?.(mockFormIsDirty);
                }, [onValidationChange, onDirtyChange]);

                return (
                    <div
                        data-testid="translate-program-category-form"
                        data-categories={String(categories?.length ?? 0)}
                        data-initial={initialData ? JSON.stringify(initialData) : 'null'}
                    >
                        {categories?.map((category: ProgramCategory) => (
                            <button
                                key={category.id}
                                data-testid={`select-category-${category.id}`}
                                onClick={() => onCategoryChange?.(category)}
                            >
                                {category.name}
                            </button>
                        ))}
                        <button data-testid="clear-category" onClick={() => onCategoryChange?.(null)}>
                            clear
                        </button>
                    </div>
                );
            },
        ),
    };
});

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

const CATEGORY_WITHOUT_LOCALIZATION: ProgramCategory = { id: 1, name: 'Category 1', programsCount: 2 };

const CATEGORY_WITH_EN_LOCALIZATION: ProgramCategory = {
    id: 2,
    name: 'Category 2',
    programsCount: 4,
    localizations: [
        {
            name: 'Category 2 EN',
            language: { id: EN_LANGUAGE.id, code: EN_LANGUAGE.code },
            translationStatus: TranslationStatus.Relevant,
        },
    ],
};

const CATEGORY_LIST: ProgramCategory[] = [CATEGORY_WITHOUT_LOCALIZATION, CATEGORY_WITH_EN_LOCALIZATION];

describe('TranslateProgramCategoryModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateProgramCategoryModal>> = {}) => {
        const defaultProps: React.ComponentProps<typeof TranslateProgramCategoryModal> = {
            isOpen: true,
            onClose: jest.fn(),
            translatedLanguages: [EN_LANGUAGE],
            categories: CATEGORY_LIST,
            onTranslateCategory: jest.fn(),
        };

        return render(<TranslateProgramCategoryModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormIsValid = true;
        mockFormIsDirty = true;
        mockedUseAdminClient.mockReturnValue({} as ReturnType<typeof useAdminClient>);
    });

    it('renders with the "Додати переклад" title before a category is selected', () => {
        renderModal();

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
    });

    it('keeps Generate visible (never hidden) and disables it before a category is selected, enables it once one is chosen', () => {
        renderModal();

        expect(screen.getByTestId('hide-generate-button')).toHaveTextContent('false');
        expect(screen.getByTestId('generate-disabled')).toHaveTextContent('true');

        fireEvent.click(screen.getByTestId(`select-category-${CATEGORY_WITHOUT_LOCALIZATION.id}`));

        expect(screen.getByTestId('hide-generate-button')).toHaveTextContent('false');
        expect(screen.getByTestId('generate-disabled')).toHaveTextContent('false');
    });

    it('switches to edit mode and prefills the form when the selected category already has an EN translation', () => {
        renderModal();

        fireEvent.click(screen.getByTestId(`select-category-${CATEGORY_WITH_EN_LOCALIZATION.id}`));

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );
        expect(screen.getByTestId('translate-program-category-form')).toHaveAttribute(
            'data-initial',
            JSON.stringify({ categoryId: CATEGORY_WITH_EN_LOCALIZATION.id, name: 'Category 2 EN' }),
        );
    });

    it('stays in add mode with an empty prefill when the selected category has no EN translation', () => {
        renderModal();

        fireEvent.click(screen.getByTestId(`select-category-${CATEGORY_WITHOUT_LOCALIZATION.id}`));

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
        expect(screen.getByTestId('translate-program-category-form')).toHaveAttribute(
            'data-initial',
            JSON.stringify({ categoryId: CATEGORY_WITHOUT_LOCALIZATION.id, name: '' }),
        );
    });

    it('recomputes mode and prefill when switching between categories', () => {
        renderModal();

        fireEvent.click(screen.getByTestId(`select-category-${CATEGORY_WITH_EN_LOCALIZATION.id}`));
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );

        fireEvent.click(screen.getByTestId(`select-category-${CATEGORY_WITHOUT_LOCALIZATION.id}`));
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
    });

    it('passes categories through to the form', () => {
        renderModal();

        expect(screen.getByTestId('translate-program-category-form')).toHaveAttribute(
            'data-categories',
            String(CATEGORY_LIST.length),
        );
    });

    it('selects English by default regardless of array order', () => {
        renderModal({ translatedLanguages: [PL_LANGUAGE, EN_LANGUAGE] });

        expect(screen.getByTestId('selected-language')).toHaveTextContent('en');
    });

    it('does not render translation controls when translatedLanguages is empty', () => {
        renderModal({ translatedLanguages: [] });

        expect(screen.queryByTestId('translation-controls')).not.toBeInTheDocument();
    });

    it('renders translation controls once translatedLanguages resolves asynchronously after mount', () => {
        const onClose = jest.fn();
        const { rerender } = render(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[]}
                categories={CATEGORY_LIST}
            />,
        );

        expect(screen.queryByTestId('translation-controls')).not.toBeInTheDocument();

        rerender(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
        expect(screen.getByTestId('selected-language')).toHaveTextContent('en');
    });

    it('does not render translation controls when English is not among translatedLanguages', () => {
        renderModal({ translatedLanguages: [PL_LANGUAGE] });

        expect(screen.queryByTestId('translation-controls')).not.toBeInTheDocument();
    });

    it('locks the language dropdown to English only, excluding other languages', () => {
        renderModal({ translatedLanguages: [EN_LANGUAGE, PL_LANGUAGE] });

        expect(screen.getByTestId('languages-count')).toHaveTextContent('1');

        fireEvent.click(screen.getByTestId('choose-last-language'));

        expect(screen.getByTestId('selected-language')).toHaveTextContent('en');
    });

    it('submits the form when Save is clicked and the form is valid', async () => {
        renderModal();

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockFormSubmit).toHaveBeenCalledTimes(1);
        });
    });

    it('calls the translation success callback and closes the modal after submit', async () => {
        const onTranslateCategory = jest.fn();
        const onClose = jest.fn();

        renderModal({ onTranslateCategory, onClose });

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(onTranslateCategory).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    name: 'Translated category name',
                }),
            );
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('does not submit when the form is invalid', () => {
        mockFormIsValid = false;
        renderModal();

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        expect(mockFormSubmit).not.toHaveBeenCalled();
    });

    it('shows confirmation modal when closing a dirty form and closes immediately for a clean form', () => {
        const onClose = jest.fn();

        mockFormIsDirty = true;
        const { rerender } = render(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();

        mockFormIsDirty = false;
        rerender(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('resets stale validity/dirty state when reopened after being closed', () => {
        mockFormIsValid = true;
        mockFormIsDirty = true;
        const onClose = jest.fn();

        const { rerender } = render(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        expect(screen.getByTestId('save-localization-btn')).not.toBeDisabled();

        rerender(
            <TranslateProgramCategoryModal
                isOpen={false}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        rerender(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
            />,
        );

        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('resets the selected category (and with it, mode/prefill) when reopened after being closed', () => {
        const onClose = jest.fn();
        const onTranslateCategory = jest.fn();

        const { rerender } = render(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
                onTranslateCategory={onTranslateCategory}
            />,
        );

        fireEvent.click(screen.getByTestId(`select-category-${CATEGORY_WITH_EN_LOCALIZATION.id}`));
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );

        rerender(
            <TranslateProgramCategoryModal
                isOpen={false}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
                onTranslateCategory={onTranslateCategory}
            />,
        );

        rerender(
            <TranslateProgramCategoryModal
                isOpen={true}
                onClose={onClose}
                translatedLanguages={[EN_LANGUAGE]}
                categories={CATEGORY_LIST}
                onTranslateCategory={onTranslateCategory}
            />,
        );

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
        expect(screen.getByTestId('translate-program-category-form')).toHaveAttribute('data-initial', 'null');
    });
});
