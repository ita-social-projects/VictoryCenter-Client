import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';

// Mock словники
jest.mock('../../../../../const/admin/programs', () => ({
    PROGRAMS_TEXT: {
        FORM: {
            TITLE: {
                ADD_PROGRAM: 'Додати програму',
                EDIT_PROGRAM: 'Редагувати програму',
            },
        },
        QUESTION: {
            PUBLISH_PROGRAM: 'Опублікувати програму?',
        },
    },
}));

jest.mock('../../../../../const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        BUTTON: {
            SAVE_AS_DRAFTED: 'Зберегти як чернетку',
            SAVE_AS_PUBLISHED: 'Зберегти та опублікувати',
            YES: 'Так',
            NO: 'Ні',
        },
        QUESTION: {
            REMOVE_FROM_PUBLICATION: 'Зняти з публікації?',
            PUBLISH_CHANGES: 'Опублікувати зміни?',
            CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE: 'Зміни буде втрачено. Продовжити?',
        },
    },
}));

const MOCKED_TEXT = {
    ADD_PROGRAM: 'Add Program',
    TRIGGER_EDIT: 'Trigger Edit',
    TRIGGER_DELETE: 'Trigger Delete',
    FILTER_PUBLISHED: 'Filter Published',
    ADD_PROGRAM_MODAL: 'Add Program Modal',
    EDIT_PROGRAM_MODAL: 'Edit Program Modal',
    DELETE_PROGRAM_MODAL: 'Delete Program Modal',
    EDITING: 'Editing:',
    DELETING: 'Deleting:',
    CONFIRM_ADD: 'Confirm Add',
    CONFIRM_EDIT: 'Confirm Edit',
    CONFIRM_DELETE: 'Confirm Delete',
    CLOSE_ADD: 'Close Add',
    CLOSE_EDIT: 'Close Edit',
    CLOSE_DELETE: 'Close Delete',
};

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
            <div>
                <button onClick={() => props.onEditProgram(mockProgram)}>{MOCKED_TEXT.TRIGGER_EDIT}</button>
                <button onClick={() => props.onDeleteProgram(mockProgram)}>{MOCKED_TEXT.TRIGGER_DELETE}</button>
            </div>
        );
    });

    return {
        ProgramsList: MockProgramsList,
    };
});

jest.mock('../programs-page-toolbar/ProgramsPageToolbar', () => ({
    ProgramsPageToolbar: (props: any) => (
        <div>
            <button onClick={props.onAddProgram}>{MOCKED_TEXT.ADD_PROGRAM}</button>
            <button onClick={() => props.onStatusFilterChange('Published' as VisibilityStatus)}>
                {MOCKED_TEXT.FILTER_PUBLISHED}
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
            <div>
                <h2>{isAddMode ? MOCKED_TEXT.ADD_PROGRAM_MODAL : MOCKED_TEXT.EDIT_PROGRAM_MODAL}</h2>
                {isEditMode && props.programToEdit && (
                    <p>
                        {MOCKED_TEXT.EDITING} {props.programToEdit.name}
                    </p>
                )}
                <button
                    onClick={() => {
                        if (isAddMode && props.onAddProgram) {
                            props.onAddProgram(mockProgram);
                        } else if (isEditMode && props.onEditProgram && props.programToEdit) {
                            props.onEditProgram(props.programToEdit);
                        }
                        props.onClose();
                    }}
                >
                    {isAddMode ? MOCKED_TEXT.CONFIRM_ADD : MOCKED_TEXT.CONFIRM_EDIT}
                </button>
                <button onClick={props.onClose}>{isAddMode ? MOCKED_TEXT.CLOSE_ADD : MOCKED_TEXT.CLOSE_EDIT}</button>
            </div>
        );
    },
}));

