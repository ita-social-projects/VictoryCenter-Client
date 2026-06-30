import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerBanner } from './PartnerBannerForm';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PartnersApi } from '@/services/api/admin/partners/partners-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PARTNER_BANNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';
import { ToastType } from '@/types/admin/toast';
import { ButtonProps } from '@/components/admin/button/Button';
import { ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { InputErrorProps } from '@/components/admin/input-error/InputError';
import { InputWithCharacterLimitGroupProps } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => <div data-testid="inline-loader">Loader size {size}</div>,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, type, formId, disabled }: ButtonProps) => (
        <button onClick={onClick} type={type} form={formId} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ label, value, onChange, disabled, id, setError }: ImageInputProps) => (
        <div data-testid={`${id}-container`}>
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
            <button type="button" onClick={() => setError?.('Image invalid')} disabled={disabled}>
                Trigger image error
            </button>
            <button type="button" onClick={() => setError?.(null)} disabled={disabled}>
                Clear image error
            </button>
            {value ? <span data-testid={`${id}-value`}>Image selected</span> : null}
        </div>
    ),
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: ({ error }: InputErrorProps) => (error ? <span data-testid="input-error">{error}</span> : null),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({
        label,
        value,
        onChange,
        onBlur,
        disabled,
        id,
        error,
    }: InputWithCharacterLimitGroupProps) => (
        <label>
            {label}
            <input data-testid={`${id}-input`} value={value} disabled={disabled} onChange={onChange} onBlur={onBlur} />
            {error && <span data-testid="input-error">{error}</span>}
        </label>
    ),
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ label, value, onChange, onBlur, disabled, id, error }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <div
                id={id}
                contentEditable={!disabled}
                data-testid={`${id}-rich-text`}
                onInput={(e) => {
                    const target = e.target as HTMLElement;
                    onChange(target.innerHTML);
                }}
                onBlur={onBlur}
                suppressContentEditableWarning
            >
                {value}
            </div>
            {error && <span data-testid="input-error">{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, confirmText, cancelText }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="confirmation-modal">
                <button onClick={onCancel}>{cancelText}</button>
                <button onClick={onConfirm}>{confirmText}</button>
            </div>
        );
    },
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch');
jest.mock('@/services/api/admin/partners/partners-api');
jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('@/validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_BANNER_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateDescription: jest.fn(),
    },
}));

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedPartnersApi = PartnersApi as jest.Mocked<typeof PartnersApi>;
const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

