import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportsPanel } from './ReportsPanel';

jest.mock('./components/reports-panel-content/ReportsPanelContent', () => ({
    ReportsPanelContent: () => <div data-testid="mock-reports-panel-content" />,
}));

describe('ReportsPanel', () => {
    it('should render ReportsPanelContent', () => {
        render(<ReportsPanel />);

        expect(screen.getByTestId('mock-reports-panel-content')).toBeInTheDocument();
    });
});
