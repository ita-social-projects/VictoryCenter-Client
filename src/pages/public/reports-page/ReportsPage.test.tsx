import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReportsPage } from './ReportsPage';
import { CTA_DATA } from '@/utils/mock-data/public/reports-page';
import { PUBLIC_ROUTES } from '@/const/public/routes';

jest.mock('./components', () => ({
    SummarySection: () => <div data-testid="summary-section-mock" />,
    ReportsSection: () => <div data-testid="reports-section-mock" />,
}));

jest.mock('@/components/public/cta', () => ({
    CtaSection: (props: any) => <div data-testid="cta-section-mock" data-props={JSON.stringify(props)} />,
}));

jest.mock('@/assets/videos/child_riding_horse.webm', () => 'mock-outro-video.webm');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ReportsPage', () => {
    it('renders all sections in correct order', () => {
        render(<ReportsPage />);

        const summary = screen.getByTestId('summary-section-mock');
        const reports = screen.getByTestId('reports-section-mock');
        const cta = screen.getByTestId('cta-section-mock');

        expect(summary).toBeInTheDocument();
        expect(reports).toBeInTheDocument();
        expect(cta).toBeInTheDocument();

        expect(summary.nextElementSibling).toBe(reports);
        expect(reports.nextElementSibling).toBe(cta);
    });

    it('passes correct configuration to CtaSection', () => {
        render(<ReportsPage />);
        const cta = screen.getByTestId('cta-section-mock');
        const props = JSON.parse(cta.getAttribute('data-props') || '{}');

        expect(props).toEqual({
            title: CTA_DATA.title,
            description: CTA_DATA.description,
            mediaUrl: 'mock-outro-video.webm',
            buttons: [
                {
                    label: 'cta.buttonLabel',
                    href: PUBLIC_ROUTES.DONATE.FULL,
                },
            ],
        });
    });
});
