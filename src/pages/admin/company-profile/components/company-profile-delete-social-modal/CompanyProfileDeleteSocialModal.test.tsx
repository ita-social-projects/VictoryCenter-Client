import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanyProfileDeleteSocialModal } from './CompanyProfileDeleteSocialModal';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

describe('CompanyProfileDeleteSocialModal', () => {
    it('does not render when isOpen=false', () => {
        render(<CompanyProfileDeleteSocialModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />);
        expect(screen.queryByText(COMPANY_PROFILE_TEXT.MODAL.DELETE_SOCIAL_TITLE)).not.toBeInTheDocument();
    });

    it('renders modal with correct title and buttons when open', () => {
        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);

        expect(screen.getByText(COMPANY_PROFILE_TEXT.MODAL.DELETE_SOCIAL_TITLE)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
    });

    it('calls onConfirm when YES clicked', () => {
        const onConfirm = jest.fn();

        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={onConfirm} onCancel={jest.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when NO clicked', () => {
        const onCancel = jest.fn();

        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={jest.fn()} onCancel={onCancel} />);

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when close icon clicked', () => {
        const onCancel = jest.fn();

        render(<CompanyProfileDeleteSocialModal isOpen={true} onConfirm={jest.fn()} onCancel={onCancel} />);

        fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
