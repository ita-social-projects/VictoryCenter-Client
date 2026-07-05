import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsSection } from './ReportsSection';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';

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
});

describe('ReportsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (localizationLanguagesDataFetch as jest.Mock).mockResolvedValue([{ id: 1, code: 'uk', name: 'Ukrainian' }]);
    });

    describe('without overflow (<= 2 items)', () => {
        it('renders all items and no toggle button', async () => {
            (PdfReportsApi.getAllByLanguageId as jest.Mock).mockResolvedValueOnce({
                items: [makeReport(1), makeReport(2)],
                total: 2,
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
                total: manyReports.length,
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
});
