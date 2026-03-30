import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CompanyProfileContent } from './CompanyProfileContent';
import { CompanyProfileApi } from '@/services/api/admin/company-profile/company-profile-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { COMPANY_PROFILE_VALIDATION } from '@/const/admin/company-profile';

jest.mock('@/utils/functions/mappers/admin/company-profile/company-profile-mappers', () => ({
    __esModule: true,
    mapCompanyProfileToFormValues: () => ({
        phone: '+380671234567',
        addressUa: 'UA address',
        addressEng: 'EN address',
        email: 'test@example.com',
        correspondenceEmail: 'office@example.com',
        mottoUa: '',
        mottoEng: '',
        requisitesUa: 'UA requisites',
        requisitesEn: 'EN requisites',
        companyRegistrationNumber: '12345678',
        addressUa_requisites: 'UA requisites address',
        addressEn_requisites: 'EN requisites address',
        socialContacts: [],
    }),
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    __esModule: true,
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('../company-profile-logo-header/CompanyProfileLogoHeader', () => ({
    __esModule: true,
    CompanyProfileLogoHeader: () => <div data-testid="company-profile-logo-header" />,
}));

jest.mock('../company-profile-tab/CompanyProfileTab', () => ({
    __esModule: true,
    CompanyProfileTab: (props: any) => {
        const { useFormContext, Controller } = require('react-hook-form');
        const { control, formState } = useFormContext();

        return (
            <div data-testid="tab-profile" data-disabled={String(props.disabled)}>
                <Controller
                    name="phone"
                    control={control}
                    render={({ field }: any) => (
                        <input
                            data-testid="input-phone"
                            disabled={props.disabled}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={() => field.onBlur()}
                        />
                    )}
                />
                <div data-testid="debug-dirty">{String(formState.isDirty)}</div>
            </div>
        );
    },
}));

jest.mock('../company-profile-requisites-tab/CompanyProfileRequisitesTab', () => ({
    __esModule: true,
    CompanyProfileRequisitesTab: (props: any) => (
        <div data-testid="tab-requisites" data-disabled={String(props.disabled)} />
    ),
}));

jest.mock('../company-profile-social-media-tab/CompanyProfileSocialMediaTab', () => ({
    __esModule: true,
    CompanyProfileSocialMediaTab: (props: any) => (
        <div data-testid="tab-socials" data-disabled={String(props.disabled)} />
    ),
}));

jest.mock('@/services/api/admin/company-profile/company-profile-api', () => ({
    __esModule: true,
    CompanyProfileApi: { get: jest.fn() },
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    __esModule: true,
    useAdminClient: jest.fn(),
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    __esModule: true,
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
    __esModule: true,
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
const mockedGet = CompanyProfileApi.get as jest.Mock;
const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('../company-profile-cancel-modal/CompanyProfileCancelModal', () => ({
    __esModule: true,
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
        mockedUseAdminClient.mockReturnValue({ client: 'mock-client' });

        mockedGet.mockResolvedValue({
            profile: {
                id: 1,
                contact: {
                    id: 1,
                    profileId: 1,
                    phone: '',
                    address: '',
                    email: '',
                    correspondenceEmail: '',
                    motto: '',
                    localizations: [],
                },
                requisite: {
                    id: 1,
                    profileId: 1,
                    recipient: '',
                    edrpou: '12345678',
                    address: '',
                    localizations: [],
                },
                socialLinks: [],
            },
            languages: [],
        });
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

    it('calls CompanyProfileApi.get on mount', async () => {
        render(<CompanyProfileContent />);

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledTimes(1);
        });
    });

    it('disables publish when form is dirty but invalid (required phone)', async () => {
        render(<CompanyProfileContent />);

        fireEvent.click(screen.getByTestId('edit-btn'));

        const publishBtn = screen.getByTestId('publish-btn') as HTMLButtonElement;
        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;

        fireEvent.change(phoneInput, { target: { value: '   ' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
            expect(publishBtn).toBeDisabled();
        });

        expect(COMPANY_PROFILE_VALIDATION.common.REQUIRED).toBe("Поле обов'язкове");
    });

    it('enables publish when form is dirty and valid (phone changed)', async () => {
        render(<CompanyProfileContent />);

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(screen.getByTestId('edit-btn'));

        const publishBtn = screen.getByTestId('publish-btn') as HTMLButtonElement;
        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;

        fireEvent.change(phoneInput, { target: { value: '+380671234568' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
            expect(publishBtn).not.toBeDisabled();
        });

        expect(screen.getByTestId('debug-dirty')).toHaveTextContent('true');
    });

    it('exits edit mode after publish (mock save)', async () => {
        render(<CompanyProfileContent />);

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(screen.getByTestId('edit-btn'));

        const publishBtn = screen.getByTestId('publish-btn') as HTMLButtonElement;
        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;

        fireEvent.change(phoneInput, { target: { value: '+380671234568' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
            expect(publishBtn).not.toBeDisabled();
        });

        fireEvent.click(publishBtn);

        await waitFor(() => {
            expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
        });
    });

    it('opens cancel modal when dirty and exits edit mode after confirm cancel', async () => {
        render(<CompanyProfileContent />);

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(screen.getByTestId('edit-btn'));

        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;

        fireEvent.change(phoneInput, { target: { value: '+380671234568' } });
        fireEvent.blur(phoneInput);

        fireEvent.click(screen.getByTestId('cancel-btn'));

        expect(screen.getByTestId('cancel-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('confirm-cancel'));

        await waitFor(() => {
            expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
        });
    });
});
