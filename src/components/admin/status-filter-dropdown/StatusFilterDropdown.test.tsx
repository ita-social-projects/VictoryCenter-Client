import { render, screen, fireEvent } from '@testing-library/react';
import { StatusFilterDropdown } from './StatusFilterDropdown';
import { VisibilityStatus } from '../../../types/admin/common';
import { SelectProps } from '../select/Select';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

jest.mock('../select/Select', () => {
    const MockOption = ({ value, name, ...props }: any) => (
        <option value={value === undefined ? 'undefined' : value} {...props}>
            {name}
        </option>
    );

    const MockSelect = ({ children, onValueChange, ...props }: SelectProps<any>) => {
        const handleChange = (e: any) => {
            const value = e.target.value === 'undefined' ? undefined : e.target.value;
            onValueChange(value);
        };
        return (
            <select onChange={handleChange} data-testid="status-filter" {...props}>
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
        render(<StatusFilterDropdown onStatusFilterChange={mockOnStatusFilterChange} />);
        const select = screen.getByTestId('status-filter');
        expect(select).toBeInTheDocument();
    });

    it('renders all status options from COMMON_TEXT_ADMIN.FILTER.STATUS', () => {
        render(<StatusFilterDropdown onStatusFilterChange={mockOnStatusFilterChange} />);
        const options = screen.getAllByRole('option');
        const expectedValues = Object.values(COMMON_TEXT_ADMIN.FILTER.STATUS);
        expect(options).toHaveLength(expectedValues.length);

        expectedValues.forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('calls onStatusFilterChange with correct value when changed', () => {
        render(<StatusFilterDropdown onStatusFilterChange={mockOnStatusFilterChange} />);
        const select = screen.getByTestId('status-filter');

        fireEvent.change(select, { target: { value: String(VisibilityStatus.Published) } });

        expect(mockOnStatusFilterChange).toHaveBeenCalledTimes(1);
        expect(mockOnStatusFilterChange).toHaveBeenCalledWith(String(VisibilityStatus.Published));
    });

    it('calls onStatusFilterChange with undefined when "undefined" is selected', () => {
        render(<StatusFilterDropdown onStatusFilterChange={mockOnStatusFilterChange} />);
        const select = screen.getByTestId('status-filter');

        fireEvent.change(select, { target: { value: 'undefined' } });

        expect(mockOnStatusFilterChange).toHaveBeenCalledWith(undefined);
    });
});
