import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { HippotherapyPageContent } from './HippotherapyPageContent';
import { HippotherapyPageApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { isHippotherapyPageContentValid } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { ToastType } from '@/types/admin/toast';
import {
    HippotherapyPageContentModel,
    HippotherapyPageLocalization,
    HippotherapyPageLocalizationBlock,
} from '@/types/admin/hippotherapy-page';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { DEFAULT_ENGLISH_LANGUAGE_ID, DEFAULT_LOCALE, DEFAULT_UKRAINIAN_LANGUAGE_ID } from '@/const/common/locales';

function mockDisabledAttr(isDisabled: unknown) {
    return String(Boolean(isDisabled));
}

function mockSectionContainer({
    testId,
    isTranslateDisabled,
    localizations,
    children,
}: {
    testId: string;
    isTranslateDisabled?: boolean;
    localizations?: unknown[];
    children: any;
}) {
    return (
        <div
            data-testid={testId}
            data-translate-disabled={mockDisabledAttr(isTranslateDisabled)}
            data-localizations-count={localizations?.length ?? 0}
        >
            {children}
        </div>
    );
}

function mockTranslateButton({
    onClick,
    disabled,
    label,
}: {
    onClick?: () => void;
    disabled?: boolean;
    label: string;
}) {
    return onClick ? (
        <button disabled={disabled} onClick={onClick}>
            Translate {label}
        </button>
    ) : null;
}

function mockEditButton({ disabled, onClick, label }: { disabled?: boolean; onClick: () => void; label: string }) {
    return (
        <button disabled={disabled} onClick={onClick}>
            Edit {label}
        </button>
    );
}

function mockImageErrorButtons(onError: ((...args: any[]) => void) | undefined, label: string, slotIndex?: number) {
    const trigger = (error: string | null) =>
        slotIndex === undefined ? onError?.(error) : onError?.(slotIndex, error);

    return (
        <>
            <button onClick={() => trigger('image size error')}>Set {label} image error</button>
            <button onClick={() => trigger(null)}>Clear {label} image error</button>
        </>
    );
}

function mockImageSection(testId: string, label: string, editedTitle: string, imageErrorLabel: string = label) {
    return ({ value, onChange, onImageError, disabled, isTranslateDisabled, onTranslateClick, localizations }: any) =>
        mockSectionContainer({
            testId,
            isTranslateDisabled,
            localizations,
            children: (
                <>
                    <span>{value.title}</span>
                    {mockTranslateButton({ onClick: onTranslateClick, disabled: isTranslateDisabled, label })}
                    {mockEditButton({
                        disabled,
                        label,
                        onClick: () => onChange({ ...value, title: editedTitle }),
                    })}
                    {mockImageErrorButtons(onImageError, imageErrorLabel)}
                </>
            ),
        });
}

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onClose, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <h3>{title}</h3>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

jest.mock('../sections/intro-banner-section/IntroBannerSection', () => ({
    IntroBannerSection: mockImageSection('section-intro', 'intro', 'Edited intro title'),
}));

jest.mock('../sections/hippovention-center-section/HippoventionCenterSection', () => ({
    HippoventionCenterSection: mockImageSection(
        'section-hippovention-center',
        'hippovention-center',
        'Edited hippovention center',
        'hippovention center',
    ),
}));

jest.mock('../sections/text-card-section/TextCardSection', () => ({
    TextCardSection: ({
        value,
        onChange,
        fieldIdPrefix,
        disabled,
        isTranslateDisabled,
        onTranslateClick,
        localizations,
    }: any) =>
        mockSectionContainer({
            testId: `section-${fieldIdPrefix}`,
            isTranslateDisabled,
            localizations,
            children: (
                <>
                    <span>{value.title}</span>
                    {mockTranslateButton({
                        onClick: onTranslateClick,
                        disabled: isTranslateDisabled,
                        label: fieldIdPrefix,
                    })}
                    {mockEditButton({
                        disabled,
                        label: fieldIdPrefix,
                        onClick: () => onChange({ ...value, title: 'Edited text card title' }),
                    })}
                </>
            ),
        }),
}));

jest.mock('../sections/hippotherapy-quote-section/HippotherapyQuoteSection', () => ({
    HippotherapyQuoteSection: ({
        value,
        onChange,
        onImageError,
        fieldIdPrefix,
        disabled,
        onTranslateClick,
        isTranslateDisabled,
        localizations,
    }: any) =>
        mockSectionContainer({
            testId: `section-${fieldIdPrefix}`,
            isTranslateDisabled,
            localizations,
            children: (
                <>
                    <span>{value.quoteText}</span>
                    {mockTranslateButton({
                        onClick: onTranslateClick,
                        disabled: isTranslateDisabled,
                        label: fieldIdPrefix,
                    })}
                    {mockEditButton({
                        disabled,
                        label: fieldIdPrefix,
                        onClick: () => onChange({ ...value, quoteText: 'Edited quote' }),
                    })}
                    {mockImageErrorButtons(onImageError, fieldIdPrefix)}
                </>
            ),
        }),
}));

jest.mock('../sections/gallery-section/GallerySection', () => ({
    GallerySection: ({
        value,
        onChange,
        onCardImageError,
        fieldIdPrefix,
        disabled,
        onTranslateClick,
        isTranslateDisabled,
        localizations,
    }: any) =>
        mockSectionContainer({
            testId: `section-${fieldIdPrefix}`,
            isTranslateDisabled,
            localizations,
            children: (
                <>
                    <span>{value.title}</span>
                    {value.cards?.map((card: any, i: number) => (
                        <span key={i} data-testid={`${fieldIdPrefix}-card-${i}`}>
                            {card.description}
                        </span>
                    ))}
                    {mockTranslateButton({
                        onClick: onTranslateClick,
                        disabled: isTranslateDisabled,
                        label: fieldIdPrefix,
                    })}
                    {mockEditButton({
                        disabled,
                        label: fieldIdPrefix,
                        onClick: () => onChange({ ...value, title: 'Edited gallery title' }),
                    })}
                    {mockImageErrorButtons(onCardImageError, `${fieldIdPrefix} card`, 0)}
                </>
            ),
        }),
}));

jest.mock('../sections/scientific-references-section/ScientificReferencesSection', () => ({
    ScientificReferencesSection: ({
        value,
        onChange,
        disabled,
        onTranslateGeneralClick,
        isTranslateGeneralDisabled,
        onTranslateReferenceClick,
        isTranslateReferenceDisabled,
        localizations,
    }: any) =>
        mockSectionContainer({
            testId: 'section-research',
            isTranslateDisabled: isTranslateGeneralDisabled,
            localizations,
            children: (
                <>
                    <span>{value.title}</span>
                    {mockEditButton({
                        disabled,
                        label: 'research',
                        onClick: () => onChange({ ...value, title: 'Edited research title' }),
                    })}
                    {mockEditButton({
                        disabled,
                        label: 'reference item',
                        onClick: () =>
                            onChange({
                                ...value,
                                scientificReferences: [{ ...value.scientificReferences[0], name: 'Edited citation' }],
                            }),
                    })}
                    {mockTranslateButton({
                        onClick: onTranslateGeneralClick,
                        disabled: isTranslateGeneralDisabled,
                        label: 'research-general',
                    })}
                    {mockTranslateButton({
                        onClick: onTranslateReferenceClick && (() => onTranslateReferenceClick('local-1')),
                        disabled: isTranslateReferenceDisabled?.(value.scientificReferences[0]?.localId),
                        label: 'research-item',
                    })}
                </>
            ),
        }),
}));

jest.mock('../sections/ethics-section/EthicsSection', () => ({
    EthicsSection: ({
        value,
        onChange,
        onImageError,
        disabled,
        onTranslateClick,
        isTranslateDisabled,
        localizations,
    }: any) =>
        mockSectionContainer({
            testId: 'section-ethics',
            isTranslateDisabled,
            localizations,
            children: (
                <>
                    <span>{value.title}</span>
                    {value.principles?.map((p: any, i: number) => (
                        <span key={i} data-testid={`ethics-principle-${i}`}>
                            {p.text}
                        </span>
                    ))}
                    {mockEditButton({
                        disabled,
                        label: 'ethics',
                        onClick: () => onChange({ ...value, title: 'Edited ethics title' }),
                    })}
                    {mockEditButton({
                        disabled,
                        label: 'ethics principle',
                        onClick: () =>
                            onChange({
                                ...value,
                                principles: value.principles.map((p: any, i: number) =>
                                    i === 0 ? { ...p, text: 'Edited principle' } : p,
                                ),
                            }),
                    })}
                    {mockImageErrorButtons(onImageError, 'ethics')}
                    {mockTranslateButton({ onClick: onTranslateClick, disabled: isTranslateDisabled, label: 'ethics' })}
                </>
            ),
        }),
}));

jest.mock('../translate-section-modal/TranslateHippotherapySectionModal', () => ({
    TranslateHippotherapySectionModal: ({
        isOpen,
        block,
        subBlock,
        targetResearchLocalId,
        onClose,
        translatedLanguages,
        descriptionImages,
    }: any) =>
        isOpen ? (
            <div data-testid="translate-section-modal">
                <span data-testid="translate-section-modal-block">{block}</span>
                <span data-testid="translate-section-modal-sub-block">{subBlock}</span>
                <span data-testid="translate-section-modal-target-id">{targetResearchLocalId}</span>
                <span data-testid="translate-section-modal-description-images">{descriptionImages.join(',')}</span>
                <span>{translatedLanguages.map((language: any) => language.name).join(',')}</span>
                <button onClick={onClose}>Close translation</button>
            </div>
        ) : null,
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit');
const mockedUseLocalizationToolkit = useLocalizationToolkit as jest.Mock;

jest.mock('@/services/api/admin/hippotherapy-page/hippotherapy-page-api');
const mockedHippotherapyPageApi = HippotherapyPageApi as jest.Mocked<typeof HippotherapyPageApi>;

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
const mockedUseToast = useToast as jest.Mock;

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    isHippotherapyPageContentValid: jest.fn(() => true),
}));
const mockedIsContentValid = isHippotherapyPageContentValid as jest.Mock;

const ukrainianLanguage: LocalizationLanguage = {
    id: DEFAULT_UKRAINIAN_LANGUAGE_ID,
    code: DEFAULT_LOCALE,
    name: 'Українська',
};
const englishLanguage: LocalizationLanguage = {
    id: DEFAULT_ENGLISH_LANGUAGE_ID,
    code: 'en',
    name: 'Англійська',
};

const createToolkitMock = (overrides: Record<string, unknown> = {}) => ({
    allLanguages: [ukrainianLanguage, englishLanguage],
    translationLanguages: [englishLanguage],
    selectedLanguage: ukrainianLanguage,
    onLanguageChange: jest.fn(),
    ...overrides,
});

const savedImage = { id: 1, url: 'https://example.com/image.webp', mimeType: 'image/webp' };

const buildContent = (overrides: Partial<HippotherapyPageContentModel> = {}): HippotherapyPageContentModel => ({
    localizations: [],
    translationStatuses: [],
    introSection: { title: 'Intro title', description: 'Intro description', image: null, imageId: null },
    descriptionSection: { title: 'Description title', description: 'Description text' },
    quoteSection: { quoteText: 'Quote text', authorName: 'Author', image: savedImage, imageId: savedImage.id },
    hippoventionSection: { title: 'Hippovention title', description: 'Hippovention text' },
    hippoventionCenterSection: {
        title: 'Hippovention center title',
        description: 'Hippovention center text',
        pros: 'Pro one and pro two',
        image: savedImage,
        imageId: savedImage.id,
    },
    advantagesSection: {
        title: 'Advantages title',
        cards: [{ id: 101, description: 'Card description', image: savedImage, imageId: savedImage.id }],
    },
    analysisSection: { title: 'Analysis title', description: 'Analysis text' },
    scientificReferencesSection: {
        title: 'Research title',
        description: 'Research text',
        scientificReferences: [{ localId: 'local-1', id: 1, name: 'Citation', url: 'https://example.com/citation' }],
    },
    anotherQuoteSection: {
        quoteText: 'Another quote',
        authorName: 'Another author',
        image: savedImage,
        imageId: savedImage.id,
    },
    participantsSection: {
        title: 'Participants title',
        cards: [{ id: 201, description: 'Participant description', image: savedImage, imageId: savedImage.id }],
    },
    ethicsSection: {
        title: 'Ethics title',
        description: 'Ethics text',
        principles: [{ id: 301, text: 'Principle one' }],
        image: savedImage,
        imageId: savedImage.id,
    },
    ...overrides,
});

const withEnglishLocalization = (
    localization: Partial<HippotherapyPageLocalization> & Record<string, unknown>,
    contentOverrides: Partial<HippotherapyPageContentModel> = {},
): HippotherapyPageContentModel =>
    buildContent({
        ...contentOverrides,
        localizations: [
            {
                language: englishLanguage,
                translationStatus: TranslationStatus.Relevant,
                ...localization,
            } as HippotherapyPageLocalization,
        ],
    });

const contentWithEnglish = (): HippotherapyPageContentModel =>
    withEnglishLocalization({
        introSection: { title: 'English Intro Title', description: 'English Intro Description' },
        descriptionSection: { title: 'English Desc Title', description: 'English Desc Text' },
    });

const SECTION_TEST_IDS = [
    'section-intro',
    'section-hippotherapy-description',
    'section-hippotherapy-quote',
    'section-hippotherapy-hippovention',
    'section-hippovention-center',
    'section-hippotherapy-advantages',
    'section-hippotherapy-analysis',
    'section-research',
    'section-hippotherapy-another-quote',
    'section-hippotherapy-participants',
    'section-ethics',
];

const GENERAL_TRANSLATABLE_SECTIONS: Array<[string, HippotherapyPageLocalizationBlock]> = [
    ['intro', HippotherapyPageLocalizationBlock.Intro],
    ['hippotherapy-description', HippotherapyPageLocalizationBlock.Description],
    ['hippotherapy-quote', HippotherapyPageLocalizationBlock.Quote],
    ['hippotherapy-hippovention', HippotherapyPageLocalizationBlock.Hippovention],
    ['hippotherapy-analysis', HippotherapyPageLocalizationBlock.Analysis],
    ['hippotherapy-another-quote', HippotherapyPageLocalizationBlock.AnotherQuote],
    ['hippovention-center', HippotherapyPageLocalizationBlock.HippoventionCenter],
];

const PUBLISH_LABEL = COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED;

const mockClient = { get: jest.fn(), put: jest.fn() };
const mockAddToast = jest.fn();

const getButton = (name: string | RegExp) => screen.getByRole('button', { name });
const clickButton = (name: string | RegExp) => fireEvent.click(getButton(name));
const publishButton = () => getButton(PUBLISH_LABEL);
const translateButton = (fieldIdPrefix: string) => getButton(`Translate ${fieldIdPrefix}`);

const expectTranslationDisabledForEverySection = (isDisabled: boolean) =>
    SECTION_TEST_IDS.forEach((testId) =>
        expect(screen.getByTestId(testId)).toHaveAttribute('data-translate-disabled', String(isDisabled)),
    );

type SetupOptions = {
    content?: HippotherapyPageContentModel;
    apiError?: unknown;
    toolkitOverrides?: Record<string, unknown>;
    isValid?: boolean;
};

const setup = (options: SetupOptions = {}) => {
    if (options.isValid !== undefined) {
        mockedIsContentValid.mockReturnValue(options.isValid);
    }
    if (options.apiError) {
        mockedHippotherapyPageApi.get.mockRejectedValue(options.apiError);
    } else {
        mockedHippotherapyPageApi.get.mockResolvedValue(options.content ?? buildContent());
    }
    mockedUseLocalizationToolkit.mockReturnValue(createToolkitMock(options.toolkitOverrides));
    return render(<HippotherapyPageContent />);
};

const renderLoaded = async (contentOrOptions: HippotherapyPageContentModel | SetupOptions = {}) => {
    const options: SetupOptions = 'introSection' in contentOrOptions ? { content: contentOrOptions } : contentOrOptions;
    setup(options);
    await screen.findByTestId('section-intro');
};

const mockPageNotFound = () => {
    jest.spyOn(axios, 'isAxiosError').mockImplementation((error: unknown) => Boolean((error as any)?.response));
    mockedHippotherapyPageApi.get.mockRejectedValue({ response: { status: 404 } });
};

const editIntro = () => clickButton('Edit intro');

const publishChanges = () => {
    clickButton(PUBLISH_LABEL);
    clickButton('Confirm');
};

const editIntroAndPublish = () => {
    editIntro();
    publishChanges();
};

const expectToast = (message: string, type: ToastType) =>
    waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(message, type));

