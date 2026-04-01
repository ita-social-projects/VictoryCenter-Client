import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanyProfileDeleteSocialModal } from './CompanyProfileDeleteSocialModal';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, confirmText, cancelText, onConfirm, onCancel, onClose }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <div data-testid="confirmation-title">{title}</div>
                <button data-testid="confirm-btn" onClick={onConfirm}>
                    {confirmText}
                </button>
                <button data-testid="cancel-btn" onClick={onCancel}>
                    {cancelText}
                </button>
                <button data-testid="close-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
}));

describe('CompanyProfileDeleteSocialModal', () => {
    it('does not render when isOpen=false', () => {
        render(<CompanyProfileDeleteSocialModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('renders ConfirmationModal with correct texts when open', () => {
        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-title')).toHaveTextContent(
            COMPANY_PROFILE_TEXT.MODAL.DELETE_SOCIAL_TITLE,
        );
        expect(screen.getByTestId('confirm-btn')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.YES);
        expect(screen.getByTestId('cancel-btn')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.NO);
    });

    it('calls onConfirm when confirm clicked', () => {
        const onConfirm = jest.fn();
        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={onConfirm} onCancel={jest.fn()} />);

        fireEvent.click(screen.getByTestId('confirm-btn'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel clicked', () => {
        const onCancel = jest.fn();
        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={jest.fn()} onCancel={onCancel} />);

        fireEvent.click(screen.getByTestId('cancel-btn'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when close clicked', () => {
        const onCancel = jest.fn();
        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={jest.fn()} onCancel={onCancel} />);

        fireEvent.click(screen.getByTestId('close-btn'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
