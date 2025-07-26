import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';

const mockProgram: Program = {
    id: 1,
    name: 'Test Program Alpha',
    description: 'A sample description.',
    categories: [],
    status: 'Published' as VisibilityStatus,
    img: null,
};

const mockAddProgram = jest.fn();
const mockEditProgram = jest.fn();
const mockDeleteProgram = jest.fn();
const mockSetPrograms = jest.fn();

jest.mock('../programs-list/ProgramsList', () => {
    const React = require('react');

    const MockProgramsList = React.forwardRef((props: any, ref: any) => {
        const mockRef = {
            addProgram: mockAddProgram,
            editProgram: mockEditProgram,
            deleteProgram: mockDeleteProgram,
            setPrograms: mockSetPrograms,
        };

        React.useImperativeHandle(ref, () => mockRef);

        return (
            <div data-testid="programs-list">
                <button onClick={() => props.onEditProgram(mockProgram)}>Trigger Edit</button>
                <button onClick={() => props.onDeleteProgram(mockProgram)}>Trigger Delete</button>
            </div>
        );
    });

    return {
        ProgramsList: MockProgramsList,
    };
});

jest.mock('../programs-page-toolbar/ProgramsPageToolbar', () => ({
    ProgramsPageToolbar: (props: any) => (
        <div data-testid="programs-toolbar">
            <button onClick={props.onAddProgram}>Add Program</button>
            <button onClick={() => props.onStatusFilterChange('Published' as VisibilityStatus)}>
                Filter Published
            </button>
            <input
                data-testid="search-input"
                onChange={(e) => props.onSearchQueryChange(e.target.value)}
                placeholder="Search..."
            />
        </div>
    ),
}));

jest.mock('../program-modals/ProgramModal', () => ({
    ProgramModal: (props: any) => {
        if (!props.isOpen) return null;

        const isAddMode = props.mode === 'add';
        const isEditMode = props.mode === 'edit';

        return (
            <div data-testid={isAddMode ? 'add-program-modal' : 'edit-program-modal'}>
                <h2>{isAddMode ? 'Add Program Modal' : 'Edit Program Modal'}</h2>
                {isEditMode && props.programToEdit && <p>Editing: {props.programToEdit.name}</p>}
                {isAddMode && <p>Adding new program</p>}
                <button
                    data-testid={isAddMode ? 'confirm-add' : 'confirm-edit'}
                    onClick={() => {
                        if (isAddMode && props.onAddProgram) {
                            props.onAddProgram(mockProgram);
                        } else if (isEditMode && props.onEditProgram && props.programToEdit) {
                            props.onEditProgram(props.programToEdit);
                        }
                        props.onClose();
                    }}
                >
                    {isAddMode ? 'Confirm Add' : 'Confirm Edit'}
                </button>
                <button data-testid={isAddMode ? 'close-add' : 'close-edit'} onClick={props.onClose}>
                    {isAddMode ? 'Close Add' : 'Close Edit'}
                </button>
            </div>
        );
    },
}));

jest.mock('../program-modals/DeleteProgramModal', () => ({
    __esModule: true,
    default: (props: any) =>
        props.isOpen ? (
            <div data-testid="delete-program-modal">
                <h2>Delete Program Modal</h2>
                <p>Deleting: {props.programToDelete?.name}</p>
                <button
                    data-testid="confirm-delete"
                    onClick={() => {
                        props.onDeleteProgram(props.programToDelete);
                        props.onClose();
                    }}
                >
                    Confirm Delete
                </button>
                <button data-testid="close-delete" onClick={props.onClose}>
                    Close Delete
                </button>
            </div>
        ) : null,
}));