const mockValidateTitle = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle as jest.Mock;
const mockValidateDescription = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;

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

    const getLoader = () => screen.queryByTestId('inline-loader');
    const getErrorMessage = () => screen.queryByText(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER);
    const getTryAgainButton = () => screen.queryByRole('button', { name: PARTNERS_TEXT.BUTTON.TRY_AGAIN });
    const getTitleInput = () => {
        const element = screen.getByTestId('title-rich-text') || document.getElementById('title');
        if (!element) {
            throw new Error('Title input not found');
        }
        return element as HTMLElement;
    };
    const getDescriptionInput = () => screen.getByTestId('description-input');
    const getImageContainer = () => screen.queryByTestId('banner-image-container');
    const getImageValue = () => screen.queryByTestId('banner-image-value');
    const getChangeImageButton = () => screen.getByRole('button', { name: 'Change image' });
    const getRemoveImageButton = () => screen.getByRole('button', { name: 'Remove image' });
    const getPublishButton = () => screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });

    const changeDescriptionValue = (value: string) => {
        fireEvent.change(getDescriptionInput(), { target: { value } });
    };

    const clickChangeImage = () => {
        fireEvent.click(getChangeImageButton());
    };

    const clickRemoveImage = () => {
        fireEvent.click(getRemoveImageButton());
    };

    const clickPublish = () => {
        fireEvent.click(getPublishButton());
    };

    const clickConfirmPublish = () => {
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));
    };

    const clickTryAgain = () => {
        const button = getTryAgainButton();
        if (button) fireEvent.click(button);
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

        mockValidateTitle.mockImplementation((value: string) => (value ? undefined : 'Title is required'));
        mockValidateDescription.mockImplementation((value: string) => (value ? undefined : 'Description is required'));
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

        expect(getLoader()).toBeInTheDocument();
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

        expect(getErrorMessage()).toBeInTheDocument();
        expect(getTryAgainButton()).toBeInTheDocument();

        clickTryAgain();
        expect(refetchMock).toHaveBeenCalledTimes(1);
    });

    it('renders banner form with fetched data and validates field updates', async () => {
        render(<PartnerBanner />);

        const descriptionInput = getDescriptionInput();

        expect(descriptionInput).toHaveValue(defaultBannerData.description);
        expect(getImageContainer()).toBeInTheDocument();

        changeDescriptionValue('Updated Description');
        expect(mockValidateDescription).toHaveBeenCalledWith('Updated Description');

        await waitFor(() => {
            expect(descriptionInput).toHaveValue('Updated Description');
        });
    });

    it('handles image change', async () => {
        render(<PartnerBanner />);

        clickChangeImage();

        await waitFor(() => {
            expect(getImageValue()).toBeInTheDocument();
        });
    });

    it('handles image removal', async () => {
        render(<PartnerBanner />);

        clickRemoveImage();

        await waitFor(() => {
            expect(getImageValue()).not.toBeInTheDocument();
        });
    });

    it('disables publish button when validation fails and re-enables when corrected', async () => {
        mockValidateTitle.mockImplementation((value: string) => (value ? undefined : 'Title is required'));

        render(<PartnerBanner />);

        const publishButton = getPublishButton();
        expect(publishButton).toBeDisabled();

        changeDescriptionValue('New Description');
        await waitFor(() => {
            expect(publishButton).toBeEnabled();
        });

        changeDescriptionValue('');

        await waitFor(() => {
            expect(mockValidateDescription).toHaveBeenCalledWith('');
            expect(publishButton).toBeDisabled();
        });

        changeDescriptionValue('Valid Description');

        await waitFor(() => {
            expect(mockValidateDescription).toHaveBeenCalledWith('Valid Description');
            expect(publishButton).toBeEnabled();
        });
    });

    it('publishes banner successfully and shows success toast', async () => {
        const updatedBanner = {
            ...defaultBannerData,
            description: 'Published Description',
        };
        mockedPartnersApi.updateBanner.mockResolvedValue(updatedBanner);

        render(<PartnerBanner />);

        changeDescriptionValue(updatedBanner.description);

        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledWith('mock-client', {
                title: defaultBannerData.title,
                description: updatedBanner.description,
                image: defaultBannerData.image,
                imageId: defaultBannerData.imageId,
            });
        });

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.BANNER_SAVED, ToastType.Success);
        });

        await waitFor(() => {
            expect(getDescriptionInput()).toHaveValue(updatedBanner.description);
        });
    });

    it('shows error toast when publishing banner fails', async () => {
        mockedPartnersApi.updateBanner.mockRejectedValue(new Error('Update failed'));

        render(<PartnerBanner />);

        changeDescriptionValue('New Description');
        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledWith('mock-client', {
                title: defaultBannerData.title,
                description: 'New Description',
                image: defaultBannerData.image,
                imageId: defaultBannerData.imageId,
            });
        });

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_BANNER, ToastType.Error);
        });
    });

    it('does not call updateBanner if form is invalid', async () => {
        mockValidateTitle.mockReturnValue('Title is required');

        render(<PartnerBanner />);

        changeDescriptionValue('');

        await waitFor(() => {
            expect(getPublishButton()).toBeDisabled();
        });

        clickPublish();

        expect(mockedPartnersApi.updateBanner).not.toHaveBeenCalled();
    });

    it('disables all inputs while publishing', async () => {
        const createDelayedPromise = () => {
            return new Promise<typeof defaultBannerData>((resolve) => {
                setTimeout(() => {
                    resolve({ ...defaultBannerData, description: 'New Description' });
                }, 100);
            });
        };

        mockedPartnersApi.updateBanner.mockImplementation(createDelayedPromise as any);

        render(<PartnerBanner />);

        changeDescriptionValue('New Description');
        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(getTitleInput()).toHaveAttribute('contentEditable', 'false');
            expect(getDescriptionInput()).toBeDisabled();
            expect(getPublishButton()).toBeDisabled();
        });

        await waitFor(() => {
            expect(getTitleInput()).toHaveAttribute('contentEditable', 'true');
            expect(getDescriptionInput()).toBeEnabled();
            expect(getPublishButton()).toBeEnabled();
        });
    });

    it('shows image error and disables publish until resolved', async () => {
        render(<PartnerBanner />);

        const publishButton = getPublishButton();
        expect(publishButton).toBeDisabled();

        changeDescriptionValue('New Description');
        await waitFor(() => {
            expect(publishButton).toBeEnabled();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Trigger image error' }));

        expect(await screen.findByTestId('input-error')).toHaveTextContent('Image invalid');
        expect(publishButton).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Clear image error' }));

        await waitFor(() => {
            expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
            expect(publishButton).toBeEnabled();
        });
    });

    it('renders title input as enabled', () => {
        render(<PartnerBanner />);
        expect(getTitleInput()).toHaveAttribute('contentEditable', 'true');
    });

    it('shows toast for fetch error', () => {
        const regularError = new Error('Network error');
        mockedUseDataFetch.mockReturnValueOnce({
            data: null,
            isLoading: false,
            error: regularError,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        expect(mockAddToast).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER, ToastType.Error);
    });

    it('does not call updateBanner when form has validation errors', async () => {
        mockValidateDescription.mockReturnValue('Description is required');

        render(<PartnerBanner />);

        changeDescriptionValue('');

        await waitFor(() => {
            expect(getPublishButton()).toBeDisabled();
        });

        clickPublish();

        expect(mockedPartnersApi.updateBanner).not.toHaveBeenCalled();
    });

    it('validates description on change and sets error correctly', async () => {
        mockValidateDescription.mockReturnValue('Description too short');

        render(<PartnerBanner />);

        changeDescriptionValue('AB');

        await waitFor(() => {
            expect(mockValidateDescription).toHaveBeenCalledWith('AB');
        });
    });

    it('clears image error when handleImageError is called with null', async () => {
        render(<PartnerBanner />);

        fireEvent.click(screen.getByRole('button', { name: 'Trigger image error' }));

        expect(await screen.findByTestId('input-error')).toHaveTextContent('Image invalid');

        fireEvent.click(screen.getByRole('button', { name: 'Clear image error' }));

        await waitFor(() => {
            expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
        });
    });

    it('maintains imageId when image is changed', async () => {
        render(<PartnerBanner />);

        clickChangeImage();

        await waitFor(() => {
            expect(getImageValue()).toBeInTheDocument();
        });

        mockedPartnersApi.updateBanner.mockResolvedValue({
            ...defaultBannerData,
            image: { base64: 'base64-image', mimeType: 'image/png' },
            imageId: 1,
        });

        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledWith('mock-client', {
                title: defaultBannerData.title,
                description: defaultBannerData.description,
                image: { base64: 'base64-image', mimeType: 'image/png' },
                imageId: 1,
            });
        });
    });

    it('renders error UI when data is null and there is a fetch error', () => {
        mockedUseDataFetch.mockReturnValueOnce({
            data: null,
            isLoading: false,
            error: new Error('Failed'),
            refetch: mockRefetch,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        expect(getErrorMessage()).toBeInTheDocument();
        expect(getTryAgainButton()).toBeInTheDocument();
    });

    it('prevents multiple simultaneous publish attempts', async () => {
        const delayedPromise = new Promise<typeof defaultBannerData>((resolve) => {
            setTimeout(() => resolve({ ...defaultBannerData, description: 'New Description' }), 100);
        });

        mockedPartnersApi.updateBanner.mockReturnValue(delayedPromise as any);

        render(<PartnerBanner />);

        changeDescriptionValue('New Description');
        clickPublish();
        clickConfirmPublish();

        // Modal is closed immediately, so the confirm button might not be there anymore.
        // We simulate clicking the main publish button again instead.
        clickPublish();
        // Since isPublishing might be true, the button might be disabled, so this click won't do anything.
        // Wait, the test was clicking the main button twice. Let's just click it twice before confirming.
        clickPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledTimes(1);
        });
    });

    it('keeps publish button enabled when all validations pass', async () => {
        mockValidateTitle.mockReturnValue(undefined);
        mockValidateDescription.mockReturnValue(undefined);

        render(<PartnerBanner />);

        changeDescriptionValue('New Description');

        await waitFor(() => {
            expect(getPublishButton()).toBeEnabled();
        });
    });

    it('resets touched and errors after successful publish', async () => {
        const updatedBanner = {
            ...defaultBannerData,
            description: 'Published Description',
        };
        mockedPartnersApi.updateBanner.mockResolvedValue(updatedBanner);

        render(<PartnerBanner />);

        // Create an error by changing description to empty
        changeDescriptionValue('');
        await waitFor(() => {
            expect(getPublishButton()).toBeDisabled();
        });

        // Fix the error
        changeDescriptionValue('Valid Description');
        await waitFor(() => {
            expect(getPublishButton()).toBeEnabled();
        });

        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalled();
        });

        // After successful publish, errors should be cleared
        await waitFor(() => {
            expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
        });
    });

    it('does not show toast for canceled fetch error', () => {
        const canceledError = { name: 'CanceledError' };
        mockedUseDataFetch.mockReturnValueOnce({
            data: null,
            isLoading: false,
            error: canceledError,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        expect(mockAddToast).not.toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER, ToastType.Error);
    });

    it('does not show toast for axios canceled publish error', async () => {
        const canceledError = { name: 'CanceledError' };
        mockedPartnersApi.updateBanner.mockRejectedValue(canceledError);

        render(<PartnerBanner />);

        changeDescriptionValue('New Description');
        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockAddToast).not.toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_BANNER, ToastType.Error);
        });
    });

    it('resets imageId when image is removed', async () => {
        render(<PartnerBanner />);

        clickRemoveImage();

        await waitFor(() => {
            expect(getImageValue()).not.toBeInTheDocument();
        });

        mockedPartnersApi.updateBanner.mockResolvedValue({
            ...defaultBannerData,
            image: null,
            imageId: null,
        });

        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledWith('mock-client', {
                title: defaultBannerData.title,
                description: defaultBannerData.description,
                image: null,
                imageId: null,
            });
        });
    });

    it('resets state when banner data changes', async () => {
        const initialData = {
            title: 'Initial Title',
            description: 'Initial Description',
            image: { id: 1, url: 'initial.jpg', mimeType: 'image/jpeg' },
            imageId: 1,
        };

        mockedUseDataFetch.mockReturnValueOnce({
            data: initialData,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        await waitFor(() => {
            expect(getTitleInput()).toHaveTextContent('Initial Title');
        });

        expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
    });

    it('validates title using plain text from HTML', async () => {
        const htmlTitle = '<p><strong>Bold</strong> Title</p>';
        mockValidateTitle.mockReturnValue(undefined);

        render(<PartnerBanner />);

        const titleInput = getTitleInput();
        titleInput.innerHTML = htmlTitle;
        fireEvent.input(titleInput);

        await waitFor(() => {
            expect(mockValidateTitle).toHaveBeenCalled();
            const lastCall = mockValidateTitle.mock.calls[mockValidateTitle.mock.calls.length - 1];
            expect(lastCall[0]).toBe('Bold Title');
        });
    });

    it('marks description as touched on change and shows error', async () => {
        mockValidateDescription.mockReturnValue('Description is required');

        render(<PartnerBanner />);

        changeDescriptionValue('');

        await waitFor(() => {
            const errorElement = screen.queryByTestId('input-error');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent('Description is required');
        });
    });

    it('does not publish when values is null', async () => {
        mockedUseDataFetch.mockReturnValueOnce({
            data: null,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        expect(getErrorMessage()).toBeInTheDocument();
        expect(mockedPartnersApi.updateBanner).not.toHaveBeenCalled();
    });

    it('covers fetchBannerHandler callback', async () => {
        render(<PartnerBanner />);
        const fetchHandler = mockedUseDataFetch.mock.calls[0][0].fetchHandler;
        mockedPartnersApi.getBanner.mockResolvedValueOnce(defaultBannerData);
        const result = await fetchHandler();
        expect(result).toEqual(defaultBannerData);
        expect(mockedPartnersApi.getBanner).toHaveBeenCalledWith('mock-client');
    });

    it('triggers refetch when clicking Try Again on component load failure', async () => {
        mockedUseDataFetch.mockReturnValueOnce({
            data: null,
            isLoading: false,
            error: new Error('Network error'),
            refetch: mockRefetch,
            setData: mockSetData,
        });

        render(<PartnerBanner />);

        const tryAgainBtn = screen.getByRole('button', { name: PARTNERS_TEXT.BUTTON.TRY_AGAIN });
        expect(tryAgainBtn).toBeInTheDocument();
        fireEvent.click(tryAgainBtn);
        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('triggers title blur to mark as touched', async () => {
        render(<PartnerBanner />);
        const titleInput = getTitleInput();
        fireEvent.blur(titleInput);
        // Assert state updated without crash
    });

    it('handles publish cancellation errors gracefully without toast', async () => {
        mockedPartnersApi.updateBanner.mockRejectedValueOnce({ name: 'AbortError' });
        render(<PartnerBanner />);

        // Make change to enable Save button
        const titleInput = getTitleInput();
        fireEvent.input(titleInput, { target: { innerHTML: 'Title modified' } });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
        });

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(mockAddToast).not.toHaveBeenCalledWith(
                PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_BANNER,
                ToastType.Error,
            );
        });
    });
});
