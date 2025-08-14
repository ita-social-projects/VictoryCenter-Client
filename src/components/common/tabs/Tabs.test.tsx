import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';
import '@testing-library/jest-dom';

describe('Tabs component', () => {
    const mockSetActiveTab = jest.fn();

    const defaultTabs = [
        { id: 1, label: 'Tab 1' },
        { id: 2, label: 'Tab 2', disabled: true },
        { id: 3, label: 'Tab 3' },
    ];

    const renderTabs = (activeTab = 1, tabs = defaultTabs) => {
        render(<Tabs tabs={tabs} activeTab={activeTab} setActiveTab={mockSetActiveTab} />);
    };

    beforeEach(() => {
        mockSetActiveTab.mockClear();
    });

    it('renders all tabs', () => {
        renderTabs();
        expect(screen.getByText('Tab 1')).toBeInTheDocument();
        expect(screen.getByText('Tab 2')).toBeInTheDocument();
        expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('applies active class to the active tab', () => {
        renderTabs(1);
        const activeButton = screen.getByText('Tab 1');
        expect(activeButton).toHaveClass('active');
    });

    it('calls setActiveTab when clicking on an enabled tab', () => {
        renderTabs();
        fireEvent.click(screen.getByText('Tab 3'));
        expect(mockSetActiveTab).toHaveBeenCalledWith(3);
    });

    it('does not call setActiveTab when clicking on a disabled tab', () => {
        renderTabs();
        fireEvent.click(screen.getByText('Tab 2'));
        expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('shows tooltip text for disabled tabs', () => {
        renderTabs();
        const tooltipText = screen.getByText('Not yet available.');
        expect(tooltipText).toBeInTheDocument();
        expect(screen.getByText('Please check back later!')).toBeInTheDocument();
    });
});
