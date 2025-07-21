import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramsPageToolbar } from './ProgramsPageToolbar';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from "../../../../../const/admin/common";

// Mock the components
jest.mock("../../../../../components/common/button/Button", () => ({
  Button: ({ children, onClick, buttonStyle, ...props }): any => (
    <button onClick={onClick} className={buttonStyle} {...props}>
      {children}
    </button>
  )
}));

jest.mock("../../../../../components/common/select/Select", () => {
  const MockOption = ({ value, name, ...props }: any) => (
    <option value={value} {...props}>
      {name}
    </option>
  );

  const MockSelect = ({ children, onValueChange, ...props }: any) => {
    const handleChange = (e: any) => {
      const value = e.target.value === 'undefined' ? undefined : e.target.value;
      onValueChange(value);
    };
    return (
      <select onChange={handleChange} {...props}>
        {children}
      </select>
    );
  };

  MockSelect.Option = MockOption;

  return {
    Select: MockSelect
  };
});

jest.mock("../../../../../components/common/input/Input", () => ({
  Input: ({ onChange, autocompleteValues, placeholder, ...props }): any => (
    <input
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  )
}));

jest.mock("../../../../../assets/icons/plus.svg", () => "plus-icon.svg");

describe('ProgramsPageToolbar', () => {
  const mockProps = {
    onSearchQueryChange: jest.fn(),
    onStatusFilterChange: jest.fn(),
    autocompleteValues: ['Program 1', 'Program 2'],
    onAddProgram: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the toolbar with correct CSS class', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const toolbar = document.querySelector('.toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('should render search input with correct placeholder and data-testid', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', COMMON_TEXT_ADMIN.FILTER.SEARCH_BY_NAME);
  });

  it('should render status filter select with data-testid', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const statusFilter = screen.getByTestId('status-filter');
    expect(statusFilter).toBeInTheDocument();
  });

  it('should render add program button with correct data-testid and text', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const addButton = screen.getByTestId('add-program-button');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent(PROGRAMS_TEXT.BUTTON.ADD_PROGRAM);
  });

  it('should call onSearchQueryChange when search input value changes', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const searchInput = screen.getByTestId('search-input');

    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(mockProps.onSearchQueryChange).toHaveBeenCalledWith('test query');
    expect(mockProps.onSearchQueryChange).toHaveBeenCalledTimes(1);
  });

  it('should call onStatusFilterChange when status filter value changes', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const statusFilter = screen.getByTestId('status-filter');

    fireEvent.change(statusFilter, { target: { value: 'Published' } });

    expect(mockProps.onStatusFilterChange).toHaveBeenCalledWith('Published');
    expect(mockProps.onStatusFilterChange).toHaveBeenCalledTimes(1);
  });

  it('should call onAddProgram when add program button is clicked', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const addButton = screen.getByTestId('add-program-button');

    fireEvent.click(addButton);

    expect(mockProps.onAddProgram).toHaveBeenCalledTimes(1);
  });

  it('should render toolbar sections with correct CSS classes', () => {
    render(<ProgramsPageToolbar {...mockProps} />);
    const toolbarSearch = document.querySelector('.toolbar-search');
    const toolbarActions = document.querySelector('.toolbar-actions');

    expect(toolbarSearch).toBeInTheDocument();
    expect(toolbarActions).toBeInTheDocument();
  });
});
