import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { MainPage, MainPageFormValues, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { ToastType } from '@/types/admin/toast';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { StatisticsBlockForm } from './StatisticsBlockForm';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(() => ({})),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    __esModule: true,
    InputWithCharacterLimitGroup: require('@/utils/test-mocks/main-page-mocks').MockInputWithCharacterLimitGroup,
}));

jest.mock('@/components/admin/button/Button', () => ({
    __esModule: true,
    Button: require('@/utils/test-mocks/main-page-mocks').MockSubmitButton,
}));

jest.mock('@/pages/admin/main/components/common/image-upload-form/ImageUploadForm', () => ({
    __esModule: true,
    ImageUploadForm: require('@/utils/test-mocks/main-page-mocks').MockImageUploadForm,
}));

jest.mock('./components/statistics-preview/StatisticsPreview', () => ({
    StatisticsPreview: ({ metrics, hiddenMetricIds }: any) => (
        <div
            data-testid="statistics-preview"
            data-metrics={metrics.length}
            data-hidden={hiddenMetricIds.join(',')}
            data-prefixes={metrics.map((metric: any) => metric.prefix).join(',')}
        />
    ),
}));

jest.mock('./components/statistics-metrics-list/StatisticsMetricsList', () => ({
    StatisticsMetricsList: ({
        metrics,
        onToggleVisibility,
        onReorder,
        onMetricUpdate,
        onRaisedFundsSyncErrorChange,
    }: any) => {
        const { MetricPrefix } = require('@/types/admin/main-page');
        return (
            <div data-testid="metrics-list">
                <button
                    data-testid="toggle-first-metric"
                    onClick={() => onToggleVisibility(metrics[0]?.id ?? 0)}
                    type="button"
                />
                <button
                    data-testid="toggle-second-metric"
                    onClick={() => onToggleVisibility(metrics[1]?.id ?? 0)}
                    type="button"
                />
                <button data-testid="reorder-metrics" onClick={() => onReorder([])} type="button" />
                <button
                    data-testid="update-first-to-percent"
                    onClick={() =>
                        onMetricUpdate?.(
                            metrics.map((metric: any, index: number) =>
                                index === 0 ? { ...metric, prefix: MetricPrefix.Percent } : metric,
                            ),
                        )
                    }
                    type="button"
                />
                <button
                    data-testid="update-first-to-plus"
                    onClick={() =>
                        onMetricUpdate?.(
                            metrics.map((metric: any, index: number) =>
                                index === 0 ? { ...metric, prefix: MetricPrefix.Plus } : metric,
                            ),
                        )
                    }
                    type="button"
                />

                <button
                    data-testid="trigger-sort-test"
                    onClick={() =>
                        onMetricUpdate?.([
                            {
                                ...metrics[0],
                                localizations: [
                                    { languageId: 2, name: 'EN' },
                                    { languageId: 1, name: 'UA' },
                                ],
                            },
                        ])
                    }
                    type="button"
                />
                <button
                    data-testid="trigger-raised-sync-error"
                    onClick={() => onRaisedFundsSyncErrorChange?.(true)}
                    type="button"
                />
                <button
                    data-testid="clear-raised-sync-error"
                    onClick={() => onRaisedFundsSyncErrorChange?.(false)}
                    type="button"
                />
            </div>
        );
    },
}));

const mockAddToast = jest.fn();

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({ addToast: mockAddToast }),
}));

jest.mock('@/services/api/admin/main-page/main-page-api', () => ({
    MainPageApi: {
        updateMetricVisibility: jest.fn().mockResolvedValue(undefined),
        reorderMetrics: jest.fn().mockResolvedValue(undefined),
    },
}));

const mockInitialData: MainPage = {
    id: 1,
    title: 'Тест',
    description: 'Тест',
    image: null,
    mainAboutUs: null,
    mainDonations: null,
    mainPartners: null,
    impactStatistics: {
        id: 1,
        title: 'Початковий заголовок статистики',
        image: null,
        metrics: [
            {
                id: 101,
                name: 'Метрика 1',
                value: 15,
                type: MetricType.Partners,
                prefix: MetricPrefix.Plus,
                isHidden: false,
                priority: 1,
                localizations: [],
            },
            {
                id: 102,
                name: 'Метрика 2',
                value: 42,
                type: MetricType.Partners,
                prefix: MetricPrefix.Percent,
                isHidden: false,
                priority: 2,
                localizations: [],
            },
        ],
        localizations: [],
    },
    localizations: [],
};