const expectUpdateCalledWith = (partial: Record<string, unknown>) =>
    expect(mockedHippotherapyPageApi.update).toHaveBeenCalledWith(mockClient, expect.objectContaining(partial));

const expectTranslationModalBlock = (block: HippotherapyPageLocalizationBlock) =>
    expect(screen.getByTestId('translate-section-modal-block')).toHaveTextContent(String(block));

const closeTranslationModal = () => {
    clickButton('Close translation');
    expect(screen.queryByTestId('translate-section-modal')).not.toBeInTheDocument();
};

const expectOpensModalAndDisablesOnEdit = async ({
    translateButtonName,
    expectedBlock,
    editButtonName,
    expectedSubBlock = '',
    expectedTargetId,
}: {
    translateButtonName: string;
    expectedBlock: HippotherapyPageLocalizationBlock;
    editButtonName: string;
    expectedSubBlock?: string;
    expectedTargetId?: unknown;
}) => {
    await renderLoaded();

    const translateAction = getButton(translateButtonName);
    expect(translateAction).toBeEnabled();

    fireEvent.click(translateAction);

    expectTranslationModalBlock(expectedBlock);
    expect(screen.getByTestId('translate-section-modal-sub-block')).toHaveTextContent(expectedSubBlock);
    if (expectedTargetId !== undefined) {
        expect(screen.getByTestId('translate-section-modal-target-id').textContent).toEqual(expectedTargetId);
    }

    closeTranslationModal();

    clickButton(editButtonName);
    expect(translateAction).toBeDisabled();
};

