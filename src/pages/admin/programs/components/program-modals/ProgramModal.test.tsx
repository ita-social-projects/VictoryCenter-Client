import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProgramModal, ProgramModalProps } from './ProgramModal';
import { Program, ProgramCategory } from '../../../../../types/admin/Programs';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { VisibilityStatus } from '../../../../../types/admin/common';

jest.mock('../../../../../services/api/admin/programs/programs-api', () => ({
    ProgramsApi: {
        addProgram: jest.fn(),
        editProgram: jest.fn(),
    },
}));

const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

jest.mock('../../../../../components/common/modal/Modal', () => {
    const MockModal = ({
        isOpen,
        children,
        onClose,
    }: {
        isOpen: boolean;
        children: React.ReactNode;
        onClose: () => void;
    }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        );
    };
    MockModal.Title = ({ children }: { children: React.ReactNode }) => <h2 data-testid="modal-title">{children}</h2>;
    MockModal.Content = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-content">{children}</div>
    );
    MockModal.Actions = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-actions">{children}</div>
    );
    return { Modal: MockModal };
});

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({
        onClick,
        disabled,
        children,
        buttonStyle,
    }: {
        onClick?: () => void;
        disabled?: boolean;
        children: React.ReactNode;
        buttonStyle?: string;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            data-testid={buttonStyle === 'secondary' ? 'draft-button' : 'publish-button'}
        >
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/common/question-modal/QuestionModal', () => ({
    QuestionModal: ({
        isOpen,
        title,
        onConfirm,
        onCancel,
    }: {
        isOpen: boolean;
        title: string;
        onConfirm: () => void;
        onCancel: () => void;
    }) =>
        isOpen ? (
            <div data-testid="question-modal">
                <div data-testid="question-title">{title}</div>
                <button data-testid="question-confirm" onClick={onConfirm}>
                    Yes
                </button>
                <button data-testid="question-cancel" onClick={onCancel}>
                    No
                </button>
            </div>
        ) : null,
}));

const mockFormRef = {
    submit: jest.fn(),
    isDirty: jest.fn(() => false),
    isValid: jest.fn(() => true),
};

let capturedFormProps: any = {};
jest.mock('../program-form/ProgramForm', () => {
    const React = require('react');
    const MockProgramForm = React.forwardRef((props: any, ref: any) => {
        capturedFormProps = props;
        React.useImperativeHandle(ref, () => mockFormRef);

        return <div data-testid="program-form" />;
    });
    return { ProgramForm: MockProgramForm };
});

const mockProgram: Program = {
    id: 1,
    name: 'Test Program',
    description: 'Test Description',
    categories: [{ id: 1, name: 'Category 1', programsCount: 1 }],
    status: VisibilityStatus.Draft,
    img: null,
};

const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Category 1', programsCount: 1 },
    { id: 2, name: 'Category 2', programsCount: 2 },
];

const mockFormData = {
    name: 'Updated Name',
    description: 'Updated Description',
    categories: [mockCategories[0]],
    img: null,
};

