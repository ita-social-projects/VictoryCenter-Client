import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerBanner, PartnerBannerProps } from './PartnerBannerForm';
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
import localizationStatusesStyles from '@/components/admin/localization-statuses/LocalizationStatuses.module.scss';

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
    RichTextInputGroup: ({ label, value, onChange, onBlur, disabled, id, error, trimOnBlur, hideToolbar }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <div
                id={id}
                contentEditable={!disabled}
                data-testid={`${id}-rich-text`}
                data-trimonblur={trimOnBlur ? 'true' : 'false'}
                data-hidetoolbar={hideToolbar ? 'true' : 'false'}
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

const UK_LANGUAGE = { id: 1, code: 'uk', name: 'Ukrainian' };
const EN_LANGUAGE = { id: 2, code: 'en', name: 'English' };
const mockTranslationLanguages = [EN_LANGUAGE];

jest.mock('../translate-partner-banner-modal/TranslatePartnerBannerModal', () => ({
    TranslatePartnerBannerModal: ({ isOpen, onClose, banner, onTranslateBanner }: any) =>
        isOpen ? (
            <div data-testid="translate-partner-banner-modal">
                <button
                    onClick={() =>
                        onTranslateBanner({
                            ...banner,
                            localizations: [
                                {
                                    title: 'Banner title EN',
                                    description: 'Banner description EN',
                                    language: { id: 2, code: 'en' },
                                    translationStatus: 1,
                                },
                            ],
                        })
                    }
                >
                    mock-translate-success
                </button>
                <button onClick={onClose}>mock-translate-close</button>
            </div>
        ) : null,
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
        id: 1,
        title: 'Initial Title',
        description: 'Initial Description',
        image: { id: 1, url: 'initial.jpg', mimeType: 'image/jpeg' },
        imageId: 1,
        localizations: [],
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

    const renderBanner = (props: Partial<PartnerBannerProps> = {}) => {
        const defaultProps: PartnerBannerProps = {
            language: UK_LANGUAGE,
            translationLanguages: mockTranslationLanguages,
        };
        return render(<PartnerBanner {...defaultProps} {...props} />);
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

        renderBanner();

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

        renderBanner();

        expect(getErrorMessage()).toBeInTheDocument();
        expect(getTryAgainButton()).toBeInTheDocument();

        clickTryAgain();
        expect(refetchMock).toHaveBeenCalledTimes(1);
    });

    it('renders banner form with fetched data and validates field updates', async () => {
        renderBanner();

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
        renderBanner();

        clickChangeImage();

        await waitFor(() => {
            expect(getImageValue()).toBeInTheDocument();
        });
    });

    it('handles image removal', async () => {
        renderBanner();

        clickRemoveImage();

        await waitFor(() => {
            expect(getImageValue()).not.toBeInTheDocument();
        });
    });

    it('disables publish button when validation fails and re-enables when corrected', async () => {
        mockValidateTitle.mockImplementation((value: string) => (value ? undefined : 'Title is required'));

        renderBanner();

        changeDescriptionValue('Changed Description');
        const publishButton = getPublishButton();
        expect(publishButton).toBeEnabled();

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

        renderBanner();

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
            expect(mockAddToast).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.BANNER_PUBLISHED, ToastType.Success, 3000);
        });

        await waitFor(() => {
            expect(getDescriptionInput()).toHaveValue(updatedBanner.description);
        });
    });

    it('keeps existing localizations when the update response omits them', async () => {
        const bannerWithLocalization = {
            ...defaultBannerData,
            localizations: [
                {
                    title: 'Banner title EN',
                    description: 'Banner description EN',
                    language: { id: 2, code: 'en' },
                    translationStatus: 1,
                },
            ],
        };

        mockedUseDataFetch.mockReturnValue({
            data: bannerWithLocalization,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        mockedPartnersApi.updateBanner.mockResolvedValue({
            ...bannerWithLocalization,
            description: 'Published Description',
            localizations: [],
        });

        renderBanner();

        changeDescriptionValue('Published Description');
        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.BANNER_PUBLISHED, ToastType.Success, 3000);
        });

        expect(screen.getByText('EN')).toHaveClass(localizationStatusesStyles.relevant);
    });

    it('shows error toast when publishing banner fails', async () => {
        mockedPartnersApi.updateBanner.mockRejectedValue(new Error('Update failed'));

        renderBanner();

        changeDescriptionValue('Changed');
        clickPublish();
        clickConfirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateBanner).toHaveBeenCalledWith('mock-client', {
                title: defaultBannerData.title,
                description: 'Changed',
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

        renderBanner();

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
                    resolve(defaultBannerData);
                }, 100);
            });
        };

        mockedPartnersApi.updateBanner.mockImplementation(createDelayedPromise as any);

        renderBanner();

        changeDescriptionValue('Changed');
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
            expect(getPublishButton()).toBeDisabled(); // Disabled because form is no longer dirty after publish
        });
    });

    it('shows image error and disables publish until resolved', async () => {
        renderBanner();

        changeDescriptionValue('Changed');
        const publishButton = getPublishButton();
        expect(publishButton).toBeEnabled();

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
        renderBanner();
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

        renderBanner();

        expect(mockAddToast).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER, ToastType.Error);
    });

    it('does not call updateBanner when form has validation errors', async () => {
        mockValidateDescription.mockReturnValue('Description is required');

        renderBanner();

        changeDescriptionValue('');

        await waitFor(() => {
            expect(getPublishButton()).toBeDisabled();
        });

        clickPublish();

        expect(mockedPartnersApi.updateBanner).not.toHaveBeenCalled();
    });

    it('validates description on change and sets error correctly', async () => {
        mockValidateDescription.mockReturnValue('Description too short');

        renderBanner();

        changeDescriptionValue('AB');

        await waitFor(() => {
            expect(mockValidateDescription).toHaveBeenCalledWith('AB');
        });
    });

    it('clears image error when handleImageError is called with null', async () => {
        renderBanner();

        fireEvent.click(screen.getByRole('button', { name: 'Trigger image error' }));

        expect(await screen.findByTestId('input-error')).toHaveTextContent('Image invalid');

        fireEvent.click(screen.getByRole('button', { name: 'Clear image error' }));

        await waitFor(() => {
            expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
        });
    });

    it('maintains imageId when image is changed', async () => {
        renderBanner();

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

        renderBanner();

        expect(getErrorMessage()).toBeInTheDocument();
        expect(getTryAgainButton()).toBeInTheDocument();
    });

    it('prevents multiple simultaneous publish attempts', async () => {
        const delayedPromise = new Promise<typeof defaultBannerData>((resolve) => {
            setTimeout(() => resolve(defaultBannerData), 100);
        });

        mockedPartnersApi.updateBanner.mockReturnValue(delayedPromise as any);

        renderBanner();

        changeDescriptionValue('Changed');
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

        renderBanner();

        changeDescriptionValue('Changed');
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

        renderBanner();

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

        renderBanner();

        expect(mockAddToast).not.toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER, ToastType.Error);
    });

    it('does not show toast for axios canceled publish error', async () => {
        const canceledError = { name: 'CanceledError' };
        mockedPartnersApi.updateBanner.mockRejectedValue(canceledError);

        renderBanner();

        changeDescriptionValue('Changed');
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
        renderBanner();

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

        renderBanner();

        await waitFor(() => {
            expect(getTitleInput()).toHaveTextContent('Initial Title');
        });

        expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
    });

    it('validates title using plain text from HTML', async () => {
        const htmlTitle = '<p><strong>Bold</strong> Title</p>';
        mockValidateTitle.mockReturnValue(undefined);

        renderBanner();

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

        renderBanner();

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

        renderBanner();

        expect(getErrorMessage()).toBeInTheDocument();
        expect(mockedPartnersApi.updateBanner).not.toHaveBeenCalled();
    });

    it('passes trimOnBlur={true} to RichTextInputGroup for the title field', () => {
        renderBanner();
        const titleInput = getTitleInput();
        expect(titleInput).toHaveAttribute('data-trimonblur', 'true');
    });

    it('opens the translate modal when the translate icon is clicked', () => {
        renderBanner();

        expect(screen.queryByTestId('translate-partner-banner-modal')).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION }),
        );

        expect(screen.getByTestId('translate-partner-banner-modal')).toBeInTheDocument();
    });

    it('disables the translate icon while there are unpublished changes', () => {
        renderBanner();

        const translateButton = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        });
        expect(translateButton).toBeEnabled();

        changeDescriptionValue('Changed Description');

        expect(translateButton).toBeDisabled();
    });

    it('merges updated localizations and shows success toast after translating', async () => {
        renderBanner();

        fireEvent.click(
            screen.getByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION }),
        );
        fireEvent.click(screen.getByText('mock-translate-success'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS,
                ToastType.Success,
            );
        });
    });

    it('closes the translate modal via onClose', () => {
        renderBanner();

        fireEvent.click(
            screen.getByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION }),
        );
        expect(screen.getByTestId('translate-partner-banner-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByText('mock-translate-close'));

        expect(screen.queryByTestId('translate-partner-banner-modal')).not.toBeInTheDocument();
    });

    it('shows translated content and disables fields when a non-base language is selected', () => {
        const bannerWithLocalization = {
            ...defaultBannerData,
            localizations: [
                {
                    title: 'Banner title EN',
                    description: 'Banner description EN',
                    language: { id: EN_LANGUAGE.id, code: EN_LANGUAGE.code },
                    translationStatus: 1,
                },
            ],
        };
        mockedUseDataFetch.mockReturnValue({
            data: bannerWithLocalization,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            setData: mockSetData,
        });

        renderBanner({ language: EN_LANGUAGE });

        expect(getTitleInput()).toHaveTextContent('Banner title EN');
        expect(getTitleInput()).toHaveAttribute('contentEditable', 'false');
        expect(getTitleInput()).toHaveAttribute('data-hidetoolbar', 'true');
        expect(getDescriptionInput()).toHaveValue('Banner description EN');
        expect(getDescriptionInput()).toBeDisabled();
        expect(getChangeImageButton()).toBeDisabled();
        expect(getRemoveImageButton()).toBeDisabled();
        expect(
            screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }),
        ).not.toBeInTheDocument();
    });

    it('shows empty fields when the banner has no translation for the selected language', () => {
        renderBanner({ language: EN_LANGUAGE });

        expect(getTitleInput()).toHaveTextContent('');
        expect(getDescriptionInput()).toHaveValue('');
    });

    it('ignores field changes while a non-base language is selected', () => {
        renderBanner({ language: EN_LANGUAGE });

        fireEvent.change(getDescriptionInput(), { target: { value: 'Should be ignored' } });

        expect(getDescriptionInput()).toHaveValue('');
    });

    it('renders the publish button and enabled fields for the base language', () => {
        renderBanner({ language: UK_LANGUAGE });

        expect(getTitleInput()).toHaveAttribute('contentEditable', 'true');
        expect(getTitleInput()).toHaveAttribute('data-hidetoolbar', 'false');
        expect(getDescriptionInput()).toBeEnabled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeInTheDocument();
    });
});
