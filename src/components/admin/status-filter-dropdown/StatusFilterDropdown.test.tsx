import { render, screen, fireEvent } from '@testing-library/react';
import { StatusFilterDropdown } from './StatusFilterDropdown';
import { VisibilityStatus } from '../../../types/admin/common';
import { SelectOptionProps, SelectProps } from '../../common/select/Select';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

jest.mock('../../common/select/Select', () => {
    const MockOption = ({ value, name }: SelectOptionProps<any>) => (
        <option value={value === undefined ? 'undefined' : value}>{name}</option>
    );

    const MockSelect = ({ children, onValueChange, value, ...props }: SelectProps<any>) => {
        const handleChange = (e: any) => {
            const val = e.target.value === 'undefined' ? undefined : e.target.value;
            onValueChange(val);
        };
        return (
            <select
                onChange={handleChange}
                data-testid="status-filter"
                value={value === undefined ? 'undefined' : value}
                {...props}
            >
                {children}
            </select>
        );
    };

    MockSelect.Option = MockOption;
    return { Select: MockSelect };
});

describe('StatusFilterDropdown', () => {
    const mockOnStatusFilterChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the select with data-testid', () => {
        render(<StatusFilterDropdown value={undefined} onStatusFilterChange={mockOnStatusFilterChange} />);
        const select = screen.getByTestId('status-filter');
        expect(select).toBeInTheDocument();
    });

    it('renders all status options from COMMON_TEXT_ADMIN.FILTER.STATUS', () => {
        render(<StatusFilterDropdown value={undefined} onStatusFilterChange={mockOnStatusFilterChange} />);
        const options = screen.getAllByRole('option');
        const expectedValues = Object.values(COMMON_TEXT_ADMIN.FILTER.STATUS);
        expect(options).toHaveLength(expectedValues.length);

        expectedValues.forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('calls onStatusFilterChange with correct value when changed', () => {
        render(<StatusFilterDropdown value={undefined} onStatusFilterChange={mockOnStatusFilterChange} />);
        const select = screen.getByTestId('status-filter');

        fireEvent.change(select, { target: { value: String(VisibilityStatus.Published) } });

        expect(mockOnStatusFilterChange).toHaveBeenCalledTimes(1);
        expect(mockOnStatusFilterChange).toHaveBeenCalledWith(String(VisibilityStatus.Published));
    });

    it('calls onStatusFilterChange with undefined when "undefined" (default option) is selected', () => {
        render(
            <StatusFilterDropdown value={VisibilityStatus.Published} onStatusFilterChange={mockOnStatusFilterChange} />,
        );
        const select = screen.getByTestId('status-filter');

        fireEvent.change(select, { target: { value: 'undefined' } });

        expect(mockOnStatusFilterChange).toHaveBeenCalledWith(undefined);
    });

    it('updates the selected option when the value prop changes', () => {
        const { rerender } = render(
            <StatusFilterDropdown value={undefined} onStatusFilterChange={mockOnStatusFilterChange} />,
        );
        const select = screen.getByTestId('status-filter') as HTMLSelectElement;

        expect(select.value).toBe('undefined');

        rerender(
            <StatusFilterDropdown value={VisibilityStatus.Published} onStatusFilterChange={mockOnStatusFilterChange} />,
        );

        expect(select.value).toBe(String(VisibilityStatus.Published));
    });
});
