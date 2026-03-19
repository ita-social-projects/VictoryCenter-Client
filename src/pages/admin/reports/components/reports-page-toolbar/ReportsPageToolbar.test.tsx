import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportsPageToolbar, REPORTS_TOOLBAR_TABS } from './ReportsPageToolbar';

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: require('@/utils/test-mocks/test-mocks').MockCategoryBar,
}));

jest.mock('./ReportsPageToolbar.module.scss', () => ({
    toolbar: 'toolbar',
}));

describe('ReportsPageToolbar', () => {
    const defaultProps = {
        selectedTab: REPORTS_TOOLBAR_TABS[0],
        onTabSelect: jest.fn(),
    };

    const renderComponent = (overrideProps: Partial<typeof defaultProps> = {}) =>
        render(<ReportsPageToolbar {...defaultProps} {...overrideProps} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Tabs rendering', () => {
        it('should render category bar with two tabs', () => {
            renderComponent();

            expect(screen.getByTestId('mock-category-bar')).toBeInTheDocument();
            expect(screen.getByText('Налаштування медіа')).toBeInTheDocument();
            expect(screen.getByText('Звіт та аналітика')).toBeInTheDocument();
        });

        it('should select first tab by default', () => {
            renderComponent();

            const firstTab = screen.getByTestId('tab-media-settings');
            expect(firstTab).toHaveClass('selected');
        });

        it('should switch tab on click', () => {
            const mockOnTabSelect = jest.fn();
            renderComponent({ onTabSelect: mockOnTabSelect });

            const secondTab = screen.getByTestId('tab-report-analytics');
            fireEvent.click(secondTab);

            expect(mockOnTabSelect).toHaveBeenCalledWith(REPORTS_TOOLBAR_TABS[1]);
        });
    });
});
