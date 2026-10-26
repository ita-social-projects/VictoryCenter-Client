import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GenericModalWrapper } from './GenericModalWrapper';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { VisibilityStatus } from '@/types/admin/common';
import { ButtonValidationState } from '@/hooks/admin/use-generic-modal/useGenericModal';

jest.mock('@/components/common/modal/Modal', () => {
    const MockModal = ({
        isOpen,
        onClose,
        children,
        fullscreen,
        className,
    }: {
        isOpen: boolean;
        onClose: () => void;
        children: React.ReactNode;
        fullscreen?: boolean;
        className?: string;
    }) =>
        isOpen ? (
            <div data-testid="modal" data-fullscreen={String(!!fullscreen)} className={className}>
                <button data-testid="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        ) : null;
    MockModal.Title = ({ children }: { children: React.ReactNode }) => <h1 data-testid="modal-title">{children}</h1>;
    MockModal.Content = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-content">{children}</div>
    );
    MockModal.Actions = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-actions">{children}</div>
    );
    return { Modal: MockModal };
});

jest.mock('@/components/admin/button/Button', () => ({
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
            disabled={disabled}
            onClick={onClick}
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
        isButtonsDisabled,
        onConfirm,
        onCancel,
        onClose,
        confirmText,
        cancelText,
    }: {
        isOpen: boolean;
        title: string;
        isButtonsDisabled?: boolean;
        onConfirm: () => void;
        onCancel: () => void;
        onClose: () => void;
        confirmText?: string;
        cancelText?: string;
    }) =>
        isOpen ? (
            <div data-testid="confirmation" data-title={title}>
                <button data-testid="confirmation-confirm" disabled={isButtonsDisabled} onClick={onConfirm}>
                    {confirmText}
                </button>
                <button data-testid="confirmation-cancel" disabled={isButtonsDisabled} onClick={onCancel}>
                    {cancelText}
                </button>
                <button data-testid="confirmation-dismiss" onClick={onClose}>
                    dismiss
                </button>
            </div>
        ) : null,
}));

const ACTION_TITLE = 'Action confirmation title';
const EXIT_TITLE = COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE;

type WrapperProps = React.ComponentProps<typeof GenericModalWrapper>;

