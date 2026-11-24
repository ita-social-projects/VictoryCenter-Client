import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsSection } from './ReportsSection';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { useSignalR } from '@/hooks/public/SignalR/useSignalR';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { PdfSectionPublicApi } from '@/services/api/public/pdf-section/pdf-section-api';
import { PublicPdfSectionDto } from '@/types/public/reports';

jest.mock('./ReportsSection.module.scss', () => ({
    root: 'root-class',
    text: 'text-class',
    title: 'title-class',
    description: 'description-class',
    list: 'list-class',
    toggle: 'toggle-class',
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

jest.mock('@/services/api/public/localization/languages/languages-api', () => ({
    localizationLanguagesDataFetch: jest.fn(),
}));

jest.mock('@/services/api/public/pdf-section/pdf-section-api', () => ({
    PdfSectionPublicApi: {
        get: jest.fn(),
    },
}));

jest.mock('@/services/api/admin/reports/pdf-reports/pdf-reports-api', () => ({
    PdfReportsApi: {
        getAllByLanguageId: jest.fn(),
        getPublicFileUrl: (id: number) => `/api/PdfReports/${id}/file`,
    },
}));

jest.mock('@/hooks/public/SignalR/useSignalR', () => ({
    useSignalR: jest.fn(),
}));

jest.mock('./report-item', () => ({
    ReportItem: ({ label }: any) => <div data-testid="report-item-mock">{label}</div>,
}));

const makeReport = (id: number) => ({
    id,
    name: `Звіт ${id}.pdf`,
    blobName: `blob-${id}`,
    fileSizeBytes: 1024,
    createdAt: '2024-01-01',
    priority: id,
    languageId: 1,
});

const makePdfSection = (overrides: Partial<PublicPdfSectionDto> = {}): PublicPdfSectionDto => ({
    title: 'Оновлений заголовок',
    description: 'Оновлений короткий опис розділу',
    localizations: [
        {
            language: { id: 2, code: 'en' },
            title: 'Updated Section Title',
            description: 'Updated Section Description',
        },
    ],
    ...overrides,
});

describe('ReportsSection', () => {
    let mockSignalROn: jest.Mock;
    let mockSignalROff: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (useLocale as jest.Mock).mockReturnValue({ currentLanguage: 'uk' });
        (localizationLanguagesDataFetch as jest.Mock).mockResolvedValue([{ id: 1, code: 'uk', name: 'Ukrainian' }]);
        (PdfSectionPublicApi.get as jest.Mock).mockResolvedValue(makePdfSection());

        mockSignalROn = jest.fn();
        mockSignalROff = jest.fn();

        (useSignalR as jest.Mock).mockReturnValue({
            on: mockSignalROn,
            off: mockSignalROff,
        });
    });

    describe('PDF section content fetching and localization', () => {
        it('renders fetched title and description for Ukrainian locale', async () => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({ items: [] });

            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 2, name: 'Оновлений заголовок' })).toBeInTheDocument();
                expect(screen.getByText('Оновлений короткий опис розділу')).toBeInTheDocument();
            });
            expect(PdfSectionPublicApi.get).toHaveBeenCalledTimes(1);
        });

        it('renders English localized title and description when currentLanguage is en', async () => {
            (useLocale as jest.Mock).mockReturnValue({ currentLanguage: 'en' });
            (localizationLanguagesDataFetch as jest.Mock).mockResolvedValue([{ id: 2, code: 'en', name: 'English' }]);
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({ items: [] });

            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 2, name: 'Updated Section Title' })).toBeInTheDocument();
                expect(screen.getByText('Updated Section Description')).toBeInTheDocument();
            });
        });

        it('falls back to primary PDF section text when English localization is missing', async () => {
            (useLocale as jest.Mock).mockReturnValue({ currentLanguage: 'en' });
            (localizationLanguagesDataFetch as jest.Mock).mockResolvedValue([{ id: 2, code: 'en', name: 'English' }]);
            (PdfSectionPublicApi.get as jest.Mock).mockResolvedValueOnce(makePdfSection({ localizations: [] }));
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({ items: [] });

            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 2, name: 'Оновлений заголовок' })).toBeInTheDocument();
                expect(screen.getByText('Оновлений короткий опис розділу')).toBeInTheDocument();
            });
        });

        it('falls back to i18n keys when fetching PDF section fails', async () => {
            (PdfSectionPublicApi.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({ items: [] });

            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 2, name: 'reports.title' })).toBeInTheDocument();
                expect(screen.getByText('reports.description')).toBeInTheDocument();
            });
        });

        it('does not show fallback i18n text while PDF section fetch is pending', async () => {
            let resolveSection!: (value: PublicPdfSectionDto) => void;
            (PdfSectionPublicApi.get as jest.Mock).mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveSection = resolve;
                    }),
            );
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({ items: [] });

            render(<ReportsSection />);

            expect(screen.queryByText('reports.title')).not.toBeInTheDocument();
            expect(screen.queryByText('reports.description')).not.toBeInTheDocument();

            await act(async () => {
                resolveSection(makePdfSection());
            });

            expect(screen.getByRole('heading', { level: 2, name: 'Оновлений заголовок' })).toBeInTheDocument();
        });
    });

    describe('Fetch and Pagination coverage', () => {
        it('fetches additional pages if items returned equal FETCH_LIMIT', async () => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockImplementation((langId, params) => {
                if (params.offset === 0) {
                    return Promise.resolve({ items: new Array(params.limit).fill(0).map((_, i) => makeReport(i)) });
                }
                return Promise.resolve({ items: [] });
            });

            render(<ReportsSection />);
            await waitFor(() => {
                expect(PdfReportsApi.getAllByLanguageId).toHaveBeenCalledTimes(2);
            });
        });

        it('returns empty array and handles API error gracefully', async () => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockRejectedValue(new Error('Network error'));
            render(<ReportsSection />);
            await waitFor(() => {
                expect(localizationLanguagesDataFetch).toHaveBeenCalled();
            });
            expect(screen.queryByTestId('report-item-mock')).not.toBeInTheDocument();
        });

        it('does not render if matching language is not found', async () => {
            (localizationLanguagesDataFetch as jest.Mock).mockResolvedValueOnce([]);
            render(<ReportsSection />);
            await waitFor(() => {
                expect(localizationLanguagesDataFetch).toHaveBeenCalled();
            });
            expect(screen.queryByTestId('report-item-mock')).not.toBeInTheDocument();
        });

        it('does not update state if unmounted before initial fetch completes', async () => {
            let resolveApi: any = () => {};

            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveApi = resolve;
                    }),
            );

            const { unmount } = render(<ReportsSection />);

            await waitFor(() => {
                expect(PdfReportsApi.getAllByLanguageId).toHaveBeenCalled();
            });

            unmount();

            await act(async () => {
                resolveApi({ items: [makeReport(1)] });
            });
        });
    });

    describe('without overflow (<= 5 items)', () => {
        it('renders all items and no toggle button', async () => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({
                items: [makeReport(1), makeReport(2), makeReport(3), makeReport(4), makeReport(5)],
            });

            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5);
            });
            expect(screen.queryByText('reports.showMore')).not.toBeInTheDocument();
        });
    });

    describe('with overflow (> 5 items)', () => {
        const manyReports = [1, 2, 3, 4, 5, 6].map(makeReport);

        beforeEach(() => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValue({
                items: manyReports,
            });
        });

        it('renders only first 5 items initially and shows toggle button', async () => {
            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5);
            });
            expect(screen.getByText('reports.showMore')).toBeInTheDocument();
        });

        it('expands and collapses items on toggle click', async () => {
            const user = userEvent.setup();
            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getByText('reports.showMore')).toBeInTheDocument();
            });

            await user.click(screen.getByText('reports.showMore'));
            expect(screen.getAllByTestId('report-item-mock')).toHaveLength(6);
            expect(screen.getByText('reports.showLess')).toBeInTheDocument();

            await user.click(screen.getByText('reports.showLess'));
            expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5);
            expect(screen.getByText('reports.showMore')).toBeInTheDocument();
        });
    });

    describe('SignalR real-time updates', () => {
        const initialReports = [1, 2, 3, 4, 5].map(makeReport);

        beforeEach(() => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValue({
                items: initialReports,
            });
        });

        it('handles null signalR connection safely', async () => {
            (useSignalR as jest.Mock).mockReturnValue(null);
            render(<ReportsSection />);
            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5);
            });
        });

        it('adds a new report when PdfReportCreated is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5));

            const createdCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportCreated')[1];

            await act(async () => {
                await createdCallback(makeReport(99));
            });

            const user = userEvent.setup();
            await user.click(screen.getByText('reports.showMore'));

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(6);
                expect(screen.getByText('Звіт 99')).toBeInTheDocument();
            });
        });

        it('updates an existing report when PdfReportUpdated is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5));

            const updatedCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportUpdated')[1];

            await act(async () => {
                await updatedCallback({ ...makeReport(1), name: 'Updated Title.pdf' });
            });

            await waitFor(() => {
                expect(screen.getByText('Updated Title')).toBeInTheDocument();
            });
        });

        it('removes a report when PdfReportDeleted is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5));

            const deletedCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportDeleted')[1];

            await act(async () => {
                await deletedCallback(1);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(4);
                expect(screen.queryByText('Звіт 1')).not.toBeInTheDocument();
            });
        });

        it('refetches all reports when PdfReportsReordered is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5));

            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({
                items: [makeReport(3), makeReport(4), makeReport(5)],
            });

            const reorderedCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportsReordered')[1];

            await act(async () => {
                await reorderedCallback(1);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(3);
                expect(screen.getByText('Звіт 5')).toBeInTheDocument();
            });
        });

        it('updates title and description when PdfSectionUpdated is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 2, name: 'Оновлений заголовок' })).toBeInTheDocument();
            });

            const sectionUpdatedCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfSectionUpdated')[1];

            await act(async () => {
                sectionUpdatedCallback(
                    makePdfSection({
                        title: 'Живе оновлення заголовка',
                        description: 'Живе оновлення короткого опису',
                    }),
                );
            });

            expect(screen.getByRole('heading', { level: 2, name: 'Живе оновлення заголовка' })).toBeInTheDocument();
            expect(screen.getByText('Живе оновлення короткого опису')).toBeInTheDocument();
        });

        it('ignores SignalR events if the report languageId does not match current active language', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5));

            const createdCb = mockSignalROn.mock.calls.find((c) => c[0] === 'PdfReportCreated')[1];
            const updatedCb = mockSignalROn.mock.calls.find((c) => c[0] === 'PdfReportUpdated')[1];
            const reorderedCb = mockSignalROn.mock.calls.find((c) => c[0] === 'PdfReportsReordered')[1];

            await act(async () => {
                createdCb({ ...makeReport(99), languageId: 999 });
                updatedCb({ ...makeReport(1), name: 'Changed', languageId: 999 });
                await reorderedCb(999);
            });

            expect(screen.queryByText('Звіт 99')).not.toBeInTheDocument();
            expect(screen.queryByText('Changed')).not.toBeInTheDocument();
        });

        it('ignores SignalR deleted and section-updated events if component is unmounted', async () => {
            const { unmount } = render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5));

            const deletedCb = mockSignalROn.mock.calls.find((c) => c[0] === 'PdfReportDeleted')[1];
            const sectionUpdatedCb = mockSignalROn.mock.calls.find((c) => c[0] === 'PdfSectionUpdated')[1];
            unmount();

            act(() => {
                deletedCb(1);
                sectionUpdatedCb(makePdfSection({ title: 'After Unmount' }));
            });
        });

        it('cleans up SignalR event listeners on unmount', async () => {
            const { unmount } = render(<ReportsSection />);

            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(5));

            unmount();

            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportCreated', expect.any(Function));
            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportUpdated', expect.any(Function));
            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportDeleted', expect.any(Function));
            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportsReordered', expect.any(Function));
            expect(mockSignalROff).toHaveBeenCalledWith('PdfSectionUpdated', expect.any(Function));
        });
    });
});
