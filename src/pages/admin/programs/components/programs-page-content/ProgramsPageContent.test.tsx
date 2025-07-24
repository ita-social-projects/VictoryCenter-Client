import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program } from '../../../../../types/ProgramAdminPage';
import { AddProgramModalProps } from '../program-modals/AddProgramModal';
import { EditProgramModalProps } from '../program-modals/EditProgramModal';
import { DeleteProgramModalProps } from '../program-modals/DeleteProgramModal';
import { ProgramPageToolbarProps } from '../programs-page-toolbar/ProgramsPageToolbar';
import { ProgramsListProps } from '../programs-list/ProgramsList';

const mockProgram: Program = {
    id: 1,
    name: 'Test Program Alpha',
    description: 'A sample description.',
    categories: [],
    status: 'Published',
    img: null,
};

const mockAddProgram = jest.fn();
const mockEditProgram = jest.fn();
const mockDeleteProgram = jest.fn();

jest.mock('../programs-list/ProgramsList', () => {
    const React = require('react');

    const MockProgramsList = React.forwardRef((props: ProgramsListProps, ref: any) => {
        const mockRef = {
            addProgram: mockAddProgram,
            editProgram: mockEditProgram,
            deleteProgram: mockDeleteProgram,
            setPrograms: jest.fn(),
        };

        React.useImperativeHandle(ref, () => mockRef);

        return (
            <div>
                <button onClick={() => props.onEditProgram(mockProgram)}>Trigger Edit</button>
                <button onClick={() => props.onDeleteProgram(mockProgram)}>Trigger Delete</button>
            </div>
        );
    });

    return {
        ProgramsList: MockProgramsList,
        __esModule: true,
    };
});

jest.mock('../programs-page-toolbar/ProgramsPageToolbar', () => {
    return {
        ProgramsPageToolbar: (props: ProgramPageToolbarProps) => (
            <div>
                <button onClick={props.onAddProgram}>Add Program</button>
                <button onClick={() => props.onStatusFilterChange('Published')}>Filter Published</button>
            </div>
        ),
    };
});

jest.mock(
    '../program-modals/AddProgramModal',
    () => (props: AddProgramModalProps) =>
        props.isOpen ? (
            <div>
                <h2>Add Program Modal</h2>
                <button
                    onClick={() => {
                        props.onAddProgram(mockProgram);
                        props.onClose();
                    }}
                >
                    Confirm Add
                </button>
                <button onClick={props.onClose}>Close Add</button>
            </div>
        ) : null,
);

jest.mock(
    '../program-modals/EditProgramModal',
    () => (props: EditProgramModalProps) =>
        props.isOpen ? (
            <div>
                <h2>Edit Program Modal</h2>
                <p>Editing: {props.programToEdit?.name}</p>
                <button
                    onClick={() => {
                        props.onEditProgram(props.programToEdit!);
                        props.onClose();
                    }}
                >
                    Confirm Edit
                </button>
                <button onClick={props.onClose}>Close Edit</button>
            </div>
        ) : null,
);

jest.mock(
    '../program-modals/DeleteProgramModal',
    () => (props: DeleteProgramModalProps) =>
        props.isOpen ? (
            <div>
                <h2>Delete Program Modal</h2>
                <p>Deleting: {props.programToDelete?.name}</p>
                <button
                    onClick={() => {
                        props.onDeleteProgram(props.programToDelete!);
                        props.onClose();
                    }}
                >
                    Confirm Delete
                </button>
                <button onClick={props.onClose}>Close Delete</button>
            </div>
        ) : null,
);

describe('ProgramsPageContent', () => {
    beforeEach(() => {
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

        expect(mockAddProgram).toHaveBeenCalledWith(mockProgram);
        expect(screen.queryByText('Add Program Modal')).not.toBeInTheDocument();
    });

    it('should call editProgram on the list ref when a program is edited via modal', () => {
        render(<ProgramsPageContent />);

        // Open the modal first
        fireEvent.click(screen.getByText('Trigger Edit'));
        expect(screen.getByText('Edit Program Modal')).toBeInTheDocument();

        // Confirm the edit
        fireEvent.click(screen.getByText('Confirm Edit'));

        expect(mockEditProgram).toHaveBeenCalledWith(mockProgram);
        expect(screen.queryByText('Edit Program Modal')).not.toBeInTheDocument();
    });

    it('should call deleteProgram on the list ref when a program is deleted via modal', () => {
        render(<ProgramsPageContent />);

        // Open the modal first
        fireEvent.click(screen.getByText('Trigger Delete'));
        expect(screen.getByText('Delete Program Modal')).toBeInTheDocument();

        // Confirm the deletion
        fireEvent.click(screen.getByText('Confirm Delete'));

        expect(mockDeleteProgram).toHaveBeenCalledWith(mockProgram);
        expect(screen.queryByText('Delete Program Modal')).not.toBeInTheDocument();
    });
});