describe('GenericModalWrapper', () => {
    const handlers = {
        onClose: jest.fn(),
        onFormValidationChange: jest.fn(),
        onFormSubmit: jest.fn(),
        onDraftSubmit: jest.fn(),
        onPublishSubmit: jest.fn(),
        onActionConfirm: jest.fn(),
        onActionCancel: jest.fn(),
        onActionDismiss: jest.fn(),
        onExitConfirm: jest.fn(),
        onExitCancel: jest.fn(),
    };

    const validButtons: ButtonValidationState = { isDraftValid: true, isPublishValid: true };

    const renderFormImpl = (formProps: any) => (
        <div data-testid="form" data-key={formProps.key} data-disabled={String(formProps.formDisabled)} />
    );
    const renderForm = jest.fn();

    const baseProps = (): WrapperProps =>
        ({
            isOpen: true,
            title: 'Modal title',
            formRef: { current: null },
            formKey: 'form-key',
            initialData: null,
            renderForm,
            isSubmitting: false,
            error: '',
            buttonStates: validButtons,
            isActionConfirmationOpen: false,
            actionConfirmationTitle: ACTION_TITLE,
            isExitConfirmationOpen: false,
            ...handlers,
        }) as WrapperProps;

    const renderWrapper = (overrides: Partial<WrapperProps> = {}) =>
        render(<GenericModalWrapper {...baseProps()} {...(overrides as object)} />);

    const click = (testId: string) => fireEvent.click(screen.getByTestId(testId));

    const getConfirmation = () => screen.queryByTestId('confirmation');
    const getAllConfirmations = () => screen.queryAllByTestId('confirmation');

    beforeEach(() => {
        jest.clearAllMocks();
        renderForm.mockImplementation(renderFormImpl);
    });

    describe('modal rendering', () => {
        it('renders nothing when closed', () => {
            renderWrapper({ isOpen: false });

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('renders title when provided and omits it otherwise', () => {
            const { unmount } = renderWrapper();
            expect(screen.getByTestId('modal-title')).toHaveTextContent('Modal title');
            unmount();

            renderWrapper({ title: undefined });
            expect(screen.queryByTestId('modal-title')).not.toBeInTheDocument();
        });

        it.each([
            ['default', undefined, 'false'],
            ['enabled', true, 'true'],
        ])('passes fullscreen flag (%s) to Modal', (_name, fullScreen, expected) => {
            renderWrapper({ fullScreen });

            expect(screen.getByTestId('modal')).toHaveAttribute('data-fullscreen', expected);
        });

        it('passes className to Modal', () => {
            renderWrapper({ className: 'custom-class' });

            expect(screen.getByTestId('modal')).toHaveClass('custom-class');
        });
    });

    describe('renderForm', () => {
        it('passes ref, key, initialData, handlers and disabled state to the form', () => {
            const formRef = { current: null };
            const initialData = { name: 'value' };
            renderWrapper({ formRef, formKey: 7, initialData } as Partial<WrapperProps>);

            expect(renderForm).toHaveBeenCalledWith({
                ref: formRef,
                key: 7,
                initialData,
                formDisabled: false,
                onSubmit: handlers.onFormSubmit,
                onValidationChange: handlers.onFormValidationChange,
            });
        });

        it('disables the form while submitting', () => {
            renderWrapper({ isSubmitting: true });

            expect(screen.getByTestId('form')).toHaveAttribute('data-disabled', 'true');
        });

        it('forwards categories only when provided', () => {
            const categories = [{ id: 1 }];
            renderWrapper({ categories });
            expect(renderForm).toHaveBeenLastCalledWith(expect.objectContaining({ categories }));

            renderForm.mockClear();
            renderWrapper();
            expect(renderForm.mock.calls[0][0]).not.toHaveProperty('categories');
        });

        it('shows the error message only when error is set', () => {
            const { unmount } = renderWrapper({ error: 'Something failed' });
            expect(screen.getByText('Something failed')).toBeInTheDocument();
            unmount();

            renderWrapper({ error: '' });
            expect(document.querySelector('.modal-content-error-container')).not.toBeInTheDocument();
        });
    });

    describe('action buttons', () => {
        it.each([
            ['draft-button', 'onDraftSubmit', COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT],
            ['publish-button', 'onPublishSubmit', COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED],
        ] as const)('%s shows its label and calls %s', (testId, handlerName, label) => {
            renderWrapper();

            expect(screen.getByTestId(testId)).toHaveTextContent(label);
            click(testId);

            expect(handlers[handlerName]).toHaveBeenCalledTimes(1);
        });

        it('hides the draft button when showDraftButton is false', () => {
            renderWrapper({ showDraftButton: false });

            expect(screen.queryByTestId('draft-button')).not.toBeInTheDocument();
            expect(screen.getByTestId('publish-button')).toBeInTheDocument();
        });

        it.each([
            ['draft-button', { isDraftValid: false, isPublishValid: true }],
            ['publish-button', { isDraftValid: true, isPublishValid: false }],
        ])('disables %s when its validation state is false', (testId, buttonStates) => {
            renderWrapper({ buttonStates });

            expect(screen.getByTestId(testId)).toBeDisabled();
        });

        it('enables both buttons when both states are valid', () => {
            renderWrapper();

            expect(screen.getByTestId('draft-button')).not.toBeDisabled();
            expect(screen.getByTestId('publish-button')).not.toBeDisabled();
        });

        it('disables both buttons while submitting', () => {
            renderWrapper({ isSubmitting: true });

            expect(screen.getByTestId('draft-button')).toBeDisabled();
            expect(screen.getByTestId('publish-button')).toBeDisabled();
        });
    });

    describe('closing the modal', () => {
        it('calls onClose when no confirmation is open', () => {
            renderWrapper();

            click('modal-close');

            expect(handlers.onClose).toHaveBeenCalledTimes(1);
        });

        it.each([
            ['action', { isActionConfirmationOpen: true }],
            ['exit', { isExitConfirmationOpen: true }],
        ])('does not call onClose while the %s confirmation is open', (_name, overrides) => {
            renderWrapper(overrides);

            click('modal-close');

            expect(handlers.onClose).not.toHaveBeenCalled();
        });
    });

    describe('action confirmation', () => {
        const renderActionConfirmation = (overrides: Partial<WrapperProps> = {}) =>
            renderWrapper({ isActionConfirmationOpen: true, ...overrides });

        it('is not rendered when closed', () => {
            renderWrapper();

            expect(getConfirmation()).not.toBeInTheDocument();
        });

        it('renders with the provided title and Yes/No labels', () => {
            renderActionConfirmation();

            expect(getConfirmation()).toHaveAttribute('data-title', ACTION_TITLE);
            expect(screen.getByTestId('confirmation-confirm')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.YES);
            expect(screen.getByTestId('confirmation-cancel')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.NO);
        });

        it('calls onActionConfirm on confirm', () => {
            renderActionConfirmation();

            click('confirmation-confirm');

            expect(handlers.onActionConfirm).toHaveBeenCalledTimes(1);
        });

        it('calls only onActionCancel when "No" is clicked', () => {
            renderActionConfirmation();

            click('confirmation-cancel');

            expect(handlers.onActionCancel).toHaveBeenCalledTimes(1);
            expect(handlers.onActionDismiss).not.toHaveBeenCalled();
        });

        it('calls only onActionDismiss on dismiss (Esc / overlay / X)', () => {
            renderActionConfirmation();

            click('confirmation-dismiss');

            expect(handlers.onActionDismiss).toHaveBeenCalledTimes(1);
            expect(handlers.onActionCancel).not.toHaveBeenCalled();
        });

        it('falls back to onActionCancel on dismiss when onActionDismiss is not provided', () => {
            renderActionConfirmation({ onActionDismiss: undefined });

            click('confirmation-dismiss');

            expect(handlers.onActionCancel).toHaveBeenCalledTimes(1);
        });

        it('disables confirm and cancel buttons while submitting', () => {
            renderActionConfirmation({ isSubmitting: true });

            expect(screen.getByTestId('confirmation-confirm')).toBeDisabled();
            expect(screen.getByTestId('confirmation-cancel')).toBeDisabled();
        });
    });

    describe('exit confirmation', () => {
        const renderExitConfirmation = (overrides: Partial<WrapperProps> = {}) =>
            renderWrapper({ isExitConfirmationOpen: true, ...overrides });

        it('renders with the "changes will be lost" title and Yes/No labels', () => {
            renderExitConfirmation();

            expect(getConfirmation()).toHaveAttribute('data-title', EXIT_TITLE);
            expect(screen.getByTestId('confirmation-confirm')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.YES);
            expect(screen.getByTestId('confirmation-cancel')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.NO);
        });

        it('calls onExitConfirm on confirm', () => {
            renderExitConfirmation();

            click('confirmation-confirm');

            expect(handlers.onExitConfirm).toHaveBeenCalledTimes(1);
        });

        it.each([
            ['"No"', 'confirmation-cancel'],
            ['dismiss', 'confirmation-dismiss'],
        ])('calls onExitCancel on %s and ignores onActionDismiss', (_name, testId) => {
            renderExitConfirmation();

            click(testId);

            expect(handlers.onExitCancel).toHaveBeenCalledTimes(1);
            expect(handlers.onActionDismiss).not.toHaveBeenCalled();
            expect(handlers.onActionCancel).not.toHaveBeenCalled();
        });

        it('does not disable buttons while submitting', () => {
            renderExitConfirmation({ isSubmitting: true });

            expect(screen.getByTestId('confirmation-confirm')).not.toBeDisabled();
            expect(screen.getByTestId('confirmation-cancel')).not.toBeDisabled();
        });
    });

    describe('both confirmations', () => {
        it('renders both confirmations when both flags are set', () => {
            renderWrapper({ isActionConfirmationOpen: true, isExitConfirmationOpen: true });

            const titles = getAllConfirmations().map((el) => el.getAttribute('data-title'));
            expect(titles).toEqual([ACTION_TITLE, EXIT_TITLE]);
        });
    });

    it('uses VisibilityStatus-agnostic submit handler as passed through', () => {
        renderWrapper();
        const { onSubmit } = renderForm.mock.calls[0][0];

        onSubmit({ a: 1 }, VisibilityStatus.Draft);

        expect(handlers.onFormSubmit).toHaveBeenCalledWith({ a: 1 }, VisibilityStatus.Draft);
    });
});
