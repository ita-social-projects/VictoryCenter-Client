import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramModal, ProgramModalProps } from './ProgramModal';
import { Program } from '../../../../../types/ProgramAdminPage';
import { useProgramModal } from '../../../../../hooks/admin/useProgramModal/useProgramModal';

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
    PROGRAMS_TEXT: {
        FORM: {
            TITLE: {
                ADD_PROGRAM: 'Додати програму',
                EDIT_PROGRAM: 'Редагувати програму',
            },
        },
    },
    COMMON_TEXT_ADMIN: {
        BUTTON: {
            SAVE_AS_DRAFTED: 'Зберегти як чернетку',
            SAVE_AS_PUBLISHED: 'Зберегти та опублікувати',
        },
        QUESTION: {
            REMOVE_FROM_PUBLICATION: 'Зняти з публікації?',
            PUBLISH_CHANGES: 'Опублікувати зміни?',
            CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE: 'Зміни буде втрачено. Продовжити?',
        },
    },
};

jest.mock('../../../../../components/common/modal/Modal', () => {
    const MockModal = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
        isOpen ? <div data-testid="modal">{children}</div> : null;

    MockModal.Title = ({ children }: { children: React.ReactNode }) => <h2 data-testid="modal-title">{children}</h2>;
    MockModal.Content = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-content">{children}</div>
    );
    MockModal.Actions = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-actions">{children}</div>
    );

    return {
        Modal: MockModal,
    };
});

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({
        onClick,
        disabled,
        children,
    }: {
        onClick?: () => void;
        disabled?: boolean;
        children: React.ReactNode;
    }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/common/question-modal/QuestionModal', () => ({
    QuestionModal: ({ isOpen, title }: { isOpen: boolean; title: string }) =>
        isOpen ? <div data-testid="question-modal">{title}</div> : null,
}));

const mockFormRefSubmit = jest.fn();
jest.mock('../program-form/ProgramForm', () => {
    const React = require('react');

    const MockProgramForm = React.forwardRef((props: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
            submit: mockFormRefSubmit,
        }));
        return <div data-testid="program-form" />;
    });

    return {
        ProgramForm: MockProgramForm,
        __esModule: true,
    };
});

jest.mock('../../../../../hooks/admin/useProgramModal/useProgramModal');
const mockUseProgramModal = useProgramModal as jest.Mock;

const mockProgram: Program = {
    id: 1,
    name: 'Test Program',
    description: 'Test Description',
    categories: [{ id: 1, name: 'Category 1', programsCount: 1 }],
    status: 'Draft',
    img: 'test.jpg',
};

