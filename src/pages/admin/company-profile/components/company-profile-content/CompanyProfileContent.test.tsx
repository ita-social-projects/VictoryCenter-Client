import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CompanyProfileContent } from './CompanyProfileContent';
import { CompanyProfileApi } from '@/services/api/admin/company-profile/company-profile-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { COMPANY_PROFILE_VALIDATION } from '@/const/admin/company-profile';
import { ToastType } from '@/types/admin/toast';

const mockAddToast = jest.fn();

jest.mock('@/validation/admin/company-profile-schema/company-profile-schema', () => ({
    __esModule: true,
    CompanyProfileValidationSchema: {
        validate: async (value: any) => value,
        validateSync: (value: any) => value,
    },
}));

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
    mapFormValuesToCompanyProfilePatch: () => ({ mocked: true }),
}));

jest.mock('@/services/api/admin/company-profile/company-profile-api', () => ({
    __esModule: true,
    CompanyProfileApi: {
        get: jest.fn(),
        publish: jest.fn(),
        __resetMocks: jest.fn(),
    },
}));

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    __esModule: true,
    useToast: () => ({
        addToast: mockAddToast,
        toasts: [],
        removeToast: jest.fn(),
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

jest.mock('../company-profile-cancel-modal/CompanyProfileCancelModal', () => ({
    __esModule: true,
    CompanyProfileCancelModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="cancel-modal">
                <button data-testid="confirm-cancel" onClick={onConfirm}>
                    Confirm
                </button>
                <button data-testid="dismiss-cancel" onClick={onCancel}>
                    Dismiss
                </button>
            </div>
        ) : null,
}));

jest.mock('../company-profile-publish-modal/CompanyProfilePublishModal', () => ({
    __esModule: true,
    CompanyProfilePublishModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="publish-modal">
                <button data-testid="confirm-publish" onClick={onConfirm}>
                    Yes
                </button>
                <button data-testid="cancel-publish" onClick={onCancel}>
                    No
                </button>
            </div>
        ) : null,
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedGet = CompanyProfileApi.get as jest.Mock;
const mockedPublish = CompanyProfileApi.publish as jest.Mock;

describe('CompanyProfileContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue({} as any);

        mockedGet.mockResolvedValue({ profile: { id: 1 }, languages: [] });
        mockedPublish.mockResolvedValue({ profile: { id: 1 }, languages: [] });
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

        await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(1));
    });

    it('disables publish when form is dirty but invalid (required phone)', async () => {
        render(<CompanyProfileContent />);

        fireEvent.click(screen.getByTestId('edit-btn'));

        const publishBtn = screen.getByTestId('publish-btn') as HTMLButtonElement;
        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;

        fireEvent.change(phoneInput, { target: { value: '   ' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => expect(publishBtn).toBeDisabled());
        expect(COMPANY_PROFILE_VALIDATION.common.REQUIRED).toBe("Поле обов'язкове");
    });

    it('opens publish modal on publish click when form is dirty and valid', async () => {
        render(<CompanyProfileContent />);
        await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByTestId('edit-btn'));

        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;
        fireEvent.change(phoneInput, { target: { value: '+380 00 000 00 00' } });
        fireEvent.blur(phoneInput);

        const publishBtn = screen.getByTestId('publish-btn') as HTMLButtonElement;
        await waitFor(() => expect(publishBtn).not.toBeDisabled());

        fireEvent.click(publishBtn);

        expect(await screen.findByTestId('publish-modal')).toBeInTheDocument();
    });

    it("when publish modal 'No' clicked: does not save, exits to view mode, and does not show toast", async () => {
        render(<CompanyProfileContent />);
        await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByTestId('edit-btn'));

        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;
        fireEvent.change(phoneInput, { target: { value: '+380 00 000 00 00' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => expect(screen.getByTestId('publish-btn')).not.toBeDisabled());

        fireEvent.click(screen.getByTestId('publish-btn'));
        await screen.findByTestId('publish-modal');

        fireEvent.click(screen.getByTestId('cancel-publish'));

        expect(await screen.findByTestId('edit-btn')).toBeInTheDocument();

        expect(mockedPublish).not.toHaveBeenCalled();
        expect(mockAddToast).not.toHaveBeenCalled();
    });

    it("when publish modal 'Yes' clicked: saves, exits to view mode, and shows toast", async () => {
        render(<CompanyProfileContent />);
        await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByTestId('edit-btn'));

        const phoneInput = screen.getByTestId('input-phone') as HTMLInputElement;
        fireEvent.change(phoneInput, { target: { value: '+380 00 000 00 00' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => expect(screen.getByTestId('publish-btn')).not.toBeDisabled());

        fireEvent.click(screen.getByTestId('publish-btn'));
        await screen.findByTestId('publish-modal');

        fireEvent.click(screen.getByTestId('confirm-publish'));

        await waitFor(() => expect(mockedPublish).toHaveBeenCalledTimes(1));
        expect(await screen.findByTestId('edit-btn')).toBeInTheDocument();

        expect(mockAddToast).toHaveBeenCalledWith('Зміни успішно опубліковано', ToastType.Success, 3000);
    });
});
