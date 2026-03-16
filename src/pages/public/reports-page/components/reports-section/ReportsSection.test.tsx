import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsSection } from './ReportsSection';

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
        t: (key: string, options?: { year?: number }) => (options?.year ? `${key}:${options.year}` : key),
    }),
}));

jest.mock('./report-item', () => ({
    ReportItem: ({ label }: any) => <div data-testid="report-item-mock">{label}</div>,
}));

const mockReportsData: Array<{ year: number; fileUrl: string }> = [];

jest.mock('@/utils/mock-data/public/reports-page', () => ({
    get REPORTS_DATA() {
        return mockReportsData;
    },
}));

describe('ReportsSection', () => {
    beforeEach(() => {
        mockReportsData.length = 0;
    });

    describe('without overflow (<= 2 items)', () => {
        it('renders all items and no toggle button', () => {
            mockReportsData.push({ year: 2024, fileUrl: 'r1.pdf' }, { year: 2023, fileUrl: 'r2.pdf' });

            render(<ReportsSection />);

            expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2);
            expect(screen.queryByText('reports.showMore')).not.toBeInTheDocument();
        });
    });

    describe('with overflow (> 2 items)', () => {
        beforeEach(() => {
            mockReportsData.push(
                { year: 2025, fileUrl: 'r1.pdf' },
                { year: 2024, fileUrl: 'r2.pdf' },
                { year: 2023, fileUrl: 'r3.pdf' },
                { year: 2022, fileUrl: 'r4.pdf' },
                { year: 2021, fileUrl: 'r5.pdf' },
                { year: 2020, fileUrl: 'r6.pdf' },
            );
        });

        it('renders only first 2 items initially and shows toggle button', () => {
            render(<ReportsSection />);

            expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2);
            expect(screen.getByText('reports.showMore')).toBeInTheDocument();
        });

        it('expands and collapses items on toggle click', async () => {
            const user = userEvent.setup();
            render(<ReportsSection />);

            const toggleButton = screen.getByText('reports.showMore');
            await user.click(toggleButton);

            expect(screen.getAllByTestId('report-item-mock')).toHaveLength(6);
            expect(screen.getByText('reports.showLess')).toBeInTheDocument();

            await user.click(screen.getByText('reports.showLess'));

            expect(screen.getAllByTestId('report-item-mock')).toHaveLength(2);
            expect(screen.getByText('reports.showMore')).toBeInTheDocument();
        });
    });
});
