import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReportsSection } from './ReportsSection';

jest.mock('./ReportsSection.module.scss', () => ({
    root: 'root-class',
    text: 'text-class',
    title: 'title-class',
    description: 'description-class',
    list: 'list-class',
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { year?: number }) => (options?.year ? `${key}:${options.year}` : key),
    }),
}));

jest.mock('@/utils/mock-data/public/reports-page', () => ({
    REPORTS_DATA: [
        { year: 2024, fileUrl: 'report-2024.pdf' },
        { year: 2023, fileUrl: 'report-2023.pdf' },
    ],
}));

jest.mock('./report-item', () => ({
    ReportItem: (props: any) => <div data-testid="report-item-mock" data-props={JSON.stringify(props)} />,
}));

describe('ReportsSection', () => {
    it('renders section structure with translated title and description', () => {
        const { container } = render(<ReportsSection />);

        const root = container.firstChild;
        const title = container.querySelector('.title-class');
        const description = container.querySelector('.description-class');

        expect(root).toHaveClass('root-class');
        expect(title).toHaveTextContent('reports.title');
        expect(description).toHaveTextContent('reports.description');
    });

    it('renders correct number of report items based on data', () => {
        render(<ReportsSection />);
        const items = screen.getAllByTestId('report-item-mock');

        expect(items).toHaveLength(2);
    });

    it('passes correct props to ReportItem components', () => {
        render(<ReportsSection />);
        const items = screen.getAllByTestId('report-item-mock');

        const firstItemProps = JSON.parse(items[0].getAttribute('data-props') || '{}');
        expect(firstItemProps).toEqual({
            fileUrl: 'report-2024.pdf',
            label: 'reports.itemLabel:2024',
            buttonLabel: 'actions.downloadPdf',
        });

        const secondItemProps = JSON.parse(items[1].getAttribute('data-props') || '{}');
        expect(secondItemProps).toEqual({
            fileUrl: 'report-2023.pdf',
            label: 'reports.itemLabel:2023',
            buttonLabel: 'actions.downloadPdf',
        });
    });
});
