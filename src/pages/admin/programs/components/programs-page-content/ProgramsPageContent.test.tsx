import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';
import { AddProgramModalProps } from '../program-modals/AddProgramModal';
import { EditProgramModalProps } from '../program-modals/EditProgramModal';
import { DeleteProgramModalProps } from '../program-modals/DeleteProgramModal';
import { ProgramPageToolbarProps } from '../programs-page-toolbar/ProgramsPageToolbar';
import { ProgramsListProps, ProgramListRef } from '../programs-list/ProgramsList';

// Mock data for tests
const mockProgram: Program = {
  id: 1,
  name: 'Test Program Alpha',
  description: 'A sample description.',
  categories: [],
  status: 'Published',
  img: null,
};

// Mock ref methods to spy on them
const mockProgramListRef: ProgramListRef = {
  addProgram: jest.fn(),
  editProgram: jest.fn(),
  deleteProgram: jest.fn(),
  setPrograms: jest.fn(),
};

// Mock child components to isolate ProgramsPageContent logic
jest.mock('../programs-list/ProgramsList', () => {
  const React = require('react');
  const mockProgramListRef = {
    addProgram: jest.fn(),
    editProgram: jest.fn(),
    deleteProgram: jest.fn(),
    setPrograms: jest.fn(),
  };

  const MockProgramsList = React.forwardRef((props: ProgramsListProps, ref:ProgramListRef) => {
    React.useImperativeHandle(ref, () => mockProgramListRef);
    return (
      <div>
        <button onClick={() => props.onEditProgram({ id: 1, name: 'Test Program Alpha', description: '', categories: [], status: 'Published', img: null })}>
          Trigger Edit
        </button>
        <button onClick={() => props.onDeleteProgram({ id: 1, name: 'Test Program Alpha', description: '', categories: [], status: 'Published', img: null })}>
          Trigger Delete
        </button>
      </div>
    );
  });

  return {
    ProgramsList: MockProgramsList,
    __esModule: true,
  };
});


jest.mock('../programs-page-toolbar/ProgramsPageToolbar', () => (props: ProgramPageToolbarProps) => (
  <div>
    <button onClick={props.onAddProgram}>Add Program</button>
    <button onClick={() => props.onStatusFilterChange('Published')}>Filter Published</button>
  </div>
));

jest.mock('../program-modals/AddProgramModal', () => (props: AddProgramModalProps) =>
  props.isOpen ? (
    <div>
      <h2>Add Program Modal</h2>
      <button onClick={() => props.onAddProgram(mockProgram)}>Confirm Add</button>
      <button onClick={props.onClose}>Close Add</button>
    </div>
  ) : null
);

jest.mock('../program-modals/EditProgramModal', () => (props: EditProgramModalProps) =>
  props.isOpen ? (
    <div>
      <h2>Edit Program Modal</h2>
      <p>Editing: {props.programToEdit?.name}</p>
      <button onClick={() => props.onEditProgram(props.programToEdit!)}>Confirm Edit</button>
      <button onClick={props.onClose}>Close Edit</button>
    </div>
  ) : null
);

jest.mock('../program-modals/DeleteProgramModal', () => (props: DeleteProgramModalProps) =>
  props.isOpen ? (
    <div>
      <h2>Delete Program Modal</h2>
      <p>Deleting: {props.programToDelete?.name}</p>
      <button onClick={() => props.onDeleteProgram(props.programToDelete!)}>Confirm Delete</button>
      <button onClick={props.onClose}>Close Delete</button>
    </div>
  ) : null
);

// We need to get a handle on the mocked component to check its props
const MockedProgramsList = require('../programs-list/ProgramsList').ProgramsList;

// Test Suite
// ----------

describe('ProgramsPageContent', () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  it('should render the toolbar and program list, with modals initially closed', () => {
    const { container } = render(<ProgramsPageContent />);

    expect(container.firstChild).toHaveClass('wrapper');
    expect(screen.getByText('Add Program')).toBeInTheDocument(); // From Toolbar
    expect(screen.getByText('Trigger Edit')).toBeInTheDocument(); // From ProgramsList
    expect(screen.queryByText('Add Program Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit Program Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Program Modal')).not.toBeInTheDocument();
  });

  it('should open the Add Program modal when the add button is clicked', () => {
    render(<ProgramsPageContent />);

    fireEvent.click(screen.getByText('Add Program'));

    expect(screen.getByText('Add Program Modal')).toBeInTheDocument();
  });

  it('should open the Edit Program modal when onEditProgram is triggered', () => {
    render(<ProgramsPageContent />);

    fireEvent.click(screen.getByText('Trigger Edit'));

    expect(screen.getByText('Edit Program Modal')).toBeInTheDocument();
    expect(screen.getByText(`Editing: ${mockProgram.name}`)).toBeInTheDocument();
  });

  it('should open the Delete Program modal when onDeleteProgram is triggered', () => {
    render(<ProgramsPageContent />);

    fireEvent.click(screen.getByText('Trigger Delete'));

    expect(screen.getByText('Delete Program Modal')).toBeInTheDocument();
    expect(screen.getByText(`Deleting: ${mockProgram.name}`)).toBeInTheDocument();
  });

  it('should call addProgram on the list ref when a program is added via modal', () => {
    render(<ProgramsPageContent />);

    // Open the modal first
    fireEvent.click(screen.getByText('Add Program'));
    expect(screen.getByText('Add Program Modal')).toBeInTheDocument();

    // Confirm the addition
    fireEvent.click(screen.getByText('Confirm Add'));

    expect(mockProgramListRef.addProgram).toHaveBeenCalledWith(mockProgram);
    expect(screen.queryByText('Add Program Modal')).not.toBeInTheDocument();
  });

  it('should call editProgram on the list ref when a program is edited via modal', () => {
    render(<ProgramsPageContent />);

    // Open the modal first
    fireEvent.click(screen.getByText('Trigger Edit'));
    expect(screen.getByText('Edit Program Modal')).toBeInTheDocument();

    // Confirm the edit
    fireEvent.click(screen.getByText('Confirm Edit'));

    expect(mockProgramListRef.editProgram).toHaveBeenCalledWith(mockProgram);
    expect(screen.queryByText('Edit Program Modal')).not.toBeInTheDocument();
  });

  it('should call deleteProgram on the list ref when a program is deleted via modal', () => {
    render(<ProgramsPageContent />);

    // Open the modal first
    fireEvent.click(screen.getByText('Trigger Delete'));
    expect(screen.getByText('Delete Program Modal')).toBeInTheDocument();

    // Confirm the deletion
    fireEvent.click(screen.getByText('Confirm Delete'));

    expect(mockProgramListRef.deleteProgram).toHaveBeenCalledWith(mockProgram);
    expect(screen.queryByText('Delete Program Modal')).not.toBeInTheDocument();
  });

  it('should update the status filter for the ProgramsList when changed in the toolbar', async () => {
    render(<ProgramsPageContent />);

    // Initial state: no filter
    expect(MockedProgramsList).toHaveBeenLastCalledWith(
      expect.objectContaining({ searchByStatus: undefined }),
      expect.anything()
    );

    // Click the filter button in the mocked toolbar
    fireEvent.click(screen.getByText('Filter Published'));

    // Wait for the state update and re-render
    await waitFor(() => {
      expect(MockedProgramsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ searchByStatus: 'Published' }),
        expect.anything()
      );
    });
  });
});