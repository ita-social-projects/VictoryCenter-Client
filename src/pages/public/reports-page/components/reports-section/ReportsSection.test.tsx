import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsSection } from './ReportsSection';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { useSignalR } from '@/hooks/public/SignalR/useSignalR';

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
    useLocale: () => ({ currentLanguage: 'uk' }),
}));

jest.mock('@/services/api/public/localization/languages/languages-api', () => ({
    localizationLanguagesDataFetch: jest.fn(),
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

describe('ReportsSection', () => {
    let mockSignalROn: jest.Mock;
    let mockSignalROff: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (localizationLanguagesDataFetch as jest.Mock).mockResolvedValue([{ id: 1, code: 'uk', name: 'Ukrainian' }]);

        mockSignalROn = jest.fn();
        mockSignalROff = jest.fn();

        (useSignalR as jest.Mock).mockReturnValue({
            on: mockSignalROn,
            off: mockSignalROff,
        });
    });

    describe('without overflow (<= 2 items)', () => {
        it('renders all items and no toggle button', async () => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({
                items: [makeReport(1), makeReport(2)],
            });

            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2);
            });
            expect(screen.queryByText('reports.showMore')).not.toBeInTheDocument();
        });
    });

    describe('with overflow (> 2 items)', () => {
        const manyReports = [1, 2, 3, 4, 5, 6].map(makeReport);

        beforeEach(() => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValue({
                items: manyReports,
            });
        });

        it('renders only first 2 items initially and shows toggle button', async () => {
            render(<ReportsSection />);

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2);
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
            expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2);
            expect(screen.getByText('reports.showMore')).toBeInTheDocument();
        });
    });

    describe('SignalR real-time updates', () => {
        const initialReports = [makeReport(1), makeReport(2)];

        beforeEach(() => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValue({
                items: initialReports,
            });
        });

        it('adds a new report when PdfReportCreated is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2));

            const createdCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportCreated')[1];

            act(() => {
                createdCallback(makeReport(99));
            });

            const user = userEvent.setup();
            await user.click(screen.getByText('reports.showMore'));

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(3);
                expect(screen.getByText('Звіт 99')).toBeInTheDocument();
            });
        });

        it('updates an existing report when PdfReportUpdated is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2));

            const updatedCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportUpdated')[1];

            act(() => {
                updatedCallback({ ...makeReport(1), name: 'Updated Title.pdf' });
            });

            await waitFor(() => {
                expect(screen.getByText('Updated Title')).toBeInTheDocument();
            });
        });

        it('removes a report when PdfReportDeleted is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2));

            const deletedCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportDeleted')[1];

            act(() => {
                deletedCallback(1);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(1);
                expect(screen.queryByText('Звіт 1')).not.toBeInTheDocument();
            });
        });

        it('refetches all reports when PdfReportsReordered is received', async () => {
            render(<ReportsSection />);
            await waitFor(() => expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2));

            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({
                items: [makeReport(3), makeReport(4), makeReport(5)],
            });

            const reorderedCallback = mockSignalROn.mock.calls.find((call) => call[0] === 'PdfReportsReordered')[1];

            await act(async () => {
                await reorderedCallback(1);
            });

            const user = userEvent.setup();
            await user.click(screen.getByText('reports.showMore'));

            await waitFor(() => {
                expect(screen.getAllByTestId('report-item-mock')).toHaveLength(3);
                expect(screen.getByText('Звіт 5')).toBeInTheDocument();
            });
        });

        it('cleans up SignalR event listeners on unmount', () => {
            const { unmount } = render(<ReportsSection />);
            unmount();

            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportCreated', expect.any(Function));
            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportUpdated', expect.any(Function));
            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportDeleted', expect.any(Function));
            expect(mockSignalROff).toHaveBeenCalledWith('PdfReportsReordered', expect.any(Function));
        });
    });
});
