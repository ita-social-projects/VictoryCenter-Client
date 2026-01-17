import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BaseProgramModalProps, ProgramModal, ProgramModalProps } from './ProgramModal';
import { Program, ProgramCategory, ProgramCreateUpdate } from '@/types/admin/programs';
import { ModalMode } from '@/types/admin/common';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramsApi } from '@/services/api/admin/programs/programs-api';
import { VisibilityStatus } from '@/types/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ProgramFormProps, ProgramFormRef } from '@/pages/admin/programs/components/program-form/ProgramForm';
import { ButtonProps } from '@/components/admin/button/Button';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { getInitialSectionContents } from '@/utils/functions/render-program-section';

jest.mock('@/hooks/admin/use-modals-state/useModalsState', () => ({
    useModalsState: jest.fn(),
}));

const mockedUseModalsState = useModalsState as jest.Mock;

jest.mock('@/utils/functions/render-program-section', () => ({
    getInitialSectionContents: jest.fn(() => []),
}));

const mockedGetInitialSectionContents = getInitialSectionContents as jest.Mock;

jest.mock('../add-section-modal/AddSectionModal', () => {
    const React = require('react');
    const { ProgramSectionTemplate } = require('@/types/common/program-sections');

    return {
        AddSectionModal: (props: any) => {
            if (!props.isOpen) return null;
            return (
                <div data-testid="add-section-modal-mock">
                    <button
                        data-testid="add-section-select-template"
                        onClick={() => props.onSelectTemplate(ProgramSectionTemplate.TextOnly)}
                    >
                        select-template
                    </button>
                </div>
            );
        },
    };
});

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;

beforeEach(() => {
    mockedUseAdminClient.mockReturnValue({
        client: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        },
    });
});

jest.mock('@/services/api/admin/programs/programs-api', () => ({
    ProgramsApi: {
        addProgram: jest.fn(),
        editProgram: jest.fn(),
    },
}));

const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

