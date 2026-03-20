import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MediaSettings, MediaSettingsRef } from './MediaSettings';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { ReportsApi } from '@/services/api/admin/reports/reports-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ToastType } from '@/types/admin/toast';
import { ReportsMediaBlockProps } from '../block-component/ReportsMediaBlock';
import { fetchDefaultImageAsImageValues } from '@/utils/functions/fetch-default-image/fetch-default-image';

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => <div data-testid="inline-loader">Loader size {size}</div>,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, className }: any) => (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    ),
}));

let collectedFundsBlockProps: ReportsMediaBlockProps | null = null;
let changedLivesBlockProps: ReportsMediaBlockProps | null = null;

jest.mock('../block-component/ReportsMediaBlock', () => ({
    ReportsMediaBlock: (props: ReportsMediaBlockProps) => {
        if (props.windowTitle === 'Вікно 1: Зібрано коштів') {
            collectedFundsBlockProps = props;
        } else {
            changedLivesBlockProps = props;
        }

        return (
            <div data-testid={`media-block-${props.windowTitle}`}>
                <span data-testid={`title-${props.windowTitle}`}>{props.values.title}</span>
                <span data-testid={`amount-${props.windowTitle}`}>{props.values.totalAmount}</span>
                <span data-testid={`value-editable-${props.windowTitle}`}>
                    {props.isValueEditable ? 'editable' : 'readonly'}
                </span>
            </div>
        );
    },
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch');
jest.mock('@/services/api/admin/reports/reports-api');
jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('@/utils/functions/fetch-default-image/fetch-default-image');
jest.mock('@/validation/admin/reports-schema/reports-media-settings/reports-media-settings-schema', () => ({
    REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
    },
    REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateChangedLives: jest.fn(),
    },
}));

jest.mock('./MediaSettings.module.scss', () => ({
    blocks: 'blocks',
    loader: 'loader',
    error: 'error',
    'error-button': 'error-button',
}));

jest.mock('@/assets/images/public/reports-page/collected.jpg', () => 'collected.jpg');
jest.mock('@/assets/images/public/reports-page/lives-changed.jpg', () => 'lives-changed.jpg');

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedReportsApi = ReportsApi as jest.Mocked<typeof ReportsApi>;
const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedFetchDefaultImage = fetchDefaultImageAsImageValues as jest.Mock;

describe('MediaSettings', () => {
    const mockRefetch = jest.fn();
    const mockSetData = jest.fn();
    const mockAddToast = jest.fn();
    const mockOnDirtyChange = jest.fn();

    const defaultMediaSettingsData = {
        collectedFunds: {
            title: 'Зібрано коштів',
            collectedFunds: 250000,
            image: { id: 1, url: 'collected-image.jpg', mimeType: 'image/jpeg' },
            imageId: 1,
        },
        changedLives: {
            title: 'Змінено життів',
            changedLives: 56,
            image: { id: 2, url: 'changed-lives-image.jpg', mimeType: 'image/jpeg' },
            imageId: 2,
        },
    };

    const defaultProps = {
        isEditing: false,
        resetCounter: 0,
        onDirtyChange: mockOnDirtyChange,
        onCancel: jest.fn(),
        onPublish: jest.fn(),
        isPublishDisabled: false,
        isCancelDisabled: false,
        isActive: true,
    };

    const renderComponent = (overrideProps: Partial<typeof defaultProps> = {}) => {
        const ref = createRef<MediaSettingsRef>();
        const view = render(<MediaSettings ref={ref} {...defaultProps} {...overrideProps} />);
        return { ...view, ref };
    };

    beforeEach(() => {
        jest.clearAllMocks();
        collectedFundsBlockProps = null;
        changedLivesBlockProps = null;

        mockedUseAdminClient.mockReturnValue('mock-client');
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
        mockedUseDataFetch.mockReturnValue({
            data: defaultMediaSettingsData,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
            setData: mockSetData,
        });
        mockedFetchDefaultImage.mockResolvedValue({
            base64: 'data:image/jpeg;base64,defaultImage',
            mimeType: 'image/jpeg',
        });
    });

    describe('Loading state', () => {
        it('should render loader when data is loading', () => {
            mockedUseDataFetch.mockReturnValueOnce({
                data: null,
                isLoading: true,
                error: null,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        });

        it('should not render media blocks while loading', () => {
            mockedUseDataFetch.mockReturnValueOnce({
                data: null,
                isLoading: true,
                error: null,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            expect(
                screen.queryByTestId(`media-block-${REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS_WINDOW}`),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId(`media-block-${REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES_WINDOW}`),
            ).not.toBeInTheDocument();
        });
    });

    describe('Error state', () => {
        it('should render error message and retry button when fetch fails', () => {
            mockedUseDataFetch.mockReturnValueOnce({
                data: null,
                isLoading: false,
                error: new Error('Failed to load'),
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            expect(screen.getByText(REPORTS_TEXT.MESSAGE.FAIL_TO_FETCH_REPORTS)).toBeInTheDocument();
            expect(screen.getByText(REPORTS_TEXT.BUTTON.TRY_AGAIN)).toBeInTheDocument();
        });

        it('should call refetch when retry button is clicked', () => {
            mockedUseDataFetch.mockReturnValueOnce({
                data: null,
                isLoading: false,
                error: new Error('Failed to load'),
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            fireEvent.click(screen.getByText(REPORTS_TEXT.BUTTON.TRY_AGAIN));
            expect(mockRefetch).toHaveBeenCalledTimes(1);
        });

        it('should not render media blocks when fetch fails', () => {
            mockedUseDataFetch.mockReturnValueOnce({
                data: null,
                isLoading: false,
                error: new Error('Failed'),
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            expect(
                screen.queryByTestId(`media-block-${REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS_WINDOW}`),
            ).not.toBeInTheDocument();
        });
    });

    describe('Success state', () => {
        it('should render both media blocks with fetched data', () => {
            renderComponent();

            expect(
                screen.getByTestId(`media-block-${REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS_WINDOW}`),
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`media-block-${REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES_WINDOW}`),
            ).toBeInTheDocument();
        });

        it('should pass correct values to collected funds block', () => {
            renderComponent();

            expect(collectedFundsBlockProps).not.toBeNull();
            expect(collectedFundsBlockProps!.values.title).toBe('Зібрано коштів');
            expect(collectedFundsBlockProps!.values.totalAmount).toBe(250000);
            expect(collectedFundsBlockProps!.windowTitle).toBe(REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS_WINDOW);
            expect(collectedFundsBlockProps!.descriptionTitle).toBe(REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS);
            expect(collectedFundsBlockProps!.isValueEditable).toBe(false);
        });

        it('should pass correct values to changed lives block', () => {
            renderComponent();

            expect(changedLivesBlockProps).not.toBeNull();
            expect(changedLivesBlockProps!.values.title).toBe('Змінено життів');
            expect(changedLivesBlockProps!.values.totalAmount).toBe(56);
            expect(changedLivesBlockProps!.windowTitle).toBe(REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES_WINDOW);
            expect(changedLivesBlockProps!.descriptionTitle).toBe(REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES);
            expect(changedLivesBlockProps!.isValueEditable).toBe(true);
        });

        it('should pass correct image dimensions to collected funds block', () => {
            renderComponent();

            expect(collectedFundsBlockProps!.imageWidth).toBe(600);
            expect(collectedFundsBlockProps!.imageHeight).toBe(500);
        });

        it('should pass correct image dimensions to changed lives block', () => {
            renderComponent();

            expect(changedLivesBlockProps!.imageWidth).toBe(280);
            expect(changedLivesBlockProps!.imageHeight).toBe(890);
        });

        it('should pass window description to both blocks', () => {
            renderComponent();

            expect(collectedFundsBlockProps!.windowDescription).toBe(REPORTS_TEXT.FORM.LABEL.WINDOW_DESCRIPTION);
            expect(changedLivesBlockProps!.windowDescription).toBe(REPORTS_TEXT.FORM.LABEL.WINDOW_DESCRIPTION);
        });
    });

    describe('Change handlers', () => {
        it('should call onDirtyChange(true) when collected funds values change', () => {
            renderComponent();

            const newValues = { title: 'New Title', totalAmount: 300000, image: null, imageId: null };
            const newErrors = {};

            act(() => {
                collectedFundsBlockProps!.onValuesChange(newValues, newErrors);
            });

            expect(mockOnDirtyChange).toHaveBeenCalledWith(true);
        });

        it('should call onDirtyChange(true) when changed lives values change', () => {
            renderComponent();

            const newValues = { title: 'New Title', totalAmount: 100, image: null, imageId: null };
            const newErrors = {};

            act(() => {
                changedLivesBlockProps!.onValuesChange(newValues, newErrors);
            });

            expect(mockOnDirtyChange).toHaveBeenCalledWith(true);
        });

        it('should update collected funds block values after change', () => {
            renderComponent();

            const newValues = { title: 'Updated Title', totalAmount: 500000, image: null, imageId: null };
            const newErrors = { title: 'Some error' };

            act(() => {
                collectedFundsBlockProps!.onValuesChange(newValues, newErrors);
            });

            expect(collectedFundsBlockProps!.values).toEqual(newValues);
            expect(collectedFundsBlockProps!.errors).toEqual(newErrors);
        });

        it('should update changed lives block values after change', () => {
            renderComponent();

            const newValues = { title: 'Updated Lives', totalAmount: 99, image: null, imageId: null };
            const newErrors = { totalAmount: 'Invalid' };

            act(() => {
                changedLivesBlockProps!.onValuesChange(newValues, newErrors);
            });

            expect(changedLivesBlockProps!.values).toEqual(newValues);
            expect(changedLivesBlockProps!.errors).toEqual(newErrors);
        });
    });

    describe('Submit via ref (publish)', () => {
        it('should call ReportsApi.updateMediaSettings on submit', async () => {
            const updatedData = { ...defaultMediaSettingsData };
            mockedReportsApi.updateMediaSettings.mockResolvedValue(updatedData);

            const { ref } = renderComponent();

            let result: boolean | undefined;
            await act(async () => {
                result = await ref.current?.submit();
            });

            expect(mockedReportsApi.updateMediaSettings).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);
        });

        it('should show success toast after successful publish', async () => {
            mockedReportsApi.updateMediaSettings.mockResolvedValue(defaultMediaSettingsData);

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED,
                ToastType.Success,
            );
        });

        it('should show error toast when publish fails', async () => {
            mockedReportsApi.updateMediaSettings.mockRejectedValue(new Error('Update failed'));

            const { ref } = renderComponent();

            let result: boolean | undefined;
            await act(async () => {
                result = await ref.current?.submit();
            });

            expect(result).toBe(false);
            expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
        });

        it('should return false without showing error toast when error is CanceledError', async () => {
            const canceledError = new Error('Canceled');
            canceledError.name = 'CanceledError';
            mockedReportsApi.updateMediaSettings.mockRejectedValue(canceledError);

            const { ref } = renderComponent();

            let result: boolean | undefined;
            await act(async () => {
                result = await ref.current?.submit();
            });

            expect(result).toBe(false);
            expect(mockAddToast).not.toHaveBeenCalled();
        });

        it('should return false without showing error toast when error is AbortError', async () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            mockedReportsApi.updateMediaSettings.mockRejectedValue(abortError);

            const { ref } = renderComponent();

            let result: boolean | undefined;
            await act(async () => {
                result = await ref.current?.submit();
            });

            expect(result).toBe(false);
            expect(mockAddToast).not.toHaveBeenCalled();
        });

        it('should pass correct data to updateMediaSettings API', async () => {
            mockedReportsApi.updateMediaSettings.mockResolvedValue(defaultMediaSettingsData);

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(mockedReportsApi.updateMediaSettings).toHaveBeenCalledWith(
                'mock-client',
                expect.objectContaining({
                    collectedFunds: expect.objectContaining({
                        title: 'Зібрано коштів',
                        collectedFunds: 250000,
                    }),
                    changedLives: expect.objectContaining({
                        title: 'Змінено життів',
                        changedLives: 56,
                    }),
                }),
            );
        });

        it('should fetch default image for collected funds when no image and no imageId', async () => {
            const noImageData = {
                ...defaultMediaSettingsData,
                collectedFunds: {
                    ...defaultMediaSettingsData.collectedFunds,
                    image: null,
                    imageId: null,
                },
            };
            mockedUseDataFetch.mockReturnValue({
                data: noImageData,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            mockedReportsApi.updateMediaSettings.mockResolvedValue(noImageData);

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(mockedFetchDefaultImage).toHaveBeenCalledWith('collected.jpg', 600, 500);
        });

        it('should fetch default image for changed lives when no image and no imageId', async () => {
            const noImageData = {
                ...defaultMediaSettingsData,
                changedLives: {
                    ...defaultMediaSettingsData.changedLives,
                    image: null,
                    imageId: null,
                },
            };
            mockedUseDataFetch.mockReturnValue({
                data: noImageData,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            mockedReportsApi.updateMediaSettings.mockResolvedValue(noImageData);

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(mockedFetchDefaultImage).toHaveBeenCalledWith('lives-changed.jpg', 280, 890);
        });

        it('should not fetch default image when image exists', async () => {
            mockedReportsApi.updateMediaSettings.mockResolvedValue(defaultMediaSettingsData);

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(mockedFetchDefaultImage).not.toHaveBeenCalled();
        });

        it('should not fetch default image when imageId exists even if image is null', async () => {
            const dataWithImageId = {
                ...defaultMediaSettingsData,
                collectedFunds: {
                    ...defaultMediaSettingsData.collectedFunds,
                    image: null,
                    imageId: 5,
                },
            };
            mockedUseDataFetch.mockReturnValue({
                data: dataWithImageId,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            mockedReportsApi.updateMediaSettings.mockResolvedValue(dataWithImageId);

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(mockedFetchDefaultImage).not.toHaveBeenCalledWith(
                'collected.jpg',
                expect.any(Number),
                expect.any(Number),
            );
        });

        it('should update state with response data after successful publish', async () => {
            const updatedData = {
                collectedFunds: {
                    title: 'Updated CF Title',
                    collectedFunds: 500000,
                    image: { id: 3, url: 'new-cf.jpg', mimeType: 'image/jpeg' },
                    imageId: 3,
                },
                changedLives: {
                    title: 'Updated CL Title',
                    changedLives: 100,
                    image: { id: 4, url: 'new-cl.jpg', mimeType: 'image/jpeg' },
                    imageId: 4,
                },
            };
            mockedReportsApi.updateMediaSettings.mockResolvedValue(updatedData);

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(collectedFundsBlockProps!.values.title).toBe('Updated CF Title');
            expect(collectedFundsBlockProps!.values.totalAmount).toBe(500000);
            expect(changedLivesBlockProps!.values.title).toBe('Updated CL Title');
            expect(changedLivesBlockProps!.values.totalAmount).toBe(100);
        });
    });

    describe('Reset on resetCounter change', () => {
        it('should sync data when mediaSettingsData changes', () => {
            renderComponent();

            expect(collectedFundsBlockProps!.values.title).toBe('Зібрано коштів');
            expect(changedLivesBlockProps!.values.title).toBe('Змінено життів');
        });
    });

    describe('useDataFetch configuration', () => {
        it('should call useDataFetch with correct parameters', () => {
            renderComponent();

            expect(mockedUseDataFetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    initialData: expect.objectContaining({
                        collectedFunds: expect.objectContaining({
                            title: '',
                            collectedFunds: 0,
                        }),
                        changedLives: expect.objectContaining({
                            title: '',
                            changedLives: 0,
                        }),
                    }),
                    autoFetchDisabled: false,
                }),
            );
        });
    });

    describe('Error toast on fetch error', () => {
        it('should show error toast when fetch error occurs (not canceled)', () => {
            const fetchError = new Error('Network error');

            mockedUseDataFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: fetchError,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.FAIL_TO_FETCH_REPORTS, ToastType.Error);
        });

        it('should not show error toast when fetch error is CanceledError', () => {
            const cancelError = new Error('Canceled');
            cancelError.name = 'CanceledError';

            mockedUseDataFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: cancelError,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            expect(mockAddToast).not.toHaveBeenCalled();
        });

        it('should not show error toast when fetch error is AbortError', () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';

            mockedUseDataFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: abortError,
                refetch: mockRefetch,
                setData: mockSetData,
            });

            renderComponent();

            expect(mockAddToast).not.toHaveBeenCalled();
        });
    });
});
