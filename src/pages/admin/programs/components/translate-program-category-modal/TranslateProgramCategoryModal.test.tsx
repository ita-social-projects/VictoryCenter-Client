import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramCategory } from '@/types/admin/programs';
import { LocalizationLanguage } from '@/types/common/language';
import { TranslateProgramCategoryModal } from './TranslateProgramCategoryModal';

let mockFormIsValid = true;
let mockFormIsDirty = true;

const mockFormSubmit = jest.fn();

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

jest.mock('../translate-program-category-form/TranslateProgramCategoryForm', () => {
    const React = require('react');

    return {
        TranslateProgramCategoryForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange, categories }: any, ref: React.Ref<any>) => {
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
                    />
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

const CATEGORY_LIST: ProgramCategory[] = [
    { id: 1, name: 'Category 1', programsCount: 2 },
    { id: 2, name: 'Category 2', programsCount: 4 },
];

describe('TranslateProgramCategoryModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateProgramCategoryModal>> = {}) => {
        const defaultProps: React.ComponentProps<typeof TranslateProgramCategoryModal> = {
            isOpen: true,
            onClose: jest.fn(),
            translatedLanguages: [EN_LANGUAGE],
            categories: CATEGORY_LIST,
        };

        return render(<TranslateProgramCategoryModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormIsValid = true;
        mockFormIsDirty = true;
    });

    it('always renders with the "Додати переклад" title', () => {
        renderModal();

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

    it('selects the first translated language by default', () => {
        renderModal({ translatedLanguages: [EN_LANGUAGE, PL_LANGUAGE] });

        expect(screen.getByTestId('selected-language')).toHaveTextContent('en');
    });

    it('does not render translation controls when translatedLanguages is empty', () => {
        renderModal({ translatedLanguages: [] });

        expect(screen.queryByTestId('translation-controls')).not.toBeInTheDocument();
    });

    it('changes the selected language through translation controls', async () => {
        renderModal({ translatedLanguages: [EN_LANGUAGE, PL_LANGUAGE] });

        fireEvent.click(screen.getByTestId('choose-last-language'));

        await waitFor(() => {
            expect(screen.getByTestId('selected-language')).toHaveTextContent('pl');
        });
    });

    it('submits the form when Save is clicked and the form is valid', async () => {
        renderModal();

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockFormSubmit).toHaveBeenCalledTimes(1);
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
});
