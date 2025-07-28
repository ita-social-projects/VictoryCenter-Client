import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramModal, ProgramModalProps } from './ProgramModal';
import { Program } from '../../../../../types/ProgramAdminPage';
import { useProgramModal } from '../../../../../hooks/admin/useProgramModal/useProgramModal';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

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

    const renderProgramModal = (props: ProgramModalProps) => render(<ProgramModal {...props} />);

    const getProgramForm = () => screen.getByTestId('program-form');
    const getDraftButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFTED);
    const getPublishButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED);
    const getQuestionModal = () => screen.queryByTestId('question-modal');
    const getAddTitle = () => screen.queryByText(PROGRAMS_TEXT.FORM.TITLE.ADD_PROGRAM);
    const getEditTitle = () => screen.queryByText(PROGRAMS_TEXT.FORM.TITLE.EDIT_PROGRAM);

    const clickDraftButton = () => fireEvent.click(getDraftButton());
    const clickPublishButton = () => fireEvent.click(getPublishButton());

    const expectButtonsEnabled = () => {
        expect(getDraftButton()).not.toBeDisabled();
        expect(getPublishButton()).not.toBeDisabled();
    };

    const expectButtonsDisabled = () => {
        expect(getDraftButton()).toBeDisabled();
        expect(getPublishButton()).toBeDisabled();
    };

    const expectFormSubmittedWith = (status: string) => {
        expect(mockFormRefSubmit).toHaveBeenCalledWith(status);
    };

    const mockHookWithValues = (overrides = {}) => {
        mockUseProgramModal.mockReturnValue({ ...defaultMockHookValues, ...overrides });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseProgramModal.mockReturnValue(defaultMockHookValues);
    });

    describe('Add mode', () => {
        const addProps: ProgramModalProps = {
            mode: 'add',
            isOpen: true,
            onClose,
            onAddProgram,
            categories: [],
        };

        it('should render correct title for add mode', () => {
            renderProgramModal(addProps);
            expect(getAddTitle()).toBeInTheDocument();
        });

        it('should render the ProgramForm component', () => {
            renderProgramModal(addProps);
            expect(getProgramForm()).toBeInTheDocument();
        });

        it.each([
            { isSubmitting: false, expectation: 'enable', testFn: expectButtonsEnabled },
            { isSubmitting: true, expectation: 'disable', testFn: expectButtonsDisabled },
        ])('should $expectation action buttons when submitting is $isSubmitting', ({ isSubmitting, testFn }) => {
            mockHookWithValues({ isSubmitting });
            renderProgramModal(addProps);
            testFn();
        });

        it.each([
            { buttonAction: clickDraftButton, status: 'Draft', buttonName: 'draft' },
            { buttonAction: clickPublishButton, status: 'Published', buttonName: 'publish' },
        ])('should call form submit with "$status" status on $buttonName button click', ({ buttonAction, status }) => {
            renderProgramModal(addProps);
            buttonAction();
            expectFormSubmittedWith(status);
        });
    });

    describe('Edit mode', () => {
        const editProps: ProgramModalProps = {
            mode: 'edit',
            isOpen: true,
            onClose,
            programToEdit: mockProgram,
            onEditProgram,
            categories: [],
        };

        it('should render correct title for edit mode', () => {
            renderProgramModal(editProps);
            expect(getEditTitle()).toBeInTheDocument();
        });

        it('should display an error message when an error is present', () => {
            const errorText = 'Failed to update';
            mockHookWithValues({ error: errorText });
            renderProgramModal(editProps);
            expect(screen.getByText(errorText)).toBeInTheDocument();
        });

        describe('Confirmation modals', () => {
            it.each([
                {
                    modalType: 'formConfirm',
                    expectedText: COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES,
                    description: 'form confirmation modal',
                },
                {
                    modalType: 'closeConfirm',
                    expectedText: COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE,
                    description: 'close confirmation modal',
                },
            ])('should display $description when it is open', ({ modalType, expectedText }) => {
                mockHookWithValues({
                    modals: {
                        ...defaultMockHookValues.modals,
                        [modalType]: {
                            ...defaultMockHookValues.modals[modalType as keyof typeof defaultMockHookValues.modals],
                            isOpen: true,
                        },
                    },
                });
                renderProgramModal(editProps);
                expect(getQuestionModal()).toBeInTheDocument();
                expect(screen.getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('Program status-based confirmation titles', () => {
            it.each([
                {
                    programStatus: 'Draft' as const,
                    pendingAction: null,
                    expectedText: COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES,
                    description: 'publish changes for draft program',
                },
                {
                    programStatus: 'Published' as const,
                    pendingAction: 'draft',
                    expectedText: COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION,
                    description: 'remove from publication for published program',
                },
            ])(
                'should show "$description" title in confirm modal',
                ({ programStatus, pendingAction, expectedText }) => {
                    mockHookWithValues({
                        pendingAction,
                        modals: {
                            ...defaultMockHookValues.modals,
                            formConfirm: { ...defaultMockHookValues.modals.formConfirm, isOpen: true },
                        },
                    });
                    const programWithStatus = { ...mockProgram, status: programStatus };
                    renderProgramModal({ ...editProps, programToEdit: programWithStatus });
                    expect(screen.getByText(expectedText)).toBeInTheDocument();
                },
            );
        });
    });
});
