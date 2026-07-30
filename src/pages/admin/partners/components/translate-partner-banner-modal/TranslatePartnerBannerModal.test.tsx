import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ModalMode } from '@/types/admin/common';
import { PartnerBanner } from '@/types/admin/partners';
import { TranslationStatus, LocalizationLanguage } from '@/types/common/language';
import { useTranslatePartnerBanner } from '@/hooks/admin/use-translate-partner-banner/useTranslatePartnerBanner';
import { TranslatePartnerBannerModal } from './TranslatePartnerBannerModal';

let mockFormIsValid = true;
let mockFormIsDirty = true;

const mockTranslateBanner = jest.fn();

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

jest.mock('../translate-partner-banner-form/TranslatePartnerBannerForm', () => {
    const React = require('react');

    return {
        TranslatePartnerBannerForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange, initialData, formDisabled }: any, ref: React.Ref<any>) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () =>
                        onSubmit({
                            title: 'Translated banner title',
                            description: 'Translated banner description',
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
                        data-testid="translate-partner-banner-form"
                        data-initial={initialData ? JSON.stringify(initialData) : 'null'}
                        data-disabled={String(Boolean(formDisabled))}
                    />
                );
            },
        ),
    };
});

jest.mock('@/hooks/admin/use-translate-partner-banner/useTranslatePartnerBanner', () => ({
    useTranslatePartnerBanner: jest.fn(() => ({
        translateBanner: mockTranslateBanner,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslatePartnerBanner = jest.mocked(useTranslatePartnerBanner);

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

const BANNER_WITHOUT_LOCALIZATION: PartnerBanner = {
    id: 10,
    title: 'Banner title',
    description: 'Banner description',
    image: null,
    imageId: null,
    localizations: [],
};

const BANNER_WITH_EN_LOCALIZATION: PartnerBanner = {
    id: 10,
    title: 'Banner title',
    description: 'Banner description',
    image: null,
    imageId: null,
    localizations: [
        {
            title: 'Banner title EN',
            description: 'Banner description EN',
            language: {
                id: EN_LANGUAGE.id,
                code: EN_LANGUAGE.code,
            },
            translationStatus: TranslationStatus.Relevant,
        },
    ],
};

describe('TranslatePartnerBannerModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslatePartnerBannerModal>> = {}) => {
        const defaultProps: React.ComponentProps<typeof TranslatePartnerBannerModal> = {
            isOpen: true,
            onClose: jest.fn(),
            banner: BANNER_WITHOUT_LOCALIZATION,
            onTranslateBanner: jest.fn(),
            translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE],
        };

        return render(<TranslatePartnerBannerModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormIsValid = true;
        mockFormIsDirty = true;

        mockTranslateBanner.mockResolvedValue(undefined);
        mockUseTranslatePartnerBanner.mockReturnValue({
            translateBanner: mockTranslateBanner,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('returns null when banner is null', () => {
        renderModal({ banner: null });

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
        expect(mockUseTranslatePartnerBanner).toHaveBeenCalledWith(expect.objectContaining({ language: null }));
    });

    it('starts in add mode when banner has no localization for selected language', () => {
        renderModal({ banner: BANNER_WITHOUT_LOCALIZATION, translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE] });

        expect(mockUseTranslatePartnerBanner).toHaveBeenCalledWith(expect.objectContaining({ mode: ModalMode.Add }));
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
    });

    it('starts in edit mode when banner has localization for selected language', async () => {
        renderModal({ banner: BANNER_WITH_EN_LOCALIZATION, translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE] });

        await waitFor(() => {
            expect(mockUseTranslatePartnerBanner).toHaveBeenCalledWith(
                expect.objectContaining({ mode: ModalMode.Edit }),
            );
        });
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );
    });

    it('passes initialData to form in edit mode', async () => {
        renderModal({ banner: BANNER_WITH_EN_LOCALIZATION, translatedLanguages: [UK_LANGUAGE, EN_LANGUAGE] });

        await waitFor(() => {
            expect(screen.getByTestId('translate-partner-banner-form')).toHaveAttribute(
                'data-initial',
                JSON.stringify({
                    title: 'Banner title EN',
                    description: 'Banner description EN',
                }),
            );
        });
    });

    it('submits translation and executes success callback flow', async () => {
        const onTranslateBanner = jest.fn();
        const onClose = jest.fn();

        mockTranslateBanner.mockImplementation(async () => {
            const firstCallArgs = mockUseTranslatePartnerBanner.mock.calls[0][0];
            firstCallArgs.onSuccess(BANNER_WITH_EN_LOCALIZATION);
        });

        renderModal({ onTranslateBanner, onClose });

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockTranslateBanner).toHaveBeenCalledWith({
                title: 'Translated banner title',
                description: 'Translated banner description',
            });
        });

        expect(onTranslateBanner).toHaveBeenCalledWith(BANNER_WITH_EN_LOCALIZATION);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not submit when form is invalid', () => {
        mockFormIsValid = false;
        renderModal();

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        expect(mockTranslateBanner).not.toHaveBeenCalled();
    });

    it('shows confirmation modal when closing dirty form and closes immediately for clean form', () => {
        const onClose = jest.fn();

        mockFormIsDirty = true;
        const { rerender } = render(
            <TranslatePartnerBannerModal
                isOpen={true}
                onClose={onClose}
                banner={BANNER_WITHOUT_LOCALIZATION}
                onTranslateBanner={jest.fn()}
                translatedLanguages={[UK_LANGUAGE, EN_LANGUAGE]}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();

        mockFormIsDirty = false;
        rerender(
            <TranslatePartnerBannerModal
                isOpen={true}
                onClose={onClose}
                banner={BANNER_WITHOUT_LOCALIZATION}
                onTranslateBanner={jest.fn()}
                translatedLanguages={[UK_LANGUAGE, EN_LANGUAGE]}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders error message and passes submitting state to controls and form', () => {
        mockUseTranslatePartnerBanner.mockReturnValue({
            translateBanner: mockTranslateBanner,
            isSubmitting: true,
            error: 'Translation failed',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByText('Translation failed')).toBeInTheDocument();
        expect(screen.getByTestId('is-submitting')).toHaveTextContent('true');
        expect(screen.getByTestId('translate-partner-banner-form')).toHaveAttribute('data-disabled', 'true');
        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('changes language through translation controls and keeps add mode if localization is missing', async () => {
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