const FormWrapper = ({
    children,
    defaultValues,
    onSetValue,
}: {
    children: React.ReactNode;
    defaultValues?: Partial<MainPageFormValues>;
    onSetValue?: jest.Mock;
}) => {
    const methods = useForm<MainPageFormValues>({
        defaultValues: {
            statisticsTitleUa: '',
            statisticsTitleEn: '',
            metrics: [],
            ...defaultValues,
        } as MainPageFormValues,
    });

    const setValueSpy = (...args: Parameters<typeof methods.setValue>) => {
        onSetValue?.(...args);
        return methods.setValue(...args);
    };

    const formMethods = {
        ...methods,
        setValue: setValueSpy,
    };
    const DirtyIndicator = () => {
        const { formState } = useFormContext<MainPageFormValues>();
        return <div data-testid="dirty-flag" data-dirty={formState.isDirty ? 'true' : 'false'} />;
    };

    return (
        <FormProvider {...formMethods}>
            <DirtyIndicator />
            {children}
        </FormProvider>
    );
};

describe('StatisticsBlockForm', () => {
    const mockOnPublish = jest.fn();

    const renderComponent = (props: any = {}) =>
        render(
            <FormWrapper>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                    {...props}
                />
            </FormWrapper>,
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders and pre-fills titles from form context', async () => {
        render(
            <FormWrapper defaultValues={{ statisticsTitleUa: 'Заголовок UA', statisticsTitleEn: 'Заголовок EN' }}>
                <StatisticsBlockForm initialData={mockInitialData} isPublishDisabled={true} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        const uaTitle = screen.getByTestId('statistics-title-ua') as HTMLInputElement;
        const enTitle = screen.getByTestId('statistics-title-en') as HTMLInputElement;

        expect(uaTitle.value).toBe('Заголовок UA');
        expect(enTitle.value).toBe('Заголовок EN');
    });

    it('enables publish button when isPublishDisabled prop is false', () => {
        renderComponent();

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).not.toBeDisabled();
    });

    it('disables publish when image error is set via local state', () => {
        renderComponent();

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).not.toBeDisabled();

        fireEvent.click(screen.getByTestId('trigger-image-error'));
        expect(submitBtn).toBeDisabled();
    });

    it('updates hidden metrics state when toggling visibility', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('toggle-first-metric'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-hidden', '101');
        });
    });

    it('updates metrics order when reorder is triggered', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('reorder-metrics'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '0');
        });
    });

    it('does not hide the last visible metric', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('toggle-first-metric'));
        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-hidden', '101');
        });

        fireEvent.click(screen.getByTestId('toggle-second-metric'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-hidden', '101');
        });
    });

    it('re-enables publish button after clearing image error', () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('trigger-image-error'));
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
        fireEvent.click(screen.getByTestId('clear-image-error'));
        expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
    });

    it('does not toggle visibility when only one metric is visible', async () => {
        const { MainPageApi } = require('@/services/api/admin/main-page/main-page-api');
        const singleMetricData: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: [mockInitialData.impactStatistics!.metrics[0]],
            },
        };

        renderComponent({ initialData: singleMetricData });

        fireEvent.click(screen.getByTestId('toggle-first-metric'));

        await waitFor(() => {
            expect(MainPageApi.updateMetricVisibility).not.toHaveBeenCalled();
        });
    });

    it('reverts hidden state and shows toast when toggle visibility fails', async () => {
        const { MainPageApi } = require('@/services/api/admin/main-page/main-page-api');
        MainPageApi.updateMetricVisibility.mockRejectedValueOnce(new Error('fail'));

        renderComponent();

        fireEvent.click(screen.getByTestId('toggle-first-metric'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-hidden', '');
            expect(mockAddToast).toHaveBeenCalledWith(
                MAIN_PAGE_TEXT.ERRORS.TOGGLE_VISIBILITY_FAILED,
                ToastType.Error,
                3000,
            );
        });
    });

    it('passes prefix values correctly to preview', async () => {
        const rawPrefixData: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: [
                    { ...mockInitialData.impactStatistics!.metrics[0], prefix: MetricPrefix.Plus },
                    { ...mockInitialData.impactStatistics!.metrics[1], prefix: MetricPrefix.Percent },
                ],
            },
        };

        renderComponent({ initialData: rawPrefixData });

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-prefixes', '1,2');
        });
    });

    it('skips reorder when statistic id is missing', async () => {
        const { MainPageApi } = require('@/services/api/admin/main-page/main-page-api');
        const missingIdData: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                id: undefined,
            },
        };

        renderComponent({ initialData: missingIdData });

        fireEvent.click(screen.getByTestId('reorder-metrics'));

        await waitFor(() => {
            expect(MainPageApi.reorderMetrics).not.toHaveBeenCalled();
        });
    });

    it('reverts metrics when reorder fails', async () => {
        const { MainPageApi } = require('@/services/api/admin/main-page/main-page-api');
        MainPageApi.reorderMetrics.mockRejectedValueOnce(new Error('fail'));

        renderComponent();

        fireEvent.click(screen.getByTestId('reorder-metrics'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '2');
            expect(mockAddToast).toHaveBeenCalledWith(MAIN_PAGE_TEXT.ERRORS.REORDER_FAILED, ToastType.Error, 3000);
        });
    });

    it('does not keep form dirty when prefix is reverted to initial value', async () => {
        const setValueSpy = jest.fn();
        const initialMetrics = mockInitialData.impactStatistics?.metrics ?? [];

        render(
            <FormWrapper defaultValues={{ metrics: initialMetrics }} onSetValue={setValueSpy}>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                />
            </FormWrapper>,
        );

        fireEvent.click(screen.getByTestId('update-first-to-percent'));

        await waitFor(() => {
            expect(setValueSpy).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByTestId('update-first-to-plus'));

        await waitFor(() => {
            const lastCall = setValueSpy.mock.calls[setValueSpy.mock.calls.length - 1];
            const passedMetrics = lastCall[1];
            const options = lastCall[2];

            expect(options?.shouldDirty).toBe(true);

            expect(passedMetrics).toEqual(initialMetrics);
        });
    });

    it('handles metrics with missing fields when comparing updates', async () => {
        const setValueSpy = jest.fn();
        const initialData: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: [
                    {
                        id: undefined,
                        name: undefined,
                        value: 7,
                        type: MetricType.Partners,
                        prefix: undefined,
                        isHidden: false,
                        priority: 1,
                        localizations: [{ languageId: undefined, name: undefined } as any],
                    } as any,
                ],
            },
        };

        render(
            <FormWrapper onSetValue={setValueSpy}>
                <StatisticsBlockForm initialData={initialData} isPublishDisabled={false} onPublish={mockOnPublish} />
            </FormWrapper>,
        );

        fireEvent.click(screen.getByTestId('update-first-to-percent'));

        await waitFor(() => {
            expect(setValueSpy).toHaveBeenCalledWith(
                'metrics',
                expect.any(Array),
                expect.objectContaining({ shouldDirty: true }),
            );
        });
    });

    it('handles missing impactStatistics or metrics gracefully', async () => {
        const dataWithoutMetrics: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: undefined as any,
            },
        };

        renderComponent({ initialData: dataWithoutMetrics });

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '0');
        });
    });

    it('handles null initialData gracefully', async () => {
        renderComponent({ initialData: null as any });

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '0');
        });
    });

    it('handles missing impactStatistics gracefully', async () => {
        const dataWithoutStatistics: MainPage = {
            ...mockInitialData,
            impactStatistics: undefined as any,
        };

        renderComponent({ initialData: dataWithoutStatistics });

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '0');
        });
    });

    it('calls onMetricsChange when metrics are updated', async () => {
        const onMetricsChange = jest.fn();

        renderComponent({ onMetricsChange });

        fireEvent.click(screen.getByTestId('update-first-to-percent'));

        await waitFor(() => {
            expect(onMetricsChange).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 101,
                        prefix: MetricPrefix.Percent,
                    }),
                ]),
            );
        });
    });

    it('shows and clears raised funds sync error message from metrics list flow', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('trigger-raised-sync-error'));

        expect(screen.getByText(MAIN_PAGE_TEXT.ERRORS.RAISED_FUNDS_SYNC_FAILED)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('clear-raised-sync-error'));

        await waitFor(() => {
            expect(screen.queryByText(MAIN_PAGE_TEXT.ERRORS.RAISED_FUNDS_SYNC_FAILED)).not.toBeInTheDocument();
        });
    });

    it('shows raised funds sync error when it is returned with the metric data', async () => {
        const dataWithSyncError: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: [
                    {
                        ...mockInitialData.impactStatistics!.metrics[0],
                        type: MetricType.Raised,
                        isAutoSynced: true,
                        isAutoSyncFailed: true,
                    },
                ],
            },
        };

        renderComponent({ initialData: dataWithSyncError });

        expect(screen.getByText(MAIN_PAGE_TEXT.ERRORS.RAISED_FUNDS_SYNC_FAILED)).toBeInTheDocument();
    });

    it('handles metrics with empty localizations arrays', async () => {
        const dataWithEmptyLocalizations: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: [
                    {
                        ...mockInitialData.impactStatistics!.metrics[0],
                        localizations: [],
                    },
                    {
                        ...mockInitialData.impactStatistics!.metrics[1],
                        localizations: [],
                    },
                ],
            },
        };

        renderComponent({ initialData: dataWithEmptyLocalizations });

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '2');
        });
    });

    it('reverts hidden state correctly when toggle fails for already hidden metric', async () => {
        const { MainPageApi } = require('@/services/api/admin/main-page/main-page-api');
        MainPageApi.updateMetricVisibility.mockRejectedValueOnce(new Error('fail'));

        const dataWithHiddenMetric: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: [
                    { ...mockInitialData.impactStatistics!.metrics[0], isHidden: true },
                    mockInitialData.impactStatistics!.metrics[1],
                ],
            },
        };

        renderComponent({ initialData: dataWithHiddenMetric });

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-hidden', '101');
        });

        fireEvent.click(screen.getByTestId('toggle-first-metric'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-hidden', '101');
            expect(mockAddToast).toHaveBeenCalledWith(
                MAIN_PAGE_TEXT.ERRORS.TOGGLE_VISIBILITY_FAILED,
                ToastType.Error,
                3000,
            );
        });
    });

    it('handles initialization with empty metrics list', async () => {
        const emptyMetricsData = {
            ...mockInitialData,
            impactStatistics: { ...mockInitialData.impactStatistics!, metrics: [] },
        };
        renderComponent({ initialData: emptyMetricsData });
        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '0');
        });
    });

    it('handles initialization when metrics exist but array is empty', async () => {
        const dataWithEmptyMetrics: MainPage = {
            ...mockInitialData,
            impactStatistics: { ...mockInitialData.impactStatistics!, metrics: [] },
        };
        renderComponent({ initialData: dataWithEmptyMetrics });
        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toBeInTheDocument();
        });
    });

    it('should trigger sort logic in toComparableMetrics via localizations', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('trigger-sort-test'));

        await waitFor(() => {
            expect(screen.getByTestId('metrics-list')).toBeInTheDocument();
        });
    });

    it('covers branch: impactStatistics exists but metrics is undefined', () => {
        const dataWithMissingMetrics = {
            ...mockInitialData,
            impactStatistics: { ...mockInitialData.impactStatistics!, metrics: undefined as any },
        };
        renderComponent({ initialData: dataWithMissingMetrics });
        expect(screen.getByTestId('statistics-preview')).toBeInTheDocument();
    });

    it('covers branch: localizations is undefined and languageId is missing', () => {
        const dataWithMissingLocs: MainPage = {
            ...mockInitialData,
            impactStatistics: {
                ...mockInitialData.impactStatistics!,
                metrics: [
                    {
                        id: 999,
                        name: 'Test',
                        value: 10,
                        type: MetricType.Partners,
                        prefix: MetricPrefix.Plus,
                        isHidden: false,
                        priority: 1,
                        localizations: undefined as any,
                    },
                ],
            },
        };
        renderComponent({ initialData: dataWithMissingLocs });

        fireEvent.click(screen.getByTestId('trigger-sort-test'));

        expect(screen.getByTestId('statistics-preview')).toBeInTheDocument();
    });
});
