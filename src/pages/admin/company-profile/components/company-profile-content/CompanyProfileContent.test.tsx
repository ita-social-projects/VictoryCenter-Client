import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CompanyProfileContent } from './CompanyProfileContent';

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('../company-profile-logo-header/CompanyProfileLogoHeader', () => ({
    CompanyProfileLogoHeader: () => <div data-testid="company-profile-logo-header" />,
}));

jest.mock('../company-profile-tab/CompanyProfileTab', () => ({
    CompanyProfileTab: (props: any) => <div data-testid="tab-profile" data-disabled={String(props.disabled)} />,
}));

jest.mock('../company-profile-requisites-tab/CompanyProfileRequisitesTab', () => ({
    CompanyProfileRequisitesTab: (props: any) => (
        <div data-testid="tab-requisites" data-disabled={String(props.disabled)} />
    ),
}));

jest.mock('../company-profile-social-media-tab/CompanyProfileSocialMediaTab', () => ({
    CompanyProfileSocialMediaTab: (props: any) => (
        <div data-testid="tab-socials" data-disabled={String(props.disabled)} />
    ),
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, onCategorySelect, selectedCategory }: any) => (
        <div data-testid="category-bar">
            {categories.map((c: any) => (
                <button
                    key={c.id}
                    data-testid={`tab-btn-${c.id}`}
                    disabled={selectedCategory?.id === c.id}
                    onClick={() => onCategorySelect(c)}
                >
                    {c.label}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('../company-profile-toolbar/CompanyProfileToolbar', () => ({
    ProfileToolbar: ({ isEditMode, onEdit, onCancel, onPublish, isPublishDisabled }: any) => {
        const { COMPANY_PROFILE_TEXT } = require('@/const/admin/company-profile');

        return (
            <div data-testid="profile-toolbar">
                {!isEditMode ? (
                    <button type="button" data-testid="edit-btn" onClick={onEdit}>
                        {COMPANY_PROFILE_TEXT.TOOLBAR.EDIT_PAGE}
                    </button>
                ) : (
                    <>
                        <button type="button" data-testid="cancel-btn" onClick={onCancel}>
                            {COMPANY_PROFILE_TEXT.TOOLBAR.CANCEL}
                        </button>
                        <button
                            type="button"
                            data-testid="publish-btn"
                            onClick={onPublish}
                            disabled={isPublishDisabled}
                        >
                            {COMPANY_PROFILE_TEXT.TOOLBAR.PUBLISH}
                        </button>
                    </>
                )}
            </div>
        );
    },
}));

const mockOnConfirm = jest.fn();
const mockOnCancel = jest.fn();

jest.mock('../company-profile-cancel-modal/CompanyProfileCancelModal', () => ({
    CompanyProfileCancelModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="cancel-modal">
                <button
                    data-testid="confirm-cancel"
                    onClick={() => {
                        mockOnConfirm();
                        onConfirm();
                    }}
                >
                    Confirm
                </button>
                <button
                    data-testid="dismiss-cancel"
                    onClick={() => {
                        mockOnCancel();
                        onCancel();
                    }}
                >
                    Dismiss
                </button>
            </div>
        ) : null,
}));

describe('CompanyProfileContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders default tab (profile) and allows tab switching in view mode', () => {
        render(<CompanyProfileContent />);

        expect(screen.getByTestId('tab-profile')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('tab-btn-requisites'));
        expect(screen.getByTestId('tab-requisites')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('tab-btn-socials'));
        expect(screen.getByTestId('tab-socials')).toBeInTheDocument();
    });

    it('enters edit mode and disables tab switching', () => {
        render(<CompanyProfileContent />);

        fireEvent.click(screen.getByTestId('edit-btn'));
        expect(screen.getByTestId('tab-profile')).toHaveAttribute('data-disabled', 'false');
        fireEvent.click(screen.getByTestId('tab-btn-requisites'));
        expect(screen.getByTestId('tab-profile')).toBeInTheDocument();
    });

    it('exits edit mode on cancel when form is not dirty', () => {
        render(<CompanyProfileContent />);

        fireEvent.click(screen.getByTestId('edit-btn'));
        fireEvent.click(screen.getByTestId('cancel-btn'));
        expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
    });
});