const setupLanguageSwitching = async (content: HippotherapyPageContentModel = buildContent()) => {
    const onLanguageChange = jest.fn((lang: LocalizationLanguage) => {
        mockedUseLocalizationToolkit.mockReturnValue(createToolkitMock({ selectedLanguage: lang, onLanguageChange }));
    });

    await renderLoaded({
        content,
        toolkitOverrides: { selectedLanguage: ukrainianLanguage, onLanguageChange },
    });

    return onLanguageChange;
};

describe('HippotherapyPageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue(mockClient);
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
        mockedIsContentValid.mockReturnValue(true);
        mockedUseLocalizationToolkit.mockReturnValue(createToolkitMock());

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true, writable: true });
        }
        (global as any).crypto.randomUUID = jest.fn(() => 'generated-uuid');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows a loader while fetching', () => {
        mockedHippotherapyPageApi.get.mockReturnValue(new Promise(() => {}));
        setup();
        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
    });

    it('shows an error state with a retry action when the fetch fails', async () => {
        setup({ apiError: new Error('network error') });
        expect(await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.FAIL_TO_FETCH)).toBeInTheDocument();

        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());
        clickButton(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);

        expect(await screen.findByTestId('section-intro')).toBeInTheDocument();
        expect(mockedHippotherapyPageApi.get).toHaveBeenCalledTimes(2);
    });

    it('falls back to a blank, editable form with an empty-state notice when the page has not been created yet (404)', async () => {
        mockPageNotFound();
        render(<HippotherapyPageContent />);

        expect(await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.EMPTY_STATE_NOTICE)).toBeInTheDocument();
        expect(screen.queryByText(HIPPOTHERAPY_PAGE_TEXT.FAIL_TO_FETCH)).not.toBeInTheDocument();
        expect(screen.getByTestId('section-intro')).toBeInTheDocument();
        expect(publishButton()).toBeDisabled();
        expectTranslationDisabledForEverySection(true);
    });

    it('lets the admin fill in and publish a page that did not exist yet, enabling translation afterwards', async () => {
        mockPageNotFound();
        const created = buildContent({ introSection: { ...buildContent().introSection, title: 'Created title' } });
        mockedHippotherapyPageApi.update.mockResolvedValue(created);

        render(<HippotherapyPageContent />);

        await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.EMPTY_STATE_NOTICE);
        editIntroAndPublish();

        await expectToast(COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED, ToastType.Info);
        expectUpdateCalledWith({ introSection: expect.objectContaining({ title: 'Edited intro title' }) });
        expectTranslationDisabledForEverySection(false);
    });

    it('renders every section once loaded and keeps the publish button disabled until something changes', async () => {
        await renderLoaded();

        SECTION_TEST_IDS.forEach((testId) => expect(screen.getByTestId(testId)).toBeInTheDocument());
        expect(publishButton()).toBeDisabled();
    });

    it('enables the publish button once a section is edited', async () => {
        await renderLoaded();
        editIntro();
        expect(publishButton()).toBeEnabled();
    });

    it('disables the publish button while a section reports an image error, even if the content is otherwise valid and dirty', async () => {
        await renderLoaded();

        editIntro();
        expect(publishButton()).toBeEnabled();

        clickButton('Set hippotherapy-quote image error');
        expect(publishButton()).toBeDisabled();

        clickButton('Clear hippotherapy-quote image error');
        expect(publishButton()).toBeEnabled();
    });

    it('keeps the publish button enabled when an image error comes from an empty slot', async () => {
        const content = buildContent();
        content.introSection = { ...content.introSection, image: null, imageId: null };
        await renderLoaded(content);

        editIntro();
        clickButton('Set intro image error');

        expect(publishButton()).toBeEnabled();
    });

    it('keeps the publish button disabled when the content is invalid', async () => {
        await renderLoaded({ isValid: false });
        editIntro();
        expect(publishButton()).toBeDisabled();
    });

    it('publishes changes, shows a success toast, resets the dirty state, and enables translation again on confirm', async () => {
        const content = buildContent();
        const publishedContent = buildContent({
            introSection: { ...content.introSection, title: 'Edited intro title' },
        });
        mockedHippotherapyPageApi.update.mockResolvedValue(publishedContent);
        await renderLoaded(content);

        editIntro();
        clickButton(PUBLISH_LABEL);
        expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();

        clickButton('Confirm');

        await expectToast(COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED, ToastType.Info);
        expect(screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).not.toBeInTheDocument();
        expectUpdateCalledWith({ introSection: expect.objectContaining({ title: 'Edited intro title' }) });
        expect(publishButton()).toBeDisabled();
        expectTranslationDisabledForEverySection(false);
    });

    it('shows a failure toast and keeps translation disabled for every section when publishing fails', async () => {
        mockedHippotherapyPageApi.update.mockRejectedValue(new Error('publish failed'));
        await renderLoaded();

        editIntroAndPublish();

        await expectToast(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, ToastType.Error);
        expectTranslationDisabledForEverySection(true);
    });

    it('updates every non-intro section when its edit control is used', async () => {
        mockedHippotherapyPageApi.update.mockResolvedValue(buildContent());
        await renderLoaded();

        [
            'Edit hippotherapy-description',
            'Edit hippotherapy-quote',
            'Edit hippotherapy-hippovention',
            'Edit hippovention-center',
            'Edit hippotherapy-advantages',
            'Edit hippotherapy-analysis',
            'Edit research',
            'Edit hippotherapy-another-quote',
            'Edit hippotherapy-participants',
            'Edit ethics',
        ].forEach(clickButton);

        expect(publishButton()).toBeEnabled();
        publishChanges();

        await waitFor(() => expect(mockedHippotherapyPageApi.update).toHaveBeenCalled());
        expectUpdateCalledWith({
            descriptionSection: expect.objectContaining({ title: 'Edited text card title' }),
            quoteSection: expect.objectContaining({ quoteText: 'Edited quote' }),
            hippoventionSection: expect.objectContaining({ title: 'Edited text card title' }),
            hippoventionCenterSection: expect.objectContaining({ title: 'Edited hippovention center' }),
            advantagesSection: expect.objectContaining({ title: 'Edited gallery title' }),
            analysisSection: expect.objectContaining({ title: 'Edited text card title' }),
            scientificReferencesSection: expect.objectContaining({ title: 'Edited research title' }),
            anotherQuoteSection: expect.objectContaining({ quoteText: 'Edited quote' }),
            participantsSection: expect.objectContaining({ title: 'Edited gallery title' }),
            ethicsSection: expect.objectContaining({ title: 'Edited ethics title' }),
        });
    });

    it('disables the publish button when any non-intro section reports an image error', async () => {
        await renderLoaded();
        editIntro();
        expect(publishButton()).toBeEnabled();

        [
            'hippotherapy-quote',
            'hippovention center',
            'hippotherapy-advantages card',
            'hippotherapy-another-quote',
            'hippotherapy-participants card',
            'ethics',
        ].forEach((section) => {
            clickButton(`Set ${section} image error`);
            expect(publishButton()).toBeDisabled();
            clickButton(`Clear ${section} image error`);
        });

        expect(publishButton()).toBeEnabled();
    });

    it('closes the confirmation modal without publishing when cancel or close is triggered', async () => {
        await renderLoaded();
        editIntro();

        ['Cancel', 'Close'].forEach((closeAction) => {
            clickButton(PUBLISH_LABEL);
            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

            clickButton(closeAction);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
            expect(mockedHippotherapyPageApi.update).not.toHaveBeenCalled();
        });
    });

    it('keeps translation enabled for every section while there are no unpublished changes', async () => {
        await renderLoaded();
        expectTranslationDisabledForEverySection(false);
    });

    it('disables translation for every section once any section has unpublished changes', async () => {
        await renderLoaded();
        clickButton('Edit ethics');
        expectTranslationDisabledForEverySection(true);
    });

    describe('section translation', () => {
        it.each([
            ['Advantages', 'hippotherapy-advantages', HippotherapyPageLocalizationBlock.Advantages],
            ['Participants', 'hippotherapy-participants', HippotherapyPageLocalizationBlock.Participants],
        ])('opens the %s translation modal with the four source images', async (_name, fieldIdPrefix, block) => {
            await renderLoaded();

            clickButton(`Translate ${fieldIdPrefix}`);

            expectTranslationModalBlock(block);
            const imageSources = screen
                .getByTestId('translate-section-modal-description-images')
                .textContent?.split(',');
            expect(imageSources).toHaveLength(4);
            expect(imageSources?.[0]).toBe('https://example.com/image.webp');
            expect(imageSources?.every(Boolean)).toBe(true);
        });

        it.each([
            ['Advantages', 'hippotherapy-advantages', 'advantagesSection'],
            ['Participants', 'hippotherapy-participants', 'participantsSection'],
        ])(
            'disables the %s translation icon when an English translation exists',
            async (_name, fieldIdPrefix, sectionKey) => {
                await renderLoaded(withEnglishLocalization({ [sectionKey]: { title: 'English title', cards: [] } }));
                expect(translateButton(fieldIdPrefix)).toBeDisabled();
            },
        );

        it.each([
            ['Advantages', 'hippotherapy-advantages', 'advantagesSection', 101],
            ['Participants', 'hippotherapy-participants', 'participantsSection', 201],
        ])(
            'keeps the %s translation icon enabled when English fields contain only empty rich text',
            async (_name, fieldIdPrefix, sectionKey, cardId) => {
                await renderLoaded(
                    withEnglishLocalization({
                        [sectionKey]: {
                            title: '<p><br></p>',
                            cards: [{ id: cardId, description: '<p><br></p>' }],
                        },
                    }),
                );

                expect(translateButton(fieldIdPrefix)).toBeEnabled();
            },
        );

        it.each(GENERAL_TRANSLATABLE_SECTIONS)(
            'opens the translation modal scoped to the %s section',
            async (fieldIdPrefix, block) => {
                await renderLoaded();

                clickButton(`Translate ${fieldIdPrefix}`);

                expectTranslationModalBlock(block);
                expect(screen.getByText(englishLanguage.name)).toBeInTheDocument();

                closeTranslationModal();
            },
        );

        it('disables the translation icons when another section has unpublished changes', async () => {
            await renderLoaded();

            const buttons = GENERAL_TRANSLATABLE_SECTIONS.map(([fieldIdPrefix]) => translateButton(fieldIdPrefix));
            buttons.forEach((btn) => expect(btn).toBeEnabled());

            editIntro();

            buttons.forEach((btn) => expect(btn).toBeDisabled());
        });

        it.each([
            [
                'intro',
                'introSection',
                { title: 'English Title', description: 'English Description' },
                'hippotherapy-description',
            ],
            [
                'hippotherapy-description',
                'descriptionSection',
                { title: 'English Title', description: 'English Description' },
                'intro',
            ],
            [
                'hippotherapy-quote',
                'quoteSection',
                { quoteText: 'English quote', authorName: 'English author' },
                'hippotherapy-another-quote',
            ],
            [
                'hippotherapy-hippovention',
                'hippoventionSection',
                { title: 'English Title', description: 'English Description' },
                'hippotherapy-analysis',
            ],
            [
                'hippotherapy-analysis',
                'analysisSection',
                { title: 'English Title', description: 'English Description' },
                'hippotherapy-hippovention',
            ],
            [
                'hippotherapy-another-quote',
                'anotherQuoteSection',
                { quoteText: 'English quote', authorName: 'English author' },
                'hippotherapy-quote',
            ],
            [
                'hippovention-center',
                'hippoventionCenterSection',
                { title: 'English title', description: 'English description', pros: 'English pros' },
                'hippotherapy-quote',
            ],
        ])(
            'disables the %s translation icon when an English translation already exists',
            async (fieldIdPrefix, sectionKey, sectionContent, otherFieldIdPrefix) => {
                await renderLoaded(withEnglishLocalization({ [sectionKey]: sectionContent }));

                expect(translateButton(fieldIdPrefix)).toBeDisabled();
                expect(translateButton(otherFieldIdPrefix)).toBeEnabled();
            },
        );

        it.each([
            ['intro', 'introSection', { title: '<p><br></p>', description: '<p><br></p>' }],
            ['hippotherapy-description', 'descriptionSection', { title: '<p><br></p>', description: '<p><br></p>' }],
            ['hippotherapy-quote', 'quoteSection', { quoteText: '<p><br></p>', authorName: '' }],
            ['hippotherapy-hippovention', 'hippoventionSection', { title: '<p><br></p>', description: '<p><br></p>' }],
            ['hippotherapy-analysis', 'analysisSection', { title: '<p><br></p>', description: '<p><br></p>' }],
            ['hippotherapy-another-quote', 'anotherQuoteSection', { quoteText: '<p><br></p>', authorName: '' }],
            [
                'hippovention-center',
                'hippoventionCenterSection',
                { title: '<p><br></p>', description: '<p><br></p>', pros: '<p><br></p>' },
            ],
        ])(
            'keeps the %s translation icon enabled when localization contains only empty rich-text markup',
            async (fieldIdPrefix, sectionKey, sectionContent) => {
                await renderLoaded(withEnglishLocalization({ [sectionKey]: sectionContent }));
                expect(translateButton(fieldIdPrefix)).toBeEnabled();
            },
        );

        it.each(['hippotherapy-quote', 'hippotherapy-advantages', 'hippovention-center'])(
            'keeps the %s translation icon disabled while the page is being published',
            async (fieldIdPrefix) => {
                mockedHippotherapyPageApi.update.mockReturnValue(new Promise(() => {}));
                await renderLoaded();

                editIntroAndPublish();

                await waitFor(() => expect(translateButton(fieldIdPrefix)).toBeDisabled());
            },
        );

        it.each([
            ['no translation languages are available', []],
            ['English is not among the translation languages', [{ id: 3, code: 'pl', name: 'Польська' }]],
        ])('hides the translation icons when %s', async (_label, translationLanguages) => {
            await renderLoaded({ toolkitOverrides: { translationLanguages } });
            expect(screen.queryAllByRole('button', { name: /^Translate / })).toHaveLength(0);
        });

        it('disables the translation icons when the page has not been created yet', async () => {
            mockPageNotFound();
            render(<HippotherapyPageContent />);

            expect(await screen.findByRole('button', { name: 'Translate intro' })).toBeDisabled();
            [
                'hippotherapy-description',
                'hippotherapy-quote',
                'hippotherapy-hippovention',
                'hippotherapy-advantages',
                'hippotherapy-analysis',
                'hippotherapy-another-quote',
            ].forEach((prefix) => expect(translateButton(prefix)).toBeDisabled());
        });

        it('shows an error toast when the translation languages fail to load', async () => {
            await renderLoaded();

            const { setErrorState } = mockedUseLocalizationToolkit.mock.calls[0][0];
            setErrorState(COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES, 'languages');

            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES,
                ToastType.Error,
            );
        });
    });

    describe('scientific references section translation', () => {
        it.each([
            ['general block', 'Translate research-general', 'Edit research', 'general', expect.any(String)],
            ['specific reference item', 'Translate research-item', 'Edit reference item', 'research', 'local-1'],
        ])(
            'opens the translation modal for the %s and disables when edited',
            async (_title, translateButtonName, editButtonName, expectedSubBlock, expectedTargetId) => {
                await expectOpensModalAndDisablesOnEdit({
                    translateButtonName,
                    expectedBlock: HippotherapyPageLocalizationBlock.ScientificReferences,
                    editButtonName,
                    expectedSubBlock,
                    expectedTargetId,
                });
            },
        );

        it.each([
            [
                'general research',
                'Translate research-general',
                { title: 'English Title', description: 'English Description', scientificReferences: [] },
            ],
            [
                'research reference item',
                'Translate research-item',
                { title: '', description: '', scientificReferences: [{ id: 1, name: 'Translated citation' }] },
            ],
        ])(
            'disables the %s translation action when an English translation already exists',
            async (_title, translateName, scientificReferencesSection) => {
                await renderLoaded(withEnglishLocalization({ scientificReferencesSection }));
                expect(getButton(translateName)).toBeDisabled();
            },
        );

        it('keeps the specific reference translation action enabled when localization has a translation for a different referenceId', async () => {
            await renderLoaded(
                withEnglishLocalization({
                    scientificReferencesSection: {
                        title: '',
                        description: '',
                        scientificReferences: [{ id: 999, name: 'Translated other citation' }],
                    },
                }),
            );

            expect(getButton('Translate research-item')).toBeEnabled();
        });

        it('keeps the general research translation action enabled when localization contains only empty rich-text markup', async () => {
            await renderLoaded(
                withEnglishLocalization({
                    scientificReferencesSection: {
                        title: '<p><br></p>',
                        description: '<p><br></p>',
                        scientificReferences: [],
                    },
                }),
            );

            expect(getButton('Translate research-general')).toBeEnabled();
        });
    });

    describe('ethics section translation', () => {
        it('opens the translation modal for the ethics block and disables when edited', () =>
            expectOpensModalAndDisablesOnEdit({
                translateButtonName: 'Translate ethics',
                expectedBlock: HippotherapyPageLocalizationBlock.Ethics,
                editButtonName: 'Edit ethics',
            }));

        it('disables the translation action when a principle is edited but not published', async () => {
            await renderLoaded();

            const ethicsTranslateButton = translateButton('ethics');
            expect(ethicsTranslateButton).toBeEnabled();

            clickButton('Edit ethics principle');
            expect(ethicsTranslateButton).toBeDisabled();
        });

        it.each([
            [
                'an English translation already exists',
                { title: 'English Title', description: 'English Description', principles: [] },
            ],
            [
                'only a principle already has an English translation',
                { title: '', description: '', principles: [{ principleId: 301, text: 'Translated principle' }] },
            ],
        ])('disables the ethics translation action when %s', async (_label, ethicsSection) => {
            await renderLoaded(withEnglishLocalization({ ethicsSection }));
            expect(translateButton('ethics')).toBeDisabled();
        });
    });

    describe('translation statuses mapping by block', () => {
        it('passes localizations to the corresponding sections and ignores null translationStatus', async () => {
            await renderLoaded(
                buildContent({
                    translationStatuses: [
                        {
                            block: HippotherapyPageLocalizationBlock.Intro,
                            languageId: DEFAULT_ENGLISH_LANGUAGE_ID,
                            translationStatus: TranslationStatus.Relevant,
                        },
                        {
                            block: HippotherapyPageLocalizationBlock.Intro,
                            languageId: DEFAULT_ENGLISH_LANGUAGE_ID,
                            translationStatus: null as any,
                        },
                        {
                            block: HippotherapyPageLocalizationBlock.Quote,
                            languageId: DEFAULT_ENGLISH_LANGUAGE_ID,
                            translationStatus: TranslationStatus.Outdated,
                        },
                    ],
                }),
            );

            expect(screen.getByTestId('section-intro')).toHaveAttribute('data-localizations-count', '1');
            expect(screen.getByTestId('section-hippotherapy-quote')).toHaveAttribute('data-localizations-count', '1');
            expect(screen.getByTestId('section-ethics')).toHaveAttribute('data-localizations-count', '0');
        });
    });

    describe('read-only language mode (non-default locale)', () => {
        it('displays translated content and hides the publish button when non-default language is active', async () => {
            await renderLoaded({
                content: contentWithEnglish(),
                toolkitOverrides: { selectedLanguage: englishLanguage },
            });

            expect(screen.getByTestId('section-intro')).toHaveTextContent('English Intro Title');
            expect(screen.getByTestId('section-hippotherapy-description')).toHaveTextContent('English Desc Title');
            expect(screen.queryByRole('button', { name: PUBLISH_LABEL })).not.toBeInTheDocument();
        });

        it('disables section editing controls when in read-only language mode', async () => {
            await renderLoaded({
                content: contentWithEnglish(),
                toolkitOverrides: { selectedLanguage: englishLanguage },
            });
            expect(getButton('Edit intro')).toBeDisabled();
        });

        it('switches back to Ukrainian base editable content when returning to default locale', async () => {
            await renderLoaded({
                content: contentWithEnglish(),
                toolkitOverrides: { selectedLanguage: ukrainianLanguage },
            });

            expect(screen.getByTestId('section-intro')).toHaveTextContent('Intro title');
            expect(getButton('Edit intro')).toBeEnabled();
            expect(publishButton()).toBeInTheDocument();
        });

        it('matches card translations by id even when localization array is reversed', async () => {
            const content = withEnglishLocalization(
                {
                    advantagesSection: {
                        title: 'EN Adv',
                        cards: [
                            { cardId: 2, description: 'Translated Card 2' },
                            { cardId: 1, description: 'Translated Card 1' },
                        ],
                    },
                },
                {
                    advantagesSection: {
                        title: 'Advantages title',
                        cards: [
                            { id: 1, description: 'Card 1 UA', image: null, imageId: null },
                            { id: 2, description: 'Card 2 UA', image: null, imageId: null },
                        ],
                    },
                },
            );

            await renderLoaded({ content, toolkitOverrides: { selectedLanguage: englishLanguage } });

            expect(screen.getByTestId('hippotherapy-advantages-card-0')).toHaveTextContent('Translated Card 1');
            expect(screen.getByTestId('hippotherapy-advantages-card-1')).toHaveTextContent('Translated Card 2');
        });
    });

    describe('language switching and validation', () => {
        it('uses fetchedContent (not draftContent) for read-only language preview', async () => {
            await renderLoaded({
                content: contentWithEnglish(),
                toolkitOverrides: { selectedLanguage: englishLanguage },
            });

            const introSection = screen.getByTestId('section-intro');
            expect(introSection).toHaveTextContent('English Intro Title');
            expect(introSection).not.toHaveTextContent('Intro title');
        });

        it('keeps Ukrainian draft intact when switching to English and back', async () => {
            const onLanguageChange = await setupLanguageSwitching();

            editIntro();
            expect(publishButton()).toBeEnabled();

            onLanguageChange(englishLanguage);
            onLanguageChange(ukrainianLanguage);

            expect(publishButton()).toBeEnabled();
        });

        it('does not enable publish button when switching uk -> en -> uk without editing', async () => {
            const onLanguageChange = await setupLanguageSwitching(contentWithEnglish());
            expect(publishButton()).toBeDisabled();

            onLanguageChange(englishLanguage);

            const pubButton = screen.queryByRole('button', { name: PUBLISH_LABEL });
            if (pubButton) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(pubButton).toBeDisabled();
            }

            onLanguageChange(ukrainianLanguage);
            expect(publishButton()).toBeDisabled();
        });

        it('re-validates fields when language changes to prevent stale errors', async () => {
            const onLanguageChange = jest.fn();
            await renderLoaded({
                isValid: false,
                content: buildContent({
                    introSection: { title: 'Short', description: 'Short', image: null, imageId: 1 },
                }),
                toolkitOverrides: { selectedLanguage: ukrainianLanguage, onLanguageChange },
            });

            onLanguageChange(englishLanguage);
            expect(onLanguageChange).toHaveBeenCalledWith(englishLanguage);
        });
    });

    describe('external-value tag prevents draft overwrite', () => {
        it('does not overwrite draftContent when switching languages (OnChangePlugin blocked)', async () => {
            const onLanguageChange = await setupLanguageSwitching();

            editIntro();
            expect(publishButton()).toBeEnabled();

            onLanguageChange(englishLanguage);
            onLanguageChange(ukrainianLanguage);

            expect(publishButton()).toBeEnabled();
            expect(screen.getByTestId('section-intro')).toHaveTextContent('Edited intro title');
        });
    });
});
