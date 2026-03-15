import React, { useImperativeHandle } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateWhoWeAreModal } from './TranslateWhoWeAreModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { GeneralFormProps, GeneralFormRef } from '../strategies/who-we-are-modal-strategy';
import { ModalMode } from '@/types/admin/common';
import { ContentType, SectionType } from '@/types/common/about-us';
import { LocalizationLanguage } from '@/types/common/language';
import { WhoWeAreSection } from '@/types/admin/who-we-are';
import { MainPageProps, WhoWeSupportCardsProps } from '../../sections/SectionsProps';

let mockFormIsValid = true;
const mockFormSubmit = jest.fn().mockResolvedValue(undefined);
const mockFormIsDirty = jest.fn(() => false);

const mockGetInitialDataTitleAndDescription = jest.fn(
    (_section: WhoWeAreSection, _language: LocalizationLanguage | null, _isEditMode: boolean) => ({
        title: '<p>Title from strategy</p>',
        description: '<p>Description from strategy</p>',
    }),
);
const mockGetInitialDataDescription = jest.fn(
    (_section: WhoWeAreSection, _language: LocalizationLanguage | null, _isEditMode: boolean) => ({
        description: '<p>Description from strategy</p>',
    }),
);
const mockGetInitialDataMultipleDescriptions = jest.fn(
    (_section: WhoWeAreSection, _language: LocalizationLanguage | null, _isEditMode: boolean) => ({
        rows: [{ contentId: 100, image: 'fallback.jpg', description: '<p>Row description</p>' }],
    }),
);

const mockTranslateSection = jest.fn().mockResolvedValue(undefined);
const mockUseTranslateWhoWeAreSection = jest.fn();

function mockBuildStrategyForm() {
    const MockStrategyForm = React.forwardRef<GeneralFormRef, GeneralFormProps<unknown>>((props, ref) => {
        useImperativeHandle(ref, () => ({
            submit: mockFormSubmit,
            isValid: () => mockFormIsValid,
            isDirty: mockFormIsDirty,
        }));

        return (
            <div
                data-testid="strategy-form"
                data-description-limit={String(props.limits.descriptionLimit)}
                data-title-limit={String(props.limits.titleLimit ?? '')}
                data-initial-data={JSON.stringify(props.initialData ?? null)}
            />
        );
    });

    MockStrategyForm.displayName = 'MockStrategyForm';
    return MockStrategyForm;
}

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: ({ isOpen, onClose, onSave, title, children, isFormValid }: any) =>
        isOpen ? (
            <div data-testid="localization-modal">
                <h2>{title}</h2>
                <div data-testid="is-form-valid">{String(isFormValid)}</div>
                <button data-testid="save-button" onClick={onSave}>
                    Save
                </button>
                <button data-testid="close-button" onClick={onClose}>
                    Close
                </button>
                {children}
            </div>
        ) : null,
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({ selectedLanguage, languages, onLanguageChange }: any) => (
        <div data-testid="translation-controls">
            <span data-testid="selected-language">{selectedLanguage?.code ?? 'none'}</span>
            <button
                data-testid="switch-language"
                onClick={() => {
                    if (languages.length > 1) {
                        onLanguageChange(languages[1]);
                    }
                }}
            >
                Switch language
            </button>
        </div>
    ),
}));

jest.mock('../strategies/description/translate-title-and-description-strategy', () => ({
    translateTitleAndDescriptionStrategy: {
        FormComponent: mockBuildStrategyForm(),
        getInitialData: (section: WhoWeAreSection, language: LocalizationLanguage | null, isEditMode: boolean) =>
            mockGetInitialDataTitleAndDescription(section, language, isEditMode),
    },
}));

jest.mock('../strategies/description/translate-description-strategy', () => ({
    translateDescriptionStrategy: {
        FormComponent: mockBuildStrategyForm(),
        getInitialData: (section: WhoWeAreSection, language: LocalizationLanguage | null, isEditMode: boolean) =>
            mockGetInitialDataDescription(section, language, isEditMode),
    },
}));

jest.mock('../strategies/description/translate-multiple-descriptions-strategy', () => ({
    translateMultipleDescriptionsStrategy: {
        FormComponent: mockBuildStrategyForm(),
        getInitialData: (section: WhoWeAreSection, language: LocalizationLanguage | null, isEditMode: boolean) =>
            mockGetInitialDataMultipleDescriptions(section, language, isEditMode),
    },
}));

jest.mock('@/hooks/admin/use-translate-who-we-are-section/useTranslateWhoWeAreSection', () => ({
    useTranslateWhoWeAreSection: (...args: unknown[]) => mockUseTranslateWhoWeAreSection(...args),
}));

const translatedLanguages: LocalizationLanguage[] = [
    { id: 2, code: 'en', name: 'English' },
    { id: 1, code: 'uk', name: 'Ukrainian' },
];