describe('ProgramModal', () => {
    const onClose = jest.fn();
    const onAddProgram = jest.fn();
    const onEditProgram = jest.fn();

    const mockFormRef = {
        current: { submit: mockFormRefSubmit },
    };

    const defaultMockHookValues = {
        formRef: mockFormRef,
        isSubmitting: false,
        error: '',
        initialData: null,
        pendingAction: null,
        modals: {
            formConfirm: { isOpen: false, onConfirm: jest.fn(), onCancel: jest.fn() },
            closeConfirm: { isOpen: false, onConfirm: jest.fn(), onCancel: jest.fn() },
        },
        handleFormSubmit: jest.fn(),
        handleClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseProgramModal.mockReturnValue(defaultMockHookValues);
    });

    describe('in "add" mode', () => {
        const addProps: ProgramModalProps = {
            mode: 'add',
            isOpen: true,
            onClose,
            onAddProgram,
        };

        it('should render correct title for add mode', () => {
            render(<ProgramModal {...addProps} />);
            expect(screen.getByText(MOCKED_TEXT.PROGRAMS_TEXT.FORM.TITLE.ADD_PROGRAM)).toBeInTheDocument();
        });

        it('should render the ProgramForm component', () => {
            render(<ProgramModal {...addProps} />);
            expect(screen.getByTestId('program-form')).toBeInTheDocument();
        });

        it('should enable action buttons when not submitting', () => {
            render(<ProgramModal {...addProps} />);
            expect(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED)).not.toBeDisabled();
            expect(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED)).not.toBeDisabled();
        });

        it('should disable action buttons when submitting', () => {
            mockUseProgramModal.mockReturnValue({ ...defaultMockHookValues, isSubmitting: true });
            render(<ProgramModal {...addProps} />);
            expect(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED)).toBeDisabled();
            expect(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED)).toBeDisabled();
        });

        it('should call form submit with "Draft" status on draft button click', () => {
            render(<ProgramModal {...addProps} />);
            fireEvent.click(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED));
            expect(mockFormRefSubmit).toHaveBeenCalledWith('Draft');
        });

        it('should call form submit with "Published" status on publish button click', () => {
            render(<ProgramModal {...addProps} />);
            fireEvent.click(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED));
            expect(mockFormRefSubmit).toHaveBeenCalledWith('Published');
        });
    });

    describe('in "edit" mode', () => {
        const editProps: ProgramModalProps = {
            mode: 'edit',
            isOpen: true,
            onClose,
            programToEdit: mockProgram,
            onEditProgram,
        };

        it('should render correct title for edit mode', () => {
            render(<ProgramModal {...editProps} />);
            expect(screen.getByText(MOCKED_TEXT.PROGRAMS_TEXT.FORM.TITLE.EDIT_PROGRAM)).toBeInTheDocument();
        });

        it('should display an error message when an error is present', () => {
            const errorText = 'Failed to update';
            mockUseProgramModal.mockReturnValue({ ...defaultMockHookValues, error: errorText });
            render(<ProgramModal {...editProps} />);
            expect(screen.getByText(errorText)).toBeInTheDocument();
        });

        it('should display form confirmation modal when it is open', () => {
            mockUseProgramModal.mockReturnValue({
                ...defaultMockHookValues,
                modals: {
                    ...defaultMockHookValues.modals,
                    formConfirm: { ...defaultMockHookValues.modals.formConfirm, isOpen: true },
                },
            });
            render(<ProgramModal {...editProps} />);
            expect(screen.getByTestId('question-modal')).toBeInTheDocument();
            expect(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();
        });

        it('should display close confirmation modal when it is open', () => {
            mockUseProgramModal.mockReturnValue({
                ...defaultMockHookValues,
                modals: {
                    ...defaultMockHookValues.modals,
                    closeConfirm: { ...defaultMockHookValues.modals.closeConfirm, isOpen: true },
                },
            });
            render(<ProgramModal {...editProps} />);
            expect(screen.getByTestId('question-modal')).toBeInTheDocument();
            expect(
                screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
            ).toBeInTheDocument();
        });

        it('should show "publish changes" title in confirm modal for a draft program', () => {
            mockUseProgramModal.mockReturnValue({
                ...defaultMockHookValues,
                modals: {
                    ...defaultMockHookValues.modals,
                    formConfirm: { ...defaultMockHookValues.modals.formConfirm, isOpen: true },
                },
            });
            const draftProgram = { ...mockProgram, status: 'Draft' as const };
            render(<ProgramModal {...editProps} programToEdit={draftProgram} />);
            expect(screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();
        });

        it('should show "remove from publication" title in confirm modal for a published program', () => {
            mockUseProgramModal.mockReturnValue({
                ...defaultMockHookValues,
                pendingAction: 'draft',
                modals: {
                    ...defaultMockHookValues.modals,
                    formConfirm: { ...defaultMockHookValues.modals.formConfirm, isOpen: true },
                },
            });
            const publishedProgram = { ...mockProgram, status: 'Published' as const };
            render(<ProgramModal {...editProps} programToEdit={publishedProgram} />);
            expect(
                screen.getByText(MOCKED_TEXT.COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION),
            ).toBeInTheDocument();
        });
    });
});
