import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerBanner } from './PartnerBannerForm';
import { useDataFetch } from '../../../../../hooks/common/use-data-fetch/useDataFetch';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { PARTNER_BANNER_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/partner-schema/partner-schema';
import { ToastType } from '../../../../../types/admin/toast';

jest.mock('../../../../../components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => (
        <div data-testid="inline-loader">Loader size {size}</div>
    ),
}));

jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
}));

jest.mock('../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: ({ label, value, onChange, error, disabled, name }: any) => (
        <div>
            <span>{label}</span>
            <button
                type="button"
                onClick={() => onChange({ base64: 'base64-image', mimeType: 'image/png' })}
                disabled={disabled}
            >
                Change image
            </button>
            <button type="button" onClick={() => onChange(null)} disabled={disabled}>
                Remove image
            </button>
            {value ? <span data-testid={`${name}-value`}>Image selected</span> : null}
            {error ? <span data-testid={`${name}-error`}>{error}</span> : null}
        </div>
    ),
}));

jest.mock(
    '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup',
    () => ({
        InputWithCharacterLimitGroup: ({ label, value, onChange, disabled, name }: any) => (
            <label>
                {label}
                <input
                    data-testid={`${name}-input`}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                />
            </label>
        ),
    }),
);

jest.mock(
    '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ label, value, onChange, disabled, name }: any) => (
            <label>
                {label}
                <textarea
                    data-testid={`${name}-textarea`}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                />
            </label>
        ),
    }),
);

jest.mock('../../../../../hooks/common/use-data-fetch/useDataFetch');
jest.mock('../../../../../services/api/admin/partners/partners-api');
jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient');
jest.mock('../../../../../contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('../../../../../validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_BANNER_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateDescription: jest.fn(),
        validateImage: jest.fn(),
    },
}));

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedPartnersApi = PartnersApi as jest.Mocked<typeof PartnersApi>;
const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

const mockValidateTitle = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle as jest.Mock;
const mockValidateDescription = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;
const mockValidateImage = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateImage as jest.Mock;

describe('PartnerBanner', () => {
    const mockRefetch = jest.fn();
    const mockSetData = jest.fn();
    const mockAddToast = jest.fn();

    const defaultBannerData = {
        title: 'Initial Title',
        description: 'Initial Description',
        image: { id: 1, url: 'initial.jpg', mimeType: 'image/jpeg' },
        imageId: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue('mock-client');
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
        mockedUseDataFetch.mockReturnValue({
            data: defaultBannerData,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        mockValidateTitle.mockImplementation((value: string) =>
            value ? undefined : 'Title is required',
        );
        mockValidateDescription.mockImplementation((value: string) =>
            value ? undefined : 'Description is required',
        );
        mockValidateImage.mockImplementation((value: unknown) =>
            value ? undefined : 'Image is required',
        );
    });

    it('renders loader while banner data is loading', () => {
        mockedUseDataFetch.mockReturnValueOnce({
            data: null,
            isLoading: true,
            error: null,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
    });

    it('shows error message and allows retry when banner fetch fails', () => {
        const refetchMock = jest.fn();
        mockedUseDataFetch.mockReturnValueOnce({
            data: null,
            isLoading: false,
            error: new Error('Failed to load'),
            refetch: refetchMock,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        expect(
            screen.getByText(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Спробувати ще' }));
        expect(refetchMock).toHaveBeenCalledTimes(1);
    });

    it('renders banner form with fetched data and validates field updates', async () => {
        render(<PartnerBanner />);

        const titleInput = await screen.findByTestId('title-input');
        const descriptionTextarea = screen.getByTestId('description-textarea');

        expect(titleInput).toHaveValue(defaultBannerData.title);
        expect(descriptionTextarea).toHaveValue(defaultBannerData.description);
        expect(screen.getByText(PARTNERS_TEXT.FORM.LABEL.IMAGE)).toBeInTheDocument();

        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        expect(mockValidateTitle).toHaveBeenCalledWith('Updated Title');

        await waitFor(() => {
            expect(titleInput).toHaveValue('Updated Title');
        });

        fireEvent.change(descriptionTextarea, { target: { value: 'Updated Description' } });
        expect(mockValidateDescription).toHaveBeenCalledWith('Updated Description');

        fireEvent.click(screen.getByRole('button', { name: 'Change image' }));
        expect(mockValidateImage).toHaveBeenCalledWith({ base64: 'base64-image', mimeType: 'image/png' });
    });

    it('disables publish button when validation fails and re-enables when corrected', async () => {
        render(<PartnerBanner />);

        const titleInput = await screen.findByTestId('title-input');
        const publishButton = await screen.findByRole('button', {
            name: COMMON_TEXT_ADMIN.BUTTON.PUBLISH,
        });

        expect(publishButton).toBeEnabled();

        fireEvent.change(titleInput, { target: { value: '' } });

        await waitFor(() => {
            expect(mockValidateTitle).toHaveBeenCalledWith('');
            expect(publishButton).toBeDisabled();
        });

        fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

        await waitFor(() => {
            expect(mockValidateTitle).toHaveBeenCalledWith('Valid Title');
            expect(publishButton).toBeEnabled();
        });
    });

    it('publishes banner successfully and shows success toast', async () => {
        const updatedBanner = {
            ...defaultBannerData,
            title: 'Published Title',
            description: 'Published Description',
        };
        mockedPartnersApi.updateBanner.mockResolvedValue(updatedBanner);

        render(<PartnerBanner />);

        const titleInput = await screen.findByTestId('title-input');
        const descriptionTextarea = screen.getByTestId('description-textarea');
        const publishButton = await screen.findByRole('button', {
            name: COMMON_TEXT_ADMIN.BUTTON.PUBLISH,
        });

        fireEvent.change(titleInput, { target: { value: updatedBanner.title } });
        fireEvent.change(descriptionTextarea, { target: { value: updatedBanner.description } });

        fireEvent.click(publishButton);

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledWith('mock-client', {
                title: updatedBanner.title,
                description: updatedBanner.description,
                image: defaultBannerData.image,
                imageId: defaultBannerData.imageId,
            });
        });

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                PARTNERS_TEXT.MESSAGE.BANNER_SAVED,
                ToastType.Success,
            );
        });

        await waitFor(() => {
            expect(titleInput).toHaveValue(updatedBanner.title);
            expect(descriptionTextarea).toHaveValue(updatedBanner.description);
        });
    });

    it('shows error toast when publishing banner fails', async () => {
        mockedPartnersApi.updateBanner.mockRejectedValue(new Error('Update failed'));

        render(<PartnerBanner />);

        const publishButton = await screen.findByRole('button', {
            name: COMMON_TEXT_ADMIN.BUTTON.PUBLISH,
        });

        fireEvent.click(publishButton);

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledWith('mock-client', {
                title: defaultBannerData.title,
                description: defaultBannerData.description,
                image: defaultBannerData.image,
                imageId: defaultBannerData.imageId,
            });
        });

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_BANNER,
                ToastType.Error,
            );
        });
    });
});

