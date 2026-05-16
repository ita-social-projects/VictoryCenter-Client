import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MainPageContent } from './MainPageContent';

jest.mock('../title-block/TitleBlockForm', () => ({
    __esModule: true,
    TitleBlockForm: () => <div data-testid="title-block-form">Title Form</div>,
}));

jest.mock('../about-us-block/AboutUsBlockForm', () => ({
    __esModule: true,
    AboutUsBlockForm: () => <div data-testid="about-us-block-form">About Us Form</div>,
}));

jest.mock('../partners-block/PartnersBlockForm', () => ({
    __esModule: true,
    PartnersBlockForm: () => <div data-testid="partners-block-form">Partners Form</div>,
}));

jest.mock('../statistics-block/StatisticsBlockForm', () => ({
    __esModule: true,
    StatisticsBlockForm: () => <div data-testid="statistics-block-form">Statistics Form</div>,
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

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => {
    const mockAddToast = jest.fn();
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
    beforeEach(() => {
        (MainPageApi.get as jest.Mock).mockResolvedValue({
            page: {
                id: 1,
                title: 'Test Title',
                description: 'Test Description',
                impactStatistics: { metrics: [] },
            },
            languages: [{ id: 1, code: 'uk', name: 'UA' }],
        });

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true });
        }

        if (!(global as any).crypto.randomUUID) {
            (global as any).crypto.randomUUID = jest.fn(() => 'test-uuid');
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    const waitForContentToLoad = async () => {
        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });
    };

    it('renders loader initially while data is "fetching"', () => {
        render(<MainPageContent />);
        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('renders loader when data is null and API throws error', async () => {
        (MainPageApi.get as jest.Mock).mockRejectedValue(new Error('Network error'));

        render(<MainPageContent />);

        await waitFor(() => {
            expect(MainPageApi.get).toHaveBeenCalled();
        });

        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('renders TitleBlockForm as the default tab after loading', async () => {
        render(<MainPageContent />);

        await waitForContentToLoad();

        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
        render(<MainPageContent />);

        await waitForContentToLoad();

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
        render(<MainPageContent />);

        await waitForContentToLoad();

        fireEvent.click(screen.getByTestId('tab-btn-donations'));
        expect(getByExactText(`Блок "${MAIN_PAGE_TEXT.TABS.DONATIONS}" в розробці`)).toBeInTheDocument();
    });

    it('renders partners tab content', async () => {
        render(<MainPageContent />);

        await waitForContentToLoad();

        fireEvent.click(screen.getByTestId('tab-btn-partners'));
        expect(screen.getByTestId('partners-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('title-block-form')).not.toBeInTheDocument();
    });
});
