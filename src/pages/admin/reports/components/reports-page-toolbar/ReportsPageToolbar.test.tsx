import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportsPageToolbar, REPORTS_TOOLBAR_TABS } from './ReportsPageToolbar';
import { REPORTS_TEXT } from '@/const/admin/reports';

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, selectedCategory, getCategoryDisplayName, onCategorySelect }: any) => (
        <div data-testid="mock-category-bar">
            {categories.map((cat: any) => (
                <button
                    key={cat.id}
                    data-testid={`tab-${cat.id}`}
                    className={selectedCategory?.id === cat.id ? 'selected' : ''}
                    onClick={() => onCategorySelect(cat)}
                >
                    {getCategoryDisplayName(cat)}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, buttonStyle, className }: any) => (
        <button onClick={onClick} disabled={disabled} data-button-style={buttonStyle} className={className}>
            {children}
        </button>
    ),
}));

jest.mock('@/assets/icons/edit-disabled.svg', () => ({
    ReactComponent: () => <svg data-testid="edit-icon" />,
}));

jest.mock('./ReportsPageToolbar.module.scss', () => ({
    toolbar: 'toolbar',
    actions: 'actions',
    button: 'button',
}));

describe('ReportsPageToolbar', () => {
    const mockOnEdit = jest.fn();
    const mockOnCancel = jest.fn();
    const mockOnPublish = jest.fn();
    const mockOnTabChange = jest.fn();

    const defaultProps = {
        selectedTab: REPORTS_TOOLBAR_TABS[0],
        onTabSelect: jest.fn(),
        isEditing: false,
        isPublishDisabled: false,
        onEdit: mockOnEdit,
        onEditReportAnalytics: jest.fn(),
        onCancel: mockOnCancel,
        onPublish: mockOnPublish,
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

    describe('View mode (not editing)', () => {
        it('should render Edit Page button when not editing', () => {
            renderComponent({ isEditing: false });

            expect(screen.getByText(REPORTS_TEXT.BUTTON.EDIT_PAGE)).toBeInTheDocument();
        });

        it('should render edit icon in Edit Page button', () => {
            renderComponent({ isEditing: false });

            expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
        });

        it('should not render Cancel and Publish buttons when not editing', () => {
            renderComponent({ isEditing: false });

            expect(screen.queryByText(REPORTS_TEXT.BUTTON.CANCEL)).not.toBeInTheDocument();
            expect(screen.queryByText(REPORTS_TEXT.BUTTON.PUBLISH)).not.toBeInTheDocument();
        });

        it('should call onEdit when Edit Page button is clicked', () => {
            renderComponent({ isEditing: false });

            fireEvent.click(screen.getByText(REPORTS_TEXT.BUTTON.EDIT_PAGE));

            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });

        it('should render Edit Page button with primary style', () => {
            renderComponent({ isEditing: false });

            const editButton = screen.getByText(REPORTS_TEXT.BUTTON.EDIT_PAGE).closest('button');
            expect(editButton).toHaveAttribute('data-button-style', 'primary');
        });
    });

    describe('Edit mode (editing)', () => {
        it('should render Cancel and Publish buttons when editing', () => {
            renderComponent({ isEditing: true });

            expect(screen.getByText(REPORTS_TEXT.BUTTON.CANCEL)).toBeInTheDocument();
            expect(screen.getByText(REPORTS_TEXT.BUTTON.PUBLISH)).toBeInTheDocument();
        });

        it('should not render Edit Page button when editing', () => {
            renderComponent({ isEditing: true });

            expect(screen.queryByText(REPORTS_TEXT.BUTTON.EDIT_PAGE)).not.toBeInTheDocument();
        });

        it('should call onCancel when Cancel button is clicked', () => {
            renderComponent({ isEditing: true });

            fireEvent.click(screen.getByText(REPORTS_TEXT.BUTTON.CANCEL));

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('should call onPublish when Publish button is clicked', () => {
            renderComponent({ isEditing: true, isPublishDisabled: false });

            fireEvent.click(screen.getByText(REPORTS_TEXT.BUTTON.PUBLISH));

            expect(mockOnPublish).toHaveBeenCalledTimes(1);
        });

        it('should render Cancel button with secondary style', () => {
            renderComponent({ isEditing: true });

            const cancelButton = screen.getByText(REPORTS_TEXT.BUTTON.CANCEL).closest('button');
            expect(cancelButton).toHaveAttribute('data-button-style', 'secondary');
        });

        it('should render Publish button with primary style', () => {
            renderComponent({ isEditing: true });

            const publishButton = screen.getByText(REPORTS_TEXT.BUTTON.PUBLISH).closest('button');
            expect(publishButton).toHaveAttribute('data-button-style', 'primary');
        });
    });

    describe('Publish button disabled state', () => {
        it('should disable Publish button when isPublishDisabled is true', () => {
            renderComponent({ isEditing: true, isPublishDisabled: true });

            const publishButton = screen.getByText(REPORTS_TEXT.BUTTON.PUBLISH).closest('button');
            expect(publishButton).toBeDisabled();
        });

        it('should enable Publish button when isPublishDisabled is false', () => {
            renderComponent({ isEditing: true, isPublishDisabled: false });

            const publishButton = screen.getByText(REPORTS_TEXT.BUTTON.PUBLISH).closest('button');
            expect(publishButton).not.toBeDisabled();
        });

        it('should not call onPublish when Publish button is disabled and clicked', () => {
            renderComponent({ isEditing: true, isPublishDisabled: true });

            const publishButton = screen.getByText(REPORTS_TEXT.BUTTON.PUBLISH).closest('button')!;
            fireEvent.click(publishButton);

            expect(mockOnPublish).not.toHaveBeenCalled();
        });
    });

    describe('Report analytics tab', () => {
        it('should render only Edit Page button when on report-analytics tab (no Cancel/Publish)', () => {
            const mockOnEditReportAnalytics = jest.fn();
            renderComponent({
                selectedTab: REPORTS_TOOLBAR_TABS[1],
                onEditReportAnalytics: mockOnEditReportAnalytics,
            });

            expect(screen.getByText(REPORTS_TEXT.BUTTON.EDIT_PAGE)).toBeInTheDocument();
            expect(screen.queryByText(REPORTS_TEXT.BUTTON.CANCEL)).not.toBeInTheDocument();
            expect(screen.queryByText(REPORTS_TEXT.BUTTON.PUBLISH)).not.toBeInTheDocument();

            fireEvent.click(screen.getByText(REPORTS_TEXT.BUTTON.EDIT_PAGE));
            expect(mockOnEditReportAnalytics).toHaveBeenCalledTimes(1);
        });
    });
});
