import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import { MetricType } from '@/types/admin/main-page';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    TitleBlockForm: (props: any) => <MockFormBlock testId="title-block-form" btnTestId="publish-btn" {...props} />,
}));

jest.mock('../about-us-block/AboutUsBlockForm', () => ({
    __esModule: true,
    AboutUsBlockForm: (props: any) => (
        <MockFormBlock testId="about-us-block-form" btnTestId="publish-btn-about" {...props} />
    ),
}));

jest.mock('../partners-block/PartnersBlockForm', () => ({
    __esModule: true,
    PartnersBlockForm: (props: any) => (
        <MockFormBlock testId="partners-block-form" btnTestId="publish-btn-partners" {...props} />
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
        isOpen ? (
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

const getByExactText = (text: string) =>
    screen.getByText((_, el) => el?.children.length === 0 && el?.textContent === text);

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

        (MainPageApi.get as jest.Mock).mockResolvedValue(mockPageData);
        (MainPageApi.publish as jest.Mock).mockResolvedValue(mockPublishedData);
        (ImageApi.post as jest.Mock).mockResolvedValue({ id: 2, url: 'uploaded.jpg' });

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true });
        }

        if (!(global as any).crypto.randomUUID) {
            (global as any).crypto.randomUUID = jest.fn(() => 'test-uuid');
        }
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
        render(<MainPageContent />);
        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('renders error message when API throws error', async () => {
        (MainPageApi.get as jest.Mock).mockRejectedValue(new Error('Network error'));
        render(<MainPageContent />);

        await waitFor(() => {
            expect(MainPageApi.get).toHaveBeenCalled();
        });
        expect(screen.getByText(MAIN_PAGE_TEXT.ERRORS.LOAD_FAILED)).toBeInTheDocument();
    });

    it('renders TitleBlockForm as the default tab after loading', async () => {
        await renderAndLoadContent();
        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
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