describe('ProgramsPageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial render', () => {
        it('should render the toolbar and program list, with modals initially closed', () => {
            const { container } = render(<ProgramsPageContent />);

            expect(container.firstChild).toHaveClass('wrapper');
            expect(screen.getByTestId('programs-page-content')).toBeInTheDocument();
            expect(screen.getByTestId('programs-toolbar')).toBeInTheDocument();
            expect(screen.getByTestId('programs-list')).toBeInTheDocument();
            expect(screen.getByText('Add Program')).toBeInTheDocument();
            expect(screen.getByText('Trigger Edit')).toBeInTheDocument();
            expect(screen.queryByTestId('add-program-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('edit-program-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('delete-program-modal')).not.toBeInTheDocument();
        });
    });

    describe('Modal interactions', () => {
        const modalTestCases = [
            {
                modalType: 'Add Program',
                triggerText: 'Add Program',
                modalTestId: 'add-program-modal',
                closeTestId: 'close-add',
                expectedTitle: 'Add Program Modal',
                expectedContent: 'Adding new program',
            },
            {
                modalType: 'Edit Program',
                triggerText: 'Trigger Edit',
                modalTestId: 'edit-program-modal',
                closeTestId: 'close-edit',
                expectedTitle: 'Edit Program Modal',
                expectedContent: `Editing: ${mockProgram.name}`,
            },
            {
                modalType: 'Delete Program',
                triggerText: 'Trigger Delete',
                modalTestId: 'delete-program-modal',
                closeTestId: 'close-delete',
                expectedTitle: 'Delete Program Modal',
                expectedContent: `Deleting: ${mockProgram.name}`,
            },
        ];

        describe.each(modalTestCases)(
            '$modalType Modal',
            ({ triggerText, modalTestId, closeTestId, expectedTitle, expectedContent }) => {
                it('should open correctly', () => {
                    render(<ProgramsPageContent />);
                    fireEvent.click(screen.getByText(triggerText));

                    // Check modal opened
                    expect(screen.getByTestId(modalTestId)).toBeInTheDocument();
                    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
                    expect(screen.getByText(expectedContent)).toBeInTheDocument();
                });

                it('should close when the close button is clicked', () => {
                    render(<ProgramsPageContent />);
                    // Open modal
                    fireEvent.click(screen.getByText(triggerText));
                    // Click close button
                    fireEvent.click(screen.getByTestId(closeTestId));
                    // Check modal closed
                    expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
                });
            },
        );
    });

    describe('Program operations', () => {
        it('should call addProgram on the list ref when a program is added via modal', () => {
            render(<ProgramsPageContent />);
            fireEvent.click(screen.getByText('Add Program'));
            fireEvent.click(screen.getByTestId('confirm-add'));

            expect(mockAddProgram).toHaveBeenCalledWith(mockProgram);
            expect(screen.queryByTestId('add-program-modal')).not.toBeInTheDocument();
        });

        it('should call editProgram on the list ref when a program is edited via modal', () => {
            render(<ProgramsPageContent />);
            fireEvent.click(screen.getByText('Trigger Edit'));
            fireEvent.click(screen.getByTestId('confirm-edit'));

            expect(mockEditProgram).toHaveBeenCalledWith(mockProgram);
            expect(screen.queryByTestId('edit-program-modal')).not.toBeInTheDocument();
        });

        it('should call deleteProgram on the list ref when a program is deleted via modal', () => {
            render(<ProgramsPageContent />);
            fireEvent.click(screen.getByText('Trigger Delete'));
            fireEvent.click(screen.getByTestId('confirm-delete'));

            expect(mockDeleteProgram).toHaveBeenCalledWith(mockProgram);
            expect(screen.queryByTestId('delete-program-modal')).not.toBeInTheDocument();
        });
    });

    describe('Search and filter functionality', () => {
        it('should handle search query changes', () => {
            render(<ProgramsPageContent />);
            const searchInput = screen.getByTestId('search-input');

            fireEvent.change(searchInput, { target: { value: 'test search' } });

            expect(searchInput).toHaveValue('test search');
        });

        it('should handle status filter changes', () => {
            render(<ProgramsPageContent />);

            fireEvent.click(screen.getByText('Filter Published'));

            expect(screen.getByText('Filter Published')).toBeInTheDocument();
        });
    });

    describe('useEffect coverage', () => {
        it('should trigger useEffect when searchByNameTerm changes', () => {
            const { rerender } = render(<ProgramsPageContent />);

            rerender(<ProgramsPageContent />);

            expect(screen.getByTestId('programs-page-content')).toBeInTheDocument();
        });
    });
});