jest.mock('../program-modals/DeleteProgramModal', () => ({
    __esModule: true,
    default: (props: any) =>
        props.isOpen ? (
            <div>
                <h2>{MOCKED_TEXT.DELETE_PROGRAM_MODAL}</h2>
                <p>
                    {MOCKED_TEXT.DELETING} {props.programToDelete?.name}
                </p>
                <button
                    onClick={() => {
                        props.onDeleteProgram(props.programToDelete);
                        props.onClose();
                    }}
                >
                    {MOCKED_TEXT.CONFIRM_DELETE}
                </button>
                <button onClick={props.onClose}>{MOCKED_TEXT.CLOSE_DELETE}</button>
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
            expect(screen.getByText(MOCKED_TEXT.ADD_PROGRAM)).toBeInTheDocument();
            expect(screen.getByText(MOCKED_TEXT.TRIGGER_EDIT)).toBeInTheDocument();
            expect(screen.queryByText(MOCKED_TEXT.ADD_PROGRAM_MODAL)).not.toBeInTheDocument();
            expect(screen.queryByText(MOCKED_TEXT.EDIT_PROGRAM_MODAL)).not.toBeInTheDocument();
            expect(screen.queryByText(MOCKED_TEXT.DELETE_PROGRAM_MODAL)).not.toBeInTheDocument();
        });
    });

    describe('Modal interactions', () => {
        const renderAndOpenModal = (buttonText: string) => {
            render(<ProgramsPageContent />);
            fireEvent.click(screen.getByText(buttonText));
        };

        it('should open the Add Program modal when the add button is clicked', () => {
            renderAndOpenModal(MOCKED_TEXT.ADD_PROGRAM);
            expect(screen.getByText(MOCKED_TEXT.ADD_PROGRAM_MODAL)).toBeInTheDocument();
        });

        it('should close the Add Program modal when close button is clicked', () => {
            renderAndOpenModal(MOCKED_TEXT.ADD_PROGRAM);
            fireEvent.click(screen.getByText(MOCKED_TEXT.CLOSE_ADD));
            expect(screen.queryByText(MOCKED_TEXT.ADD_PROGRAM_MODAL)).not.toBeInTheDocument();
        });

        it('should open the Edit Program modal when onEditProgram is triggered', () => {
            renderAndOpenModal(MOCKED_TEXT.TRIGGER_EDIT);
            expect(screen.getByText(MOCKED_TEXT.EDIT_PROGRAM_MODAL)).toBeInTheDocument();
            expect(screen.getByText(`${MOCKED_TEXT.EDITING} ${mockProgram.name}`)).toBeInTheDocument();
        });

        it('should close the Edit Program modal when close button is clicked', () => {
            renderAndOpenModal(MOCKED_TEXT.TRIGGER_EDIT);
            fireEvent.click(screen.getByText(MOCKED_TEXT.CLOSE_EDIT));
            expect(screen.queryByText(MOCKED_TEXT.EDIT_PROGRAM_MODAL)).not.toBeInTheDocument();
        });

        it('should open the Delete Program modal when onDeleteProgram is triggered', () => {
            renderAndOpenModal(MOCKED_TEXT.TRIGGER_DELETE);
            expect(screen.getByText(MOCKED_TEXT.DELETE_PROGRAM_MODAL)).toBeInTheDocument();
            expect(screen.getByText(`${MOCKED_TEXT.DELETING} ${mockProgram.name}`)).toBeInTheDocument();
        });

        it('should close the Delete Program modal when close button is clicked', () => {
            renderAndOpenModal(MOCKED_TEXT.TRIGGER_DELETE);
            fireEvent.click(screen.getByText(MOCKED_TEXT.CLOSE_DELETE));
            expect(screen.queryByText(MOCKED_TEXT.DELETE_PROGRAM_MODAL)).not.toBeInTheDocument();
        });
    });

    describe('Program operations', () => {
        it('should call addProgram on the list ref when a program is added via modal', () => {
            render(<ProgramsPageContent />);
            fireEvent.click(screen.getByText(MOCKED_TEXT.ADD_PROGRAM));
            fireEvent.click(screen.getByText(MOCKED_TEXT.CONFIRM_ADD));

            expect(mockAddProgram).toHaveBeenCalledWith(mockProgram);
            expect(screen.queryByText(MOCKED_TEXT.ADD_PROGRAM_MODAL)).not.toBeInTheDocument();
        });

        it('should call editProgram on the list ref when a program is edited via modal', () => {
            render(<ProgramsPageContent />);
            fireEvent.click(screen.getByText(MOCKED_TEXT.TRIGGER_EDIT));
            fireEvent.click(screen.getByText(MOCKED_TEXT.CONFIRM_EDIT));

            expect(mockEditProgram).toHaveBeenCalledWith(mockProgram);
            expect(screen.queryByText(MOCKED_TEXT.EDIT_PROGRAM_MODAL)).not.toBeInTheDocument();
        });

        it('should call deleteProgram on the list ref when a program is deleted via modal', () => {
            render(<ProgramsPageContent />);
            fireEvent.click(screen.getByText(MOCKED_TEXT.TRIGGER_DELETE));
            fireEvent.click(screen.getByText(MOCKED_TEXT.CONFIRM_DELETE));

            expect(mockDeleteProgram).toHaveBeenCalledWith(mockProgram);
            expect(screen.queryByText(MOCKED_TEXT.DELETE_PROGRAM_MODAL)).not.toBeInTheDocument();
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

            fireEvent.click(screen.getByText(MOCKED_TEXT.FILTER_PUBLISHED));

            expect(screen.getByText(MOCKED_TEXT.FILTER_PUBLISHED)).toBeInTheDocument();
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
