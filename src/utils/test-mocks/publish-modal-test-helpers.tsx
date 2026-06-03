import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

export const confirmationModalMockImpl = {
    ConfirmationModal: ({ isOpen, ...p }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <div data-testid="confirmation-title">{p.title}</div>
                <button data-testid="confirm-btn" onClick={p.onConfirm}>
                    {p.confirmText}
                </button>
                <button data-testid="cancel-btn" onClick={p.onCancel}>
                    {p.cancelText}
                </button>
                <button data-testid="close-btn" onClick={p.onClose}>
                    Close
                </button>
            </div>
        ) : null,
};

export function runPublishModalTests<TProps extends { isOpen: boolean; onConfirm: () => void; onCancel: () => void }>(
    Component: React.ComponentType<TProps>,
) {
    const setup = (props: Partial<TProps> = {}) => {
        const defaultProps = { isOpen: true, onConfirm: jest.fn(), onCancel: jest.fn() } as unknown as TProps;
        return render(<Component {...defaultProps} {...props} />);
    };

    it('does not render when isOpen=false', () => {
        setup({ isOpen: false } as Partial<TProps>);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('renders ConfirmationModal with correct texts when open', () => {
        setup();
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-title')).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES);
        expect(screen.getByTestId('confirm-btn')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.YES);
        expect(screen.getByTestId('cancel-btn')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.NO);
    });

    it('calls onConfirm when confirm clicked', () => {
        const onConfirm = jest.fn();
        setup({ onConfirm } as unknown as Partial<TProps>);
        fireEvent.click(screen.getByTestId('confirm-btn'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel clicked', () => {
        const onCancel = jest.fn();
        setup({ onCancel } as unknown as Partial<TProps>);
        fireEvent.click(screen.getByTestId('cancel-btn'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when close clicked', () => {
        const onCancel = jest.fn();
        setup({ onCancel } as unknown as Partial<TProps>);
        fireEvent.click(screen.getByTestId('close-btn'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
}