describe('ProgramModal', () => {
    const mockOnClose = jest.fn();
    const mockOnAddProgram = jest.fn();
    const mockOnEditProgram = jest.fn();

    const baseProps = {
        isOpen: true,
        onClose: mockOnClose,
        categories: mockCategories,
    };

    const addModeProps: ProgramModalProps = {
        ...baseProps,
        mode: 'add',
        onAddProgram: mockOnAddProgram,
    };

    const editModeProps: ProgramModalProps = {
        ...baseProps,
        mode: 'edit',
        programToEdit: mockProgram,
        onEditProgram: mockOnEditProgram,
    };

    const getModal = () => screen.queryByTestId('modal');
    const getDraftButton = () => screen.getByTestId('draft-button');
    const getPublishButton = () => screen.getByTestId('publish-button');
    const getQuestionModal = () => screen.queryByTestId('question-modal');
    const getQuestionTitle = () => screen.getByTestId('question-title');
    const getQuestionConfirmButton = () => screen.getByTestId('question-confirm');
    const getQuestionCancelButton = () => screen.getByTestId('question-cancel');
    const getModalCloseButton = () => screen.getByTestId('modal-close');
    const getCreateErrorContainer = () => screen.queryByText(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM);
    const getUpdateErrorContainer = () => screen.queryByText(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM);

    const simulateFormBecomesValid = () => {
        act(() => {
            capturedFormProps.onValidationChange(true);
        });
    };

    const simulateFormSubmit = (status: VisibilityStatus) => {
        act(() => {
            capturedFormProps.onSubmit(mockFormData, status);
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormRef.isDirty.mockReturnValue(false);
        mockFormRef.isValid.mockReturnValue(true);
        mockedProgramsApi.addProgram.mockResolvedValue({ ...mockProgram, ...mockFormData });
        mockedProgramsApi.editProgram.mockResolvedValue({ ...mockProgram, ...mockFormData });
    });

    describe('General rendering and closing behavior', () => {
        it('should not render the modal when isOpen is false', () => {
            render(<ProgramModal {...addModeProps} isOpen={false} />);
            expect(getModal()).not.toBeInTheDocument();
        });

        it('should call onClose when the close button is clicked and form is not dirty', () => {
            render(<ProgramModal {...addModeProps} />);
            fireEvent.click(getModalCloseButton());
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should show a confirmation modal when closing with a dirty form', () => {
            mockFormRef.isDirty.mockReturnValue(true);
            render(<ProgramModal {...addModeProps} />);

            fireEvent.click(getModalCloseButton());

            expect(mockOnClose).not.toHaveBeenCalled();
            expect(getQuestionModal()).toBeInTheDocument();
            expect(getQuestionTitle()).toHaveTextContent(
                COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE,
            );
        });

        it('should close the modal after confirming to discard changes', () => {
            mockFormRef.isDirty.mockReturnValue(true);
            render(<ProgramModal {...addModeProps} />);
            fireEvent.click(getModalCloseButton()); // Open confirmation

            fireEvent.click(getQuestionConfirmButton()); // Click "Yes"
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should not close the modal after canceling the discard changes confirmation', () => {
            mockFormRef.isDirty.mockReturnValue(true);
            render(<ProgramModal {...addModeProps} />);
            fireEvent.click(getModalCloseButton()); // Open confirmation

            fireEvent.click(getQuestionCancelButton()); // Click "No"
            expect(mockOnClose).not.toHaveBeenCalled();
            expect(getQuestionModal()).not.toBeInTheDocument();
        });

        it('should start with disabled buttons and enable them when form is valid', () => {
            render(<ProgramModal {...addModeProps} />);
            // Buttons are initially disabled because the form hasn't reported its validity
            expect(getDraftButton()).toBeDisabled();
            expect(getPublishButton()).toBeDisabled();

            // Simulate the form becoming valid
            simulateFormBecomesValid();

            // Buttons should now be enabled
            expect(getDraftButton()).not.toBeDisabled();
            expect(getPublishButton()).not.toBeDisabled();
        });
    });

    describe('Add Mode', () => {
        it('should render with the correct "Add Program" title', () => {
            render(<ProgramModal {...addModeProps} />);
            expect(screen.getByTestId('modal-title')).toHaveTextContent(PROGRAMS_TEXT.FORM.TITLE.ADD_PROGRAM);
        });

        it('should successfully add a program as a draft', async () => {
            render(<ProgramModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getDraftButton());
            expect(mockFormRef.submit).toHaveBeenCalledWith(VisibilityStatus.Draft);

            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(PROGRAMS_TEXT.QUESTION.DRAFT_PROGRAM);

            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockedProgramsApi.addProgram).toHaveBeenCalledWith(
                    expect.objectContaining({ status: VisibilityStatus.Draft }),
                );
            });
            expect(mockOnAddProgram).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should successfully add a program as published', async () => {
            render(<ProgramModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            expect(mockFormRef.submit).toHaveBeenCalledWith(VisibilityStatus.Published);

            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM);

            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockedProgramsApi.addProgram).toHaveBeenCalledWith(
                    expect.objectContaining({ status: VisibilityStatus.Published }),
                );
            });
            expect(mockOnAddProgram).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should show an error message if adding a program fails', async () => {
            mockedProgramsApi.addProgram.mockRejectedValue(new Error('API Error'));
            render(<ProgramModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);
            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(getCreateErrorContainer()).toBeInTheDocument();
            });
            expect(mockOnAddProgram).not.toHaveBeenCalled();
            expect(mockOnClose).not.toHaveBeenCalled();
            expect(getPublishButton()).not.toBeDisabled();
        });

        it('should cancel the submission and not call the API', async () => {
            render(<ProgramModal {...addModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            fireEvent.click(getQuestionCancelButton());

            expect(getQuestionModal()).not.toBeInTheDocument();
            expect(mockedProgramsApi.addProgram).not.toHaveBeenCalled();
            expect(mockOnAddProgram).not.toHaveBeenCalled();
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    // --- Edit Mode ---
    describe('Edit Mode', () => {
        it('should render with the correct "Edit Program" title', () => {
            render(<ProgramModal {...editModeProps} />);
            expect(screen.getByTestId('modal-title')).toHaveTextContent(PROGRAMS_TEXT.FORM.TITLE.EDIT_PROGRAM);
        });

        it('should successfully save changes to a draft program', async () => {
            render(<ProgramModal {...editModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getDraftButton());
            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES);
            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockedProgramsApi.editProgram).toHaveBeenCalledWith(
                    expect.objectContaining({ id: mockProgram.id, status: VisibilityStatus.Draft }),
                );
            });
            expect(mockOnEditProgram).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should show correct confirmation title when publishing a draft program', async () => {
            render(<ProgramModal {...editModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM);
        });

        it('should show correct confirmation title when saving changes to a published program', async () => {
            const publishedProgram = { ...mockProgram, status: VisibilityStatus.Published };
            render(<ProgramModal {...editModeProps} programToEdit={publishedProgram} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES);
        });

        it('should show correct confirmation title when un-publishing a program', async () => {
            const publishedProgram = { ...mockProgram, status: VisibilityStatus.Published };
            render(<ProgramModal {...editModeProps} programToEdit={publishedProgram} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getDraftButton());
            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION);
        });

        it('should show an error message if editing a program fails', async () => {
            mockedProgramsApi.editProgram.mockRejectedValue(new Error('API Error'));
            render(<ProgramModal {...editModeProps} />);
            simulateFormBecomesValid(); // Enable buttons

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);
            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(getUpdateErrorContainer()).toBeInTheDocument();
            });
            expect(mockOnEditProgram).not.toHaveBeenCalled();
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });
});