jest.mock('@/components/common/modal/Modal', () => {
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

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ onClick, disabled, children, buttonStyle }: ButtonProps) => (
        <button
            onClick={onClick}
            disabled={disabled}
            data-testid={buttonStyle === 'secondary' ? 'draft-button' : 'publish-button'}
        >
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({
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
    getSections: undefined as undefined | (() => Array<{ order: number }>),
    addSection: jest.fn(),
    removeSection: jest.fn(),
};

let capturedFormProps: any = {};
jest.mock('../../program-form/ProgramForm', () => {
    const React = require('react');
    const MockProgramForm = React.forwardRef((props: ProgramFormProps, ref: ProgramFormRef) => {
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
    previewImage: null,
    backgroundImage: null,
    participantsCount: '',
    meetingsCount: '',
    location: '',
    sections: [],
};

const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Category 1', programsCount: 1 },
    { id: 2, name: 'Category 2', programsCount: 2 },
];

const mockFormData: Partial<Program> = {
    name: 'Updated Name',
    description: 'Updated Description',
    categories: [mockCategories[0]],
    previewImage: null,
};

describe('ProgramModal', () => {
    const mockOnClose = jest.fn();
    const mockOnAddProgram = jest.fn();
    const mockOnEditProgram = jest.fn();

    const baseProps: BaseProgramModalProps = {
        isOpen: true,
        onClose: mockOnClose,
        categories: mockCategories,
    };

    const addModeProps: ProgramModalProps = {
        ...baseProps,
        mode: ModalMode.Add,
        onAddProgram: mockOnAddProgram,
    };

    const editModeProps: ProgramModalProps = {
        ...baseProps,
        mode: ModalMode.Edit,
        programToEdit: mockProgram,
        onEditProgram: mockOnEditProgram,
    };

    const getDraftButton = () => screen.getByTestId('draft-button');
    const getModal = () => screen.queryByTestId('modal');
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
        mockFormRef.getSections = undefined;
        mockFormRef.addSection.mockReset();
        mockFormRef.removeSection.mockReset();

        mockedUseModalsState.mockReturnValue({
            modalState: { isAddSectionModalOpen: false },
            openModalActions: { openAddSectionModal: jest.fn() },
            closeModalActions: { closeAddSectionModal: jest.fn() },
        });
        mockedGetInitialSectionContents.mockReturnValue([]);
        mockedProgramsApi.addProgram.mockResolvedValue({ ...mockProgram, ...mockFormData });
        mockedProgramsApi.editProgram.mockResolvedValue({ ...mockProgram, ...mockFormData });
    });

    describe('Section template + unsaved-section flows', () => {
        it('handleTemplateSelect: falls back to empty sections when getSections is missing (nextOrder=0)', () => {
            mockedUseModalsState.mockReturnValue({
                modalState: { isAddSectionModalOpen: true },
                openModalActions: { openAddSectionModal: jest.fn() },
                closeModalActions: { closeAddSectionModal: jest.fn() },
            });
            mockedGetInitialSectionContents.mockReturnValue([{ contentType: 0, order: 0 }] as any);

            render(<ProgramModal {...addModeProps} />);

            expect(screen.getByTestId('add-section-modal-mock')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('add-section-select-template'));

            expect(mockedGetInitialSectionContents).toHaveBeenCalledWith(ProgramSectionTemplate.TextOnly);
            expect(mockFormRef.addSection).toHaveBeenCalledTimes(1);
            expect(mockFormRef.addSection).toHaveBeenCalledWith({
                template: ProgramSectionTemplate.TextOnly,
                order: 0,
                contents: [{ contentType: 0, order: 0 }],
            });
        });

        it('handleTemplateSelect: computes nextOrder from max existing order (Math.max + 1)', () => {
            mockedUseModalsState.mockReturnValue({
                modalState: { isAddSectionModalOpen: true },
                openModalActions: { openAddSectionModal: jest.fn() },
                closeModalActions: { closeAddSectionModal: jest.fn() },
            });
            mockFormRef.getSections = () => [{ order: 0 }, { order: 5 }];
            mockedGetInitialSectionContents.mockReturnValue([]);

            render(<ProgramModal {...addModeProps} />);
            fireEvent.click(screen.getByTestId('add-section-select-template'));

            expect(mockFormRef.addSection).toHaveBeenCalledWith({
                template: ProgramSectionTemplate.TextOnly,
                order: 6,
                contents: [],
            });
        });

        it('handleRequestCancelSection opens the unsaved-changes modal and handleCloseSectionUnsavedModal closes it', () => {
            render(<ProgramModal {...addModeProps} />);

            act(() => {
                capturedFormProps.onRequestCancelSection(2);
            });

            expect(screen.getByTestId('question-modal')).toBeInTheDocument();
            expect(screen.getByTestId('question-title')).toHaveTextContent(
                PROGRAMS_TEXT.SECTION.MODAL.UNSAVED_CHANGES_TITLE,
            );

            fireEvent.click(screen.getByTestId('question-cancel'));
            expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
        });
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
            fireEvent.click(getModalCloseButton());

            fireEvent.click(getQuestionConfirmButton());
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should not close the modal after canceling the discard changes confirmation', () => {
            mockFormRef.isDirty.mockReturnValue(true);
            render(<ProgramModal {...addModeProps} />);
            fireEvent.click(getModalCloseButton());

            fireEvent.click(getQuestionCancelButton());
            expect(mockOnClose).not.toHaveBeenCalled();
            expect(getQuestionModal()).not.toBeInTheDocument();
        });

        it('should start with disabled buttons and enable them when form is valid', () => {
            render(<ProgramModal {...addModeProps} />);
            expect(getDraftButton()).toBeDisabled();
            expect(getPublishButton()).toBeDisabled();

            simulateFormBecomesValid();

            expect(getDraftButton()).not.toBeDisabled();
            expect(getPublishButton()).not.toBeDisabled();
        });
    });

    describe('Add Mode', () => {
        it('should successfully add a program as a draft', async () => {
            render(<ProgramModal {...addModeProps} />);
            simulateFormBecomesValid();

            fireEvent.click(getDraftButton());
            expect(mockFormRef.submit).toHaveBeenCalledWith(VisibilityStatus.Draft);

            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(PROGRAMS_TEXT.QUESTION.DRAFT_PROGRAM);

            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockedProgramsApi.addProgram).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining<Partial<ProgramCreateUpdate>>({
                        name: mockFormData.name,
                        description: mockFormData.description,
                        categoryIds: [1],
                        status: VisibilityStatus.Draft,
                        previewImage: null,
                        previewImageId: null,
                        id: null,
                    }),
                );
            });

            expect(mockOnAddProgram).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should successfully add a program as published', async () => {
            render(<ProgramModal {...addModeProps} />);
            simulateFormBecomesValid();

            fireEvent.click(getPublishButton());
            expect(mockFormRef.submit).toHaveBeenCalledWith(VisibilityStatus.Published);

            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM);

            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockedProgramsApi.addProgram).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining<Partial<ProgramCreateUpdate>>({
                        name: mockFormData.name,
                        description: mockFormData.description,
                        categoryIds: [1],
                        status: VisibilityStatus.Published,
                        previewImageId: null,
                    }),
                );
            });
            expect(mockOnAddProgram).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should show an error message if adding a program fails', async () => {
            mockedProgramsApi.addProgram.mockRejectedValue(new Error('API Error'));
            render(<ProgramModal {...addModeProps} />);
            simulateFormBecomesValid();

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
            simulateFormBecomesValid();

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            fireEvent.click(getQuestionCancelButton());

            expect(getQuestionModal()).not.toBeInTheDocument();

            expect(mockedProgramsApi.addProgram).not.toHaveBeenCalled();
            expect(mockOnAddProgram).not.toHaveBeenCalled();

            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Edit Mode', () => {
        it('should successfully save changes to a draft program', async () => {
            render(<ProgramModal {...editModeProps} />);
            simulateFormBecomesValid();

            fireEvent.click(getDraftButton());
            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES);
            fireEvent.click(getQuestionConfirmButton());

            await waitFor(() => {
                expect(mockedProgramsApi.editProgram).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<ProgramCreateUpdate>>({
                        id: mockProgram.id,
                        name: mockFormData.name,
                        description: mockFormData.description,
                        categoryIds: [1],
                        status: VisibilityStatus.Draft,
                        previewImageId: null,
                    }),
                    expect.any(Object),
                );
            });
            expect(mockOnEditProgram).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should show correct confirmation title when publishing a draft program', async () => {
            render(<ProgramModal {...editModeProps} />);
            simulateFormBecomesValid();

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(PROGRAMS_TEXT.QUESTION.PUBLISH_PROGRAM);
        });

        it('should show correct confirmation title when saving changes to a published program', async () => {
            const publishedProgram = { ...mockProgram, status: VisibilityStatus.Published };
            render(<ProgramModal {...editModeProps} programToEdit={publishedProgram} />);
            simulateFormBecomesValid();

            fireEvent.click(getPublishButton());
            simulateFormSubmit(VisibilityStatus.Published);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES);
        });

        it('should show correct confirmation title when un-publishing a program', async () => {
            const publishedProgram = { ...mockProgram, status: VisibilityStatus.Published };
            render(<ProgramModal {...editModeProps} programToEdit={publishedProgram} />);
            simulateFormBecomesValid();

            fireEvent.click(getDraftButton());
            simulateFormSubmit(VisibilityStatus.Draft);

            expect(getQuestionTitle()).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION);
        });

        it('should show an error message if editing a program fails', async () => {
            mockedProgramsApi.editProgram.mockRejectedValue(new Error('API Error'));
            render(<ProgramModal {...editModeProps} />);
            simulateFormBecomesValid();

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