const buildSection = (sectionType: SectionType, includeEnglishLocalization = false): WhoWeAreSection => ({
    id: 1,
    title: 'Who We Are Section',
    sectionType,
    contents: [
        {
            id: 100,
            contentType: ContentType.Description,
            title: null,
            description: null,
            image: null,
            imageId: null,
            localizations: [
                {
                    language: { id: 1, code: 'uk' },
                    translationStatus: 1,
                    title: 'Заголовок',
                    description: '<p>Опис</p>',
                },
                ...(includeEnglishLocalization
                    ? [
                          {
                              language: { id: 2, code: 'en' },
                              translationStatus: 1,
                              title: 'Title',
                              description: '<p>Description</p>',
                          },
                      ]
                    : []),
            ],
        },
    ],
});

describe('TranslateWhoWeAreModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFormIsValid = true;

        mockUseTranslateWhoWeAreSection.mockReturnValue({
            translateSection: mockTranslateSection,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('returns null when there is no section to translate', () => {
        const { container } = render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={jest.fn()}
                sectionToTranslate={null}
                onTranslateSection={jest.fn()}
                translatedLanguages={translatedLanguages}
            />,
        );

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByTestId('localization-modal')).not.toBeInTheDocument();
    });

    it('shows add translation title when localization does not exist for selected language', () => {
        render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={jest.fn()}
                sectionToTranslate={buildSection(SectionType.Main, false)}
                onTranslateSection={jest.fn()}
                translatedLanguages={translatedLanguages}
            />,
        );

        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).toBeInTheDocument();
        expect(mockUseTranslateWhoWeAreSection).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: ModalMode.Add,
                language: translatedLanguages[0],
            }),
        );
    });

    it('shows edit translation title when localization exists and switches mode after language change', async () => {
        render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={jest.fn()}
                sectionToTranslate={buildSection(SectionType.Main, true)}
                onTranslateSection={jest.fn()}
                translatedLanguages={translatedLanguages}
            />,
        );

        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION)).toBeInTheDocument();
        expect(screen.getByTestId('selected-language')).toHaveTextContent('en');

        fireEvent.click(screen.getByTestId('switch-language'));

        await waitFor(() => {
            expect(screen.getByTestId('selected-language')).toHaveTextContent('uk');
        });

        expect(mockUseTranslateWhoWeAreSection).toHaveBeenLastCalledWith(
            expect.objectContaining({
                mode: ModalMode.Edit,
                language: translatedLanguages[1],
            }),
        );
    });

    it('submits form when save is clicked and form is valid', () => {
        render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={jest.fn()}
                sectionToTranslate={buildSection(SectionType.Main)}
                onTranslateSection={jest.fn()}
                translatedLanguages={translatedLanguages}
            />,
        );

        fireEvent.click(screen.getByTestId('save-button'));

        expect(mockFormSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not submit form when save is clicked and form is invalid', () => {
        mockFormIsValid = false;

        render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={jest.fn()}
                sectionToTranslate={buildSection(SectionType.Main)}
                onTranslateSection={jest.fn()}
                translatedLanguages={translatedLanguages}
            />,
        );

        fireEvent.click(screen.getByTestId('save-button'));

        expect(mockFormSubmit).not.toHaveBeenCalled();
    });

    it('calls onTranslateSection and onClose when hook onSuccess is triggered', () => {
        const onTranslateSection = jest.fn();
        const onClose = jest.fn();
        const updatedSection = buildSection(SectionType.Main, true);

        render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={onClose}
                sectionToTranslate={buildSection(SectionType.Main, true)}
                onTranslateSection={onTranslateSection}
                translatedLanguages={translatedLanguages}
            />,
        );

        const hookArgs = mockUseTranslateWhoWeAreSection.mock.calls[0][0] as {
            onSuccess: (section: WhoWeAreSection) => void;
        };

        hookArgs.onSuccess(updatedSection);

        expect(onTranslateSection).toHaveBeenCalledWith(updatedSection);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('uses multiple descriptions strategy and passes limits for WhoWeSupport section', () => {
        render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={jest.fn()}
                sectionToTranslate={buildSection(SectionType.WhoWeSupport)}
                onTranslateSection={jest.fn()}
                translatedLanguages={translatedLanguages}
            />,
        );

        expect(mockGetInitialDataMultipleDescriptions).toHaveBeenCalled();
        expect(mockGetInitialDataTitleAndDescription).not.toHaveBeenCalled();

        const strategyForm = screen.getByTestId('strategy-form');
        expect(strategyForm.getAttribute('data-description-limit')).toBe(String(WhoWeSupportCardsProps.descriptionLimit));
        expect(strategyForm.getAttribute('data-title-limit')).toBe('');
    });

    it('uses title and description strategy and passes title limit for Main section', () => {
        render(
            <TranslateWhoWeAreModal
                isOpen={true}
                onClose={jest.fn()}
                sectionToTranslate={buildSection(SectionType.Main)}
                onTranslateSection={jest.fn()}
                translatedLanguages={translatedLanguages}
            />,
        );

        expect(mockGetInitialDataTitleAndDescription).toHaveBeenCalled();
        expect(mockGetInitialDataDescription).not.toHaveBeenCalled();

        const strategyForm = screen.getByTestId('strategy-form');
        expect(strategyForm.getAttribute('data-description-limit')).toBe(String(MainPageProps.descriptionLimit));
        expect(strategyForm.getAttribute('data-title-limit')).toBe(String(MainPageProps.titleLimit));
    });
});
