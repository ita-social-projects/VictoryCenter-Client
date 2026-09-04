import React, { createRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MediaSettings, MediaSettingsRef } from './MediaSettings';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { ReportsApi } from '@/services/api/admin/reports/reports-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { ToastType } from '@/types/admin/toast';
import { ReportsMediaBlockProps } from '../block-component/ReportsMediaBlock';
import { fetchDefaultImageAsImageValues } from '@/utils/functions/fetch-default-image/fetch-default-image';
import { formatCollectedAmount } from '@/utils/functions/formatters/report-amount-formatters';

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => <div data-testid="inline-loader">Loader size {size}</div>,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, className, disabled }: any) => (
        <button onClick={onClick} className={className} disabled={disabled}>
            {children}
        </button>
    ),
}));

let collectedFundsBlockProps: ReportsMediaBlockProps | null = null;
let changedLivesBlockProps: ReportsMediaBlockProps | null = null;

jest.mock('../block-component/ReportsMediaBlock', () => ({
    ReportsMediaBlock: (props: any) => {
        if (props.windowTitle === 'Вікно 1: Зібрано коштів') {
            collectedFundsBlockProps = props;
        } else {
            changedLivesBlockProps = props;
        }

        return (
            <div data-testid={`media-block-${props.windowTitle}`}>
                <span data-testid={`title-${props.windowTitle}`}>{props.values.title}</span>
                <span data-testid={`amount-${props.windowTitle}`}>{props.values.totalAmount}</span>
            </div>
        );
    },
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch');
jest.mock('@/services/api/admin/reports/reports-api');
jest.mock('@/services/api/public/reports/reports-api');
jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('@/utils/functions/fetch-default-image/fetch-default-image');
jest.mock('@/validation/admin/reports-schema/reports-media-settings/reports-media-settings-schema', () => ({
    REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateTitleEn: jest.fn(),
    },
    REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateTitleEn: jest.fn(),
        validateTotalAmount: jest.fn(),
    },
}));

jest.mock('./MediaSettings.module.scss', () => ({
    blocks: 'blocks',
    loader: 'loader',
    error: 'error',
    'error-button': 'error-button',
}));

jest.mock('@/assets/images/collected.webp', () => 'collected.webp');
jest.mock('@/assets/images/man-facing-horse-forehead.webp', () => 'man-facing-horse-forehead.webp');

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedReportsApi = ReportsApi as jest.Mocked<typeof ReportsApi>;
const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedFetchDefaultImage = fetchDefaultImageAsImageValues as jest.Mock;

const MOCK_PUBLIC_COLLECTED_TOTAL_UAH = 668999.78;

describe('MediaSettings', () => {
    const mockRefetch = jest.fn();
    const mockSetData = jest.fn();
    const mockAddToast = jest.fn();
    const mockOnDirtyChange = jest.fn();

    const defaultMediaSettingsData = {
        collectedFunds: {
            title: 'Зібрано коштів',
            titleEn: 'Зібрано коштів УК',
            image: { id: 1, url: 'collected-image.jpg', mimeType: 'image/jpeg' },
            imageId: 1,
        },
        changedLives: {
            title: 'Змінено життів',
            titleEn: 'Змінено життів УК',
            changedLives: 56,
            image: { id: 2, url: 'changed-lives-image.jpg', mimeType: 'image/jpeg' },
            imageId: 2,
        },
    };

    const defaultProps = {
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

    const mockDataFetch = (
        mediaOverrides: Record<string, unknown> = {},
        collectedTotalOverrides: Record<string, unknown> = {},
    ) => {
        mockedUseDataFetch.mockImplementation((params: any) => {
            const isCollectedTotalFetch = typeof params?.initialData === 'number';
            const base = { isLoading: false, error: null, refetch: mockRefetch, setData: mockSetData };

            return isCollectedTotalFetch
                ? { ...base, data: MOCK_PUBLIC_COLLECTED_TOTAL_UAH, ...collectedTotalOverrides }
                : { ...base, data: defaultMediaSettingsData, ...mediaOverrides };
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        collectedFundsBlockProps = null;
        changedLivesBlockProps = null;

        mockedUseAdminClient.mockReturnValue('mock-client');
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
        mockDataFetch();
        mockedFetchDefaultImage.mockResolvedValue({
            base64: 'data:image/jpeg;base64,defaultImage',
            mimeType: 'image/jpeg',
        });
    });

    describe('Loading and Edge states', () => {
        it('should render loader when data is loading', () => {
            mockDataFetch({ data: null, isLoading: true });

            renderComponent();

            expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        });

        it('should handle null data gracefully', () => {
            mockDataFetch({ data: null });

            renderComponent();
            expect(screen.queryByTestId('inline-loader')).not.toBeInTheDocument();
        });
    });

    describe('Error state', () => {
        it('should render error message and retry button when fetch fails', () => {
            mockDataFetch({ data: null, error: new Error('Failed to load') });

            renderComponent();

            expect(screen.getByText(REPORTS_TEXT.MESSAGE.FAIL_TO_FETCH_REPORTS)).toBeInTheDocument();
        });
    });

    describe('Success state', () => {
        it('should render both media blocks with fetched data', () => {
            renderComponent();

            expect(collectedFundsBlockProps).not.toBeNull();
            expect(collectedFundsBlockProps!.values.title).toBe('Зібрано коштів');
            expect(collectedFundsBlockProps!.values.totalAmount).toBe(
                formatCollectedAmount(MOCK_PUBLIC_COLLECTED_TOTAL_UAH),
            );

            expect(changedLivesBlockProps).not.toBeNull();
            expect(changedLivesBlockProps!.values.title).toBe('Змінено життів');
            expect(changedLivesBlockProps!.values.totalAmount).toBe(56);
        });

        it('should display the collected funds total exactly as the public reports page does', () => {
            renderComponent();

            expect(collectedFundsBlockProps!.isValueEditable).toBe(false);
            expect(collectedFundsBlockProps!.values.totalAmount).toBe(formatCollectedAmount(668999.78));
        });

        it('should show 0 for collected funds when nothing is published yet', () => {
            mockDataFetch({}, { data: 0 });

            renderComponent();

            expect(collectedFundsBlockProps!.values.totalAmount).toBe(formatCollectedAmount(0));
        });
    });

    describe('Change handlers & Dirty state', () => {
        it('should call onDirtyChange(true) when values change via callbacks', () => {
            renderComponent();

            act(() => {
                collectedFundsBlockProps!.onTitleChange('New Title');
                collectedFundsBlockProps!.onTitleBlur('New Title');
                collectedFundsBlockProps!.onTitleEnChange('New EN Title');
                collectedFundsBlockProps!.onTitleEnBlur('New EN Title');
                collectedFundsBlockProps!.onTotalAmountChange('100');
                collectedFundsBlockProps!.onImageChange({ base64: 'base64str', mimeType: 'image/jpeg' });
                collectedFundsBlockProps!.onImageError('Error CF');

                changedLivesBlockProps!.onTitleChange('New CL Title');
                changedLivesBlockProps!.onTitleBlur('New CL Title');
                changedLivesBlockProps!.onTitleEnChange('New CL EN');
                changedLivesBlockProps!.onTitleEnBlur('New CL EN');
                changedLivesBlockProps!.onTotalAmountChange('99');
                changedLivesBlockProps!.onImageChange(null);
                changedLivesBlockProps!.onImageError(null);
            });

            expect(mockOnDirtyChange).toHaveBeenCalledWith(true);
        });

        it('should call onDirtyChange(false) when value reverts to original', () => {
            renderComponent();

            act(() => {
                collectedFundsBlockProps!.onTitleChange('New Title');
            });
            expect(mockOnDirtyChange).toHaveBeenCalledWith(true);

            act(() => {
                collectedFundsBlockProps!.onTitleChange('Зібрано коштів');
            });
            // JSON.stringify equality in useFormManager will mark it clean
            expect(mockOnDirtyChange).toHaveBeenCalledWith(false);
        });
    });

    describe('Submit via ref (publish)', () => {
        it('should call ReportsApi.updateMediaSettings on submit', async () => {
            mockedReportsApi.updateMediaSettings.mockResolvedValue(defaultMediaSettingsData as any);

            const { ref } = renderComponent();

            let result: boolean | undefined;
            await act(async () => {
                result = await ref.current?.submit();
            });

            expect(mockedReportsApi.updateMediaSettings).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);
        });

        it('should fetch default image if no image or imageId is provided', async () => {
            mockedReportsApi.updateMediaSettings.mockResolvedValue(defaultMediaSettingsData as any);
            mockDataFetch({
                data: {
                    collectedFunds: { title: '1', titleEn: '2', image: null, imageId: null },
                    changedLives: { title: '3', titleEn: '4', changedLives: 5, image: null, imageId: null },
                },
            });

            const { ref } = renderComponent();

            await act(async () => {
                await ref.current?.submit();
            });

            expect(mockedFetchDefaultImage).toHaveBeenCalledTimes(2);
        });

        it('should return false without hitting API if validation fails', async () => {
            jest.spyOn(
                require('@/validation/admin/reports-schema/reports-media-settings/reports-media-settings-schema')
                    .REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS,
                'validateTitle',
            ).mockReturnValue('Error');

            const { ref } = renderComponent();

            let result: boolean | undefined;
            await act(async () => {
                result = await ref.current?.submit();
            });

            expect(result).toBe(false);
            expect(mockedReportsApi.updateMediaSettings).not.toHaveBeenCalled();
        });

        it('should handle cancellation errors quietly', async () => {
            const cancelError = new Error('Canceled');
            cancelError.name = 'CanceledError';
            mockedReportsApi.updateMediaSettings.mockRejectedValue(cancelError);

            const { ref } = renderComponent();

            let result: boolean | undefined;
            await act(async () => {
                result = await ref.current?.submit();
            });

            expect(result).toBe(false);
            expect(mockAddToast).not.toHaveBeenCalled();
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
    });
});
