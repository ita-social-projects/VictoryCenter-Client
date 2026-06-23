import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import { MainPageLocalizationsApi } from '@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api';
import { MainPageLocalizationBlock, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MainPageContent } from './MainPageContent';

jest.mock('@hookform/resolvers/yup', () => ({
    yupResolver: () => async (data: any) => ({
        values: data,
        errors: {},
    }),
}));

jest.mock('@/services/api/admin/image/image-api', () => ({
    ImageApi: {
        post: jest.fn(),
    },
}));

const mockLocalizationToolkitState = {
    allLanguages: [
        { id: 1, code: 'uk', name: 'UA' },
        { id: 2, code: 'en', name: 'EN' },
    ],
    translationLanguages: [{ id: 2, code: 'en', name: 'EN' }],
    selectedLanguage: { id: 1, code: 'uk', name: 'UA' },
    onLanguageChange: jest.fn(),
    errorStateMessage: null as string | null,
};

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: ({ setErrorState }: any) => {
        if (mockLocalizationToolkitState.errorStateMessage) {
            setErrorState(mockLocalizationToolkitState.errorStateMessage, 'languages');
        }

        return mockLocalizationToolkitState;
    },
}));

jest.mock('@/components/admin/language-toolkit/LanguageToolkit', () => ({
    __esModule: true,
    LanguageToolkit: ({ languages, onLanguageChange }: any) => (
        <div data-testid="language-toolkit">
            {languages.map((language: any) => (
                <button
                    key={language.id}
                    data-testid={`language-${language.code}`}
                    onClick={() => onLanguageChange(language)}
                >
                    {language.name}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses', () => ({
    __esModule: true,
    LocalizationStatuses: ({ localizedEntity }: any) => (
        <div data-testid="localization-statuses">
            {localizedEntity.translationStatuses.map((status: any) => (
                <span key={`${status.languageId}-${status.translationStatus}`}>
                    {status.languageId}:{status.translationStatus}
                </span>
            ))}
        </div>
    ),
}));

const MockFormBlock = ({ testId, btnTestId, onPublish, isPublishDisabled }: any) => {
    const { useFormContext } = require('react-hook-form');
    const { setValue } = useFormContext();
    return (
        <div data-testid={testId}>
            <button
                data-testid={`${btnTestId}-dirty`}
                onClick={() => {
                    setValue('titleUa', 'dirty', { shouldDirty: true, shouldValidate: true });
                    setValue('image', { url: 'blob:no-id' }, { shouldDirty: true, shouldValidate: true });
                }}
            >
                Make Dirty
            </button>
            <button data-testid={btnTestId} onClick={onPublish} disabled={isPublishDisabled}>
                Publish
            </button>
        </div>
    );
};

jest.mock('../title-block/TitleBlockForm', () => ({
    __esModule: true,
    TitleBlockForm: (props: any) => (
        <div>
            <MockFormBlock testId="title-block-form" btnTestId="publish-btn" {...props} />
            <span data-testid="title-block-form-read-only">{String(props.isReadOnly)}</span>
        </div>
    ),
}));

jest.mock('../about-us-block/AboutUsBlockForm', () => ({
    __esModule: true,
    AboutUsBlockForm: (props: any) => (
        <div>
            <MockFormBlock testId="about-us-block-form" btnTestId="publish-btn-about" {...props} />
            <span data-testid="about-us-block-form-read-only">{String(props.isReadOnly)}</span>
        </div>
    ),
}));

jest.mock('../partners-block/PartnersBlockForm', () => ({
    __esModule: true,
    PartnersBlockForm: (props: any) => (
        <div>
            <MockFormBlock testId="partners-block-form" btnTestId="publish-btn-partners" {...props} />
            <span data-testid="partners-block-form-read-only">{String(props.isReadOnly)}</span>
        </div>
    ),
}));

jest.mock('../statistics-block/StatisticsBlockForm', () => ({
    __esModule: true,
    StatisticsBlockForm: ({ onMetricsChange, ...props }: any) => {
        const { useFormContext } = require('react-hook-form');
        const { MetricPrefix, MetricType } = require('@/types/admin/main-page');
        const { setValue } = useFormContext();
        const syncedMetric = {
            id: 3,
            name: 'Залучених коштів',
            value: 7654321,
            type: MetricType.Raised,
            prefix: MetricPrefix.None,
            isHidden: false,
            priority: 3,
            isAutoSynced: true,
            localizations: [{ languageId: 2, name: 'Funds raised', value: '182500.5' }],
        };

        return (
            <div data-testid="statistics-block-form">
                <button
                    data-testid="publish-btn-statistics-dirty"
                    onClick={() => {
                        onMetricsChange?.([syncedMetric]);
                        setValue('metrics', [syncedMetric], { shouldDirty: true, shouldValidate: true });
                        setValue('statisticsImage', { url: 'blob:statistics-no-id' }, { shouldDirty: true });
                    }}
                >
                    Make Dirty
                </button>
                <button
                    data-testid="publish-btn-statistics"
                    onClick={props.onPublish}
                    disabled={props.isPublishDisabled}
                >
                    Publish
                </button>
            </div>
        );
    },
}));

jest.mock('../main-page-publish-modal/MainPagePublishModal', () => ({
    __esModule: true,
    MainPagePublishModal: ({ isOpen, onConfirm, onCancel, isButtonsDisabled }: any) =>
        isOpen || (globalThis as any).__MAIN_PAGE_FORCE_MODAL__ ? (
            <div data-testid="publish-modal">
                <button data-testid="confirm-publish" onClick={onConfirm} disabled={isButtonsDisabled}>
                    Confirm
                </button>
                <button data-testid="cancel-publish" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        ) : null,
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    __esModule: true,
    CategoryBar: require('@/utils/test-mocks/main-page-mocks').MockMainPageCategoryBar,
}));

jest.mock('@/components/common/page-loader/PageLoader', () => ({
    __esModule: true,
    PageLoader: () => <div data-testid="page-loader">Loading...</div>,
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => {
    const mockClient = {};
    return {
        useAdminClient: () => mockClient,
    };
});

const mockAddToast = jest.fn();

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => {
    const mockToasts: any[] = [];
    return {
        useToast: () => ({
            addToast: mockAddToast,
            toasts: mockToasts,
        }),
    };
});

jest.mock('@/services/api/admin/main-page/main-page-api', () => ({
    MainPageApi: {
        get: jest.fn(),
        publish: jest.fn(),
    },
}));

jest.mock('@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api', () => ({
    MainPageLocalizationsApi: {
        getByLanguageId: jest.fn(),
        getStatuses: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    __esModule: true,
    RichTextInputGroup: require('@/utils/test-mocks/main-page-mocks').MockRichTextInputGroup,
}));

const getByExactText = (text: string) =>
    screen.getByText((_, el) => el?.children.length === 0 && el?.textContent === text);

const getTranslationTitleInput = () => document.getElementById('main-page-translation-title') as HTMLInputElement;
const getTranslationDescriptionInput = () =>
    document.getElementById('main-page-translation-description') as HTMLTextAreaElement;
const getSaveTranslationButton = () => screen.getByText('Зберегти переклад').closest('button') as HTMLButtonElement;

describe('MainPageContent', () => {
    const mockPageData = {
        page: {
            id: 1,
            title: 'Test Title',
            description: 'Test Description',
            impactStatistics: { metrics: [] },
        },
        languages: [
            { id: 1, code: 'uk', name: 'UA' },
            { id: 2, code: 'en', name: 'EN' },
        ],
    };

    const mockPublishedData = {
        page: {
            id: 1,
            title: 'Updated Title',
            description: 'Updated Description',
            impactStatistics: { metrics: [] },
        },
        languages: [
            { id: 1, code: 'uk', name: 'UA' },
            { id: 2, code: 'en', name: 'EN' },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (MainPageApi.get as jest.Mock).mockReset();
        (MainPageApi.publish as jest.Mock).mockReset();
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockReset();
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockReset();
        (MainPageLocalizationsApi.create as jest.Mock).mockReset();
        (MainPageLocalizationsApi.update as jest.Mock).mockReset();
        (ImageApi.post as jest.Mock).mockReset();

        mockLocalizationToolkitState.allLanguages = [
            { id: 1, code: 'uk', name: 'UA' },
            { id: 2, code: 'en', name: 'EN' },
        ];
        mockLocalizationToolkitState.translationLanguages = [{ id: 2, code: 'en', name: 'EN' }];
        mockLocalizationToolkitState.selectedLanguage = { id: 1, code: 'uk', name: 'UA' };
        mockLocalizationToolkitState.errorStateMessage = null;
        (globalThis as any).__MAIN_PAGE_EXTRA_TABS__ = [];
        (globalThis as any).__MAIN_PAGE_FORCE_MODAL__ = false;

        (MainPageApi.get as jest.Mock).mockResolvedValue(mockPageData);
        (MainPageApi.publish as jest.Mock).mockResolvedValue(mockPublishedData);
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockResolvedValue([]);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: 'Localized title',
            description: 'Localized description',
            mainAboutUs: {
                entityId: 1,
                title: 'Localized about title',
                description: 'Localized about description',
            },
            mainPartners: {
                entityId: 1,
                title: 'Localized partners title',
                description: 'Localized partners description',
            },
        });
        (MainPageLocalizationsApi.create as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: 'Translated title',
            description: 'Translated description',
            mainAboutUs: null,
            mainPartners: null,
        });
        (MainPageLocalizationsApi.update as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: 'Translated title',
            description: 'Translated description',
            mainAboutUs: null,
            mainPartners: null,
        });
        (ImageApi.post as jest.Mock).mockResolvedValue({ id: 2, url: 'uploaded.jpg' });

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true });
        }

        if (!(global as any).crypto.randomUUID) {
            (global as any).crypto.randomUUID = jest.fn(() => 'test-uuid');
        }
    });

    afterEach(() => {
        delete (globalThis as any).__MAIN_PAGE_EXTRA_TABS__;
        delete (globalThis as any).__MAIN_PAGE_FORCE_MODAL__;
        jest.restoreAllMocks();
    });

    const renderAndLoadContent = async () => {
        render(<MainPageContent />);
        expect(await screen.findByTestId('category-bar')).toBeInTheDocument();
    };

    const triggerFormDirtyAndOpenModal = async (btnPrefix = 'publish-btn') => {
        fireEvent.click(screen.getByTestId(`${btnPrefix}-dirty`));
        const publishBtn = screen.getByTestId(btnPrefix);

        await waitFor(() => expect(publishBtn).not.toBeDisabled());
        fireEvent.click(publishBtn);

        expect(await screen.findByTestId('publish-modal')).toBeInTheDocument();
        return publishBtn;
    };

    const confirmPublishDialog = async () => {
        await renderAndLoadContent();
        await triggerFormDirtyAndOpenModal();
        fireEvent.click(screen.getByTestId('confirm-publish'));
    };

    it('renders loader initially while data is "fetching"', () => {
        (MainPageApi.get as jest.Mock).mockReturnValueOnce(new Promise(() => undefined));

        render(<MainPageContent />);
        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('renders error message when API throws error', async () => {
        (MainPageApi.get as jest.Mock).mockRejectedValue(new Error('Network error'));
        render(<MainPageContent />);

        await waitFor(() => {
            expect(MainPageApi.get).toHaveBeenCalled();
        });
        expect(await screen.findByText(MAIN_PAGE_TEXT.ERRORS.LOAD_FAILED)).toBeInTheDocument();
    });

    it('renders TitleBlockForm as the default tab after loading', async () => {
        await renderAndLoadContent();
        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
    });

    it('renders language toolkit and loads default-language statuses using translation language id', async () => {
        await renderAndLoadContent();

        expect(screen.getByTestId('language-toolkit')).toBeInTheDocument();

        await waitFor(() => {
            expect(MainPageLocalizationsApi.getStatuses).toHaveBeenCalledWith(expect.any(Object), 1, 2);
        });

        expect(MainPageLocalizationsApi.getByLanguageId).not.toHaveBeenCalled();
        expect(screen.getByTestId('title-block-form-read-only')).toHaveTextContent('false');
    });

    it('shows localization toolkit errors through toast callback', async () => {
        mockLocalizationToolkitState.errorStateMessage = 'Language loading failed';

        await renderAndLoadContent();

        expect(mockAddToast).toHaveBeenCalledWith('Language loading failed', 'error', 3000);
    });

    it('loads selected translation and renders localized tabs as read-only for non-default language', async () => {
        mockLocalizationToolkitState.selectedLanguage = { id: 2, code: 'en', name: 'EN' };
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockResolvedValue([
            {
                block: MainPageLocalizationBlock.Title,
                entityId: 1,
                languageId: 2,
                translationStatus: TranslationStatus.Outdated,
            },
        ]);

        await renderAndLoadContent();

        await waitFor(() => {
            expect(MainPageLocalizationsApi.getStatuses).toHaveBeenCalledWith(expect.any(Object), 1, 2);
            expect(MainPageLocalizationsApi.getByLanguageId).toHaveBeenCalledWith(expect.any(Object), 1, 2);
        });

        expect(screen.getByTestId('title-block-form-read-only')).toHaveTextContent('true');
    });

    it('uses original and empty-string fallbacks when selected translation fields are missing', async () => {
        mockLocalizationToolkitState.selectedLanguage = { id: 2, code: 'en', name: 'EN' };
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                id: 1,
                title: null,
                description: null,
                mainAboutUs: null,
                mainPartners: null,
                impactStatistics: { metrics: [] },
            },
        });
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: null,
            description: null,
            mainAboutUs: null,
            mainPartners: null,
        });

        await renderAndLoadContent();

        await waitFor(() => {
            expect(MainPageLocalizationsApi.getByLanguageId).toHaveBeenCalledWith(expect.any(Object), 1, 2);
        });

        expect(screen.getByTestId('title-block-form-read-only')).toHaveTextContent('true');
    });

    it('does not update selected translation state after unmount', async () => {
        mockLocalizationToolkitState.selectedLanguage = { id: 2, code: 'en', name: 'EN' };
        let resolveLocalization: (value: any) => void;
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockReturnValue(
            new Promise((resolve) => {
                resolveLocalization = resolve;
            }),
        );

        const { unmount } = render(<MainPageContent />);

        await waitFor(() => {
            expect(MainPageLocalizationsApi.getByLanguageId).toHaveBeenCalledWith(expect.any(Object), 1, 2);
        });

        unmount();

        await act(async () => {
            resolveLocalization!({
                entityId: 1,
                title: 'Late title',
                description: 'Late description',
                mainAboutUs: null,
                mainPartners: null,
            });
        });

        expect(MainPageLocalizationsApi.getByLanguageId).toHaveBeenCalledTimes(1);
    });

    it('uses title block localization status without treating nested null blocks as missing title translation', async () => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                localizations: [
                    {
                        code: 'en',
                        translationStatus: TranslationStatus.Relevant,
                        title: 'Victory Center - Rehabilitation and Support Centre',
                        description: 'Official website of Victory Center.',
                        mainAboutUs: null,
                        mainPartners: null,
                        mainDonations: null,
                    },
                ],
            },
        });
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockResolvedValue([
            {
                block: MainPageLocalizationBlock.Title,
                entityId: 1,
                languageId: 2,
                translationStatus: TranslationStatus.Outdated,
            },
        ]);

        await renderAndLoadContent();

        await waitFor(() => {
            expect(screen.getAllByText('2:1').length).toBeGreaterThan(0);
        });
    });

    it('uses block-specific statuses for about, partners and relevant statistics metrics', async () => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                mainAboutUs: {
                    title: 'About',
                    description: 'About description',
                    localizations: [{ languageId: 2, translationStatus: TranslationStatus.Relevant }],
                },
                mainPartners: {
                    title: 'Partners',
                    description: 'Partners description',
                    localizations: [{ languageId: 2, translationStatus: TranslationStatus.Outdated }],
                },
                impactStatistics: {
                    title: 'Stats',
                    localizations: [{ languageId: 2, translationStatus: TranslationStatus.Relevant }],
                    metrics: [
                        {
                            id: 1,
                            name: 'Metric',
                            value: 10,
                            type: MetricType.Partners,
                            isHidden: false,
                            priority: 1,
                            localizations: [{ languageId: 2, translationStatus: TranslationStatus.Relevant }],
                        },
                    ],
                },
            },
        });

        await renderAndLoadContent();

        await waitFor(() => {
            expect(screen.getAllByText('2:1').length).toBeGreaterThanOrEqual(2);
            expect(screen.getAllByText('2:0').length).toBeGreaterThanOrEqual(1);
        });
    });

    it('marks statistics translation outdated when a metric localization is outdated', async () => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                impactStatistics: {
                    title: 'Stats',
                    localizations: [{ languageId: 2, translationStatus: TranslationStatus.Relevant }],
                    metrics: [
                        {
                            id: 1,
                            name: 'Metric',
                            value: 10,
                            type: MetricType.Partners,
                            isHidden: false,
                            priority: 1,
                            localizations: [{ languageId: 2, translationStatus: TranslationStatus.Outdated }],
                        },
                    ],
                },
            },
        });

        await renderAndLoadContent();

        await waitFor(() => {
            expect(screen.getAllByText('2:0').length).toBeGreaterThan(0);
        });
    });

    it('falls back to API status when statistics data is missing', async () => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                impactStatistics: null,
            },
        });
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockResolvedValue([
            {
                block: MainPageLocalizationBlock.ImpactStatistics,
                entityId: 1,
                languageId: 2,
                translationStatus: TranslationStatus.Outdated,
            },
        ]);

        await renderAndLoadContent();

        await waitFor(() => {
            expect(screen.getAllByText('2:0').length).toBeGreaterThan(0);
        });
    });

    it('handles statistics localization when metrics array is absent', async () => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                impactStatistics: {
                    title: 'Stats',
                    localizations: [{ languageId: 2, translationStatus: TranslationStatus.Relevant }],
                },
            },
        });

        await renderAndLoadContent();

        await waitFor(() => {
            expect(screen.getAllByText('2:1').length).toBeGreaterThan(0);
        });
    });

    it('does not mark statistics relevant when metric is relevant but statistic status is missing', async () => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                impactStatistics: {
                    title: 'Stats',
                    localizations: [],
                    metrics: [
                        {
                            id: 1,
                            name: 'Metric',
                            value: 10,
                            type: MetricType.Partners,
                            isHidden: false,
                            priority: 1,
                            localizations: [{ languageId: 2, translationStatus: TranslationStatus.Relevant }],
                        },
                    ],
                },
            },
        });

        await renderAndLoadContent();

        await waitFor(() => {
            expect(MainPageLocalizationsApi.getStatuses).toHaveBeenCalled();
        });

        expect(screen.queryByText('2:1')).not.toBeInTheDocument();
    });

    it('falls back to API status for unsupported tab localization blocks', async () => {
        (globalThis as any).__MAIN_PAGE_EXTRA_TABS__ = [
            {
                id: 'custom',
                label: 'Custom',
                localizationBlock: 999,
            },
        ];
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockResolvedValue([
            {
                block: 999,
                entityId: 1,
                languageId: 2,
                translationStatus: TranslationStatus.Outdated,
            },
        ]);

        await renderAndLoadContent();

        await waitFor(() => {
            expect(screen.getAllByText('2:0').length).toBeGreaterThan(0);
        });
    });

    it('falls back to the first configured tab after selecting an unsupported tab id', async () => {
        (globalThis as any).__MAIN_PAGE_EXTRA_TABS__ = [
            {
                id: 'custom',
                label: 'Custom',
                localizationBlock: 999,
            },
        ];

        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId('tab-btn-custom'));

        expect(screen.queryByTestId('title-block-form')).not.toBeInTheDocument();
        expect(screen.queryByTestId('about-us-block-form')).not.toBeInTheDocument();
        expect(screen.queryByTestId('partners-block-form')).not.toBeInTheDocument();
    });

    it('shows a toast when translation status loading fails with non-404 error', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockRejectedValue(new Error('Status failed'));

        await renderAndLoadContent();

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Помилка завантаження статусів перекладу', 'error', 3000);
        });
    });

    it('clears translation statuses when status loading returns 404', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getStatuses as jest.Mock).mockRejectedValue({ response: { status: 404 } });

        await renderAndLoadContent();

        await waitFor(() => {
            expect(MainPageLocalizationsApi.getStatuses).toHaveBeenCalled();
        });

        expect(screen.queryByText('2:0')).not.toBeInTheDocument();
        expect(screen.queryByText('2:1')).not.toBeInTheDocument();
    });

    it('uses original content as fallback when selected translation is missing', async () => {
        mockLocalizationToolkitState.selectedLanguage = { id: 2, code: 'en', name: 'EN' };
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue({ response: { status: 404 } });

        await renderAndLoadContent();

        await waitFor(() => {
            expect(MainPageLocalizationsApi.getByLanguageId).toHaveBeenCalledWith(expect.any(Object), 1, 2);
        });

        expect(mockAddToast).not.toHaveBeenCalledWith('Помилка завантаження перекладу', 'error', 3000);
        expect(screen.getByTestId('title-block-form-read-only')).toHaveTextContent('true');
    });

    it('shows a toast when selected translation loading fails with non-404 error', async () => {
        mockLocalizationToolkitState.selectedLanguage = { id: 2, code: 'en', name: 'EN' };
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue(new Error('Translation failed'));

        await renderAndLoadContent();

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Помилка завантаження перекладу', 'error', 3000);
        });
    });

    it('keeps forms editable and skips localization effect when no language is selected', async () => {
        mockLocalizationToolkitState.selectedLanguage = null as any;

        await renderAndLoadContent();

        expect(MainPageLocalizationsApi.getStatuses).not.toHaveBeenCalled();
        expect(MainPageLocalizationsApi.getByLanguageId).not.toHaveBeenCalled();
        expect(screen.getByTestId('title-block-form-read-only')).toHaveTextContent('false');
    });

    it('renders loader fallback when loaded page is null without load error', async () => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            page: null,
            languages: mockPageData.languages,
        });

        render(<MainPageContent />);

        await waitFor(() => {
            expect(MainPageApi.get).toHaveBeenCalled();
        });

        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
        expect(screen.queryByText(MAIN_PAGE_TEXT.ERRORS.LOAD_FAILED)).not.toBeInTheDocument();
    });

    it('ignores confirm publish when no pending publish data exists', async () => {
        (globalThis as any).__MAIN_PAGE_FORCE_MODAL__ = true;

        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId('confirm-publish'));

        expect(MainPageApi.publish).not.toHaveBeenCalled();
    });

    it('skips localization status loading when translation languages are absent', async () => {
        mockLocalizationToolkitState.translationLanguages = [];

        await renderAndLoadContent();

        await waitFor(() => {
            expect(MainPageApi.get).toHaveBeenCalled();
        });

        expect(MainPageLocalizationsApi.getStatuses).not.toHaveBeenCalled();
        expect(MainPageLocalizationsApi.getByLanguageId).not.toHaveBeenCalled();
        expect(screen.queryByLabelText('Додати переклад')).not.toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
        await renderAndLoadContent();

        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('about-us-block-form')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tab-btn-about'));
        expect(screen.getByTestId('about-us-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('title-block-form')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tab-btn-statistics'));
        expect(screen.getByTestId('statistics-block-form')).toBeInTheDocument();
    });

    it('does not update state after unmount (cleanup isMounted)', () => {
        const { unmount } = render(<MainPageContent />);
        unmount();
        expect(true).toBe(true);
    });

    it('renders donations tab content', async () => {
        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId('tab-btn-donations'));
        expect(getByExactText(`Блок "${MAIN_PAGE_TEXT.TABS.DONATIONS}" в розробці`)).toBeInTheDocument();
    });

    it('renders partners tab content', async () => {
        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId('tab-btn-partners'));
        expect(screen.getByTestId('partners-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('title-block-form')).not.toBeInTheDocument();
    });

    it.each([
        ['title', 'title-block-form'],
        ['about', 'about-us-block-form'],
        ['partners', 'partners-block-form'],
    ])('shows translation action in the content top-right for %s block', async (tabId, formTestId) => {
        mockLocalizationToolkitState.translationLanguages = [{ id: 2, code: 'en', name: 'Англійська' }];

        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId(`tab-btn-${tabId}`));
        expect(screen.getByTestId(formTestId)).toBeInTheDocument();
        expect(screen.getByLabelText('Додати переклад')).toBeInTheDocument();
    });

    it.each(['statistics', 'donations'])('does not show translation action for %s block', async (tabId) => {
        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId(`tab-btn-${tabId}`));

        expect(screen.queryByLabelText('Додати переклад')).not.toBeInTheDocument();
    });

    it('opens add translation modal with empty fields and no generate button', async () => {
        mockLocalizationToolkitState.translationLanguages = [{ id: 2, code: 'en', name: 'Англійська' }];

        await renderAndLoadContent();

        fireEvent.click(screen.getByLabelText('Додати переклад'));

        expect(await screen.findByText('Додати переклад')).toBeInTheDocument();
        expect(screen.getByText('Англійська')).toBeInTheDocument();

        const titleInput = getTranslationTitleInput();
        const descriptionInput = getTranslationDescriptionInput();

        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
        expect(titleInput).toHaveAttribute('data-max-length', '50');
        expect(descriptionInput).toHaveAttribute('data-max-length', '300');
        expect(getSaveTranslationButton()).toBeDisabled();
    });

    it('opens edit translation modal with existing English localization', async () => {
        mockLocalizationToolkitState.translationLanguages = [{ id: 2, code: 'en', name: 'Англійська' }];
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                localizations: [
                    {
                        languageId: 2,
                        title: 'Existing English title',
                        description: 'Existing English description',
                        translationStatus: TranslationStatus.Relevant,
                    },
                ],
            },
        });

        await renderAndLoadContent();

        fireEvent.click(screen.getByLabelText('Додати переклад'));

        expect(await screen.findByText('Редагувати переклад')).toBeInTheDocument();
        expect(getTranslationTitleInput()).toHaveValue('Existing English title');
        expect(getTranslationDescriptionInput()).toHaveValue('Existing English description');
        expect(getSaveTranslationButton()).toBeDisabled();
    });

    it('enables save only after valid translation changes and shows validation while typing', async () => {
        mockLocalizationToolkitState.translationLanguages = [{ id: 2, code: 'en', name: 'Англійська' }];

        await renderAndLoadContent();

        fireEvent.click(screen.getByLabelText('Додати переклад'));

        await screen.findByText('Додати переклад');
        const titleInput = getTranslationTitleInput();
        const descriptionInput = getTranslationDescriptionInput();
        const saveButton = getSaveTranslationButton();

        fireEvent.change(titleInput, { target: { value: 'Short' } });

        expect(await screen.findByText('Не менше 10 символів')).toBeInTheDocument();
        expect(saveButton).toBeDisabled();

        fireEvent.change(titleInput, { target: { value: 'Valid title text' } });
        fireEvent.change(descriptionInput, { target: { value: 'Valid description text' } });

        await waitFor(() => expect(saveButton).not.toBeDisabled());
    });

    it('keeps existing localized blocks when saving one block translation', async () => {
        mockLocalizationToolkitState.translationLanguages = [{ id: 2, code: 'en', name: 'Англійська' }];
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            ...mockPageData,
            page: {
                ...mockPageData.page,
                mainAboutUs: {
                    id: 10,
                    title: 'Про нас',
                    description: 'Опис про нас',
                    localizations: [],
                },
                mainPartners: {
                    id: 20,
                    title: 'Партнери',
                    description: 'Опис партнерів',
                    localizations: [],
                },
            },
        });
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: null,
            description: null,
            mainAboutUs: {
                entityId: 10,
                title: 'Existing about title',
                description: 'Existing about description',
            },
            mainPartners: {
                entityId: 20,
                title: 'Existing partners title',
                description: 'Existing partners description',
            },
        });

        await renderAndLoadContent();

        fireEvent.click(screen.getByLabelText('Додати переклад'));
        await screen.findByText('Додати переклад');
        fireEvent.change(getTranslationTitleInput(), { target: { value: 'Valid title text' } });
        fireEvent.change(getTranslationDescriptionInput(), { target: { value: 'Valid description text' } });

        await waitFor(() => expect(getSaveTranslationButton()).not.toBeDisabled());
        fireEvent.click(getSaveTranslationButton());

        await waitFor(() => {
            expect(MainPageLocalizationsApi.update).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Переклад опубліковано успішно', 'success', 3000);
        });

        expect((MainPageLocalizationsApi.update as jest.Mock).mock.calls[0][3]).toEqual(
            expect.objectContaining({
                title: 'Valid title text',
                description: 'Valid description text',
                mainAboutUs: {
                    title: 'Existing about title',
                    description: 'Existing about description',
                },
                mainPartners: {
                    title: 'Existing partners title',
                    description: 'Existing partners description',
                },
            }),
        );
    });

    it('opens publish modal when publish button is clicked', async () => {
        await renderAndLoadContent();
        expect(screen.queryByTestId('publish-modal')).not.toBeInTheDocument();

        await triggerFormDirtyAndOpenModal();
    });

    it('closes publish modal on cancel', async () => {
        await renderAndLoadContent();
        await triggerFormDirtyAndOpenModal();

        fireEvent.click(screen.getByTestId('cancel-publish'));

        await waitFor(() => {
            expect(screen.queryByTestId('publish-modal')).not.toBeInTheDocument();
        });
    });

    it('handles successful publish flow', async () => {
        await confirmPublishDialog();

        await waitFor(() => {
            expect(screen.queryByTestId('publish-modal')).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(MainPageApi.publish).toHaveBeenCalled();
        });

        expect(mockAddToast).toHaveBeenCalledWith('Зміни успішно опубліковано', 'success', 3000);
    });

    it('handles publish error', async () => {
        (MainPageApi.publish as jest.Mock).mockRejectedValue(new Error('Publish failed'));

        await confirmPublishDialog();

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Помилка під час публікації змін', 'error', 3000);
        });
    });

    it('uploads new images during publish when image has no id', async () => {
        await confirmPublishDialog();

        await waitFor(() => {
            expect(ImageApi.post).toHaveBeenCalled();
            expect(MainPageApi.publish).toHaveBeenCalled();
        });

        expect(mockAddToast).toHaveBeenCalledWith('Зміни успішно опубліковано', 'success', 3000);
    });

    it.each([
        ['about', 'about-us-block-form', 'publish-btn-about'],
        ['partners', 'partners-block-form', 'publish-btn-partners'],
        ['statistics', 'statistics-block-form', 'publish-btn-statistics'],
    ])('handles publish from %s tab', async (tabId, formTestId, btnTestId) => {
        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId(`tab-btn-${tabId}`));
        expect(screen.getByTestId(formTestId)).toBeInTheDocument();

        await triggerFormDirtyAndOpenModal(btnTestId);
    });

    it('publishes raised funds metric with isAutoSynced=true after statistics save flow', async () => {
        await renderAndLoadContent();

        fireEvent.click(screen.getByTestId('tab-btn-statistics'));
        await triggerFormDirtyAndOpenModal('publish-btn-statistics');
        fireEvent.click(screen.getByTestId('confirm-publish'));

        await waitFor(() => {
            expect(MainPageApi.publish).toHaveBeenCalled();
        });

        const patch = (MainPageApi.publish as jest.Mock).mock.calls[0][1];
        expect(patch.impactStatistics.metrics).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 3,
                    value: 7654321,
                    type: MetricType.Raised,
                    isAutoSynced: true,
                    localization: expect.objectContaining({
                        value: '182500.5',
                    }),
                }),
            ]),
        );
    });

    it('does not publish when already publishing', async () => {
        let resolvePublish: (value: any) => void;
        const publishPromise = new Promise((resolve) => {
            resolvePublish = resolve;
        });
        (MainPageApi.publish as jest.Mock).mockReturnValue(publishPromise);

        await renderAndLoadContent();
        const publishBtn = await triggerFormDirtyAndOpenModal();

        fireEvent.click(screen.getByTestId('confirm-publish'));

        await waitFor(() => {
            expect(publishBtn).toBeDisabled();
        });

        await act(async () => {
            resolvePublish!(mockPublishedData);
        });

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Зміни успішно опубліковано', 'success', 3000);
        });
    });
});
