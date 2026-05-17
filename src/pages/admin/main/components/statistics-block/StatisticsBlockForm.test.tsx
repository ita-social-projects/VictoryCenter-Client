import { MainPage, MainPageFormValues, MetricPrefix, MetricType } from '@/types/admin/main-page';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { StatisticsBlockForm } from './StatisticsBlockForm';

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
        <div data-testid="statistics-preview" data-metrics={metrics.length} data-hidden={hiddenMetricIds.join(',')} />
    ),
}));

jest.mock('./components/statistics-metrics-list/StatisticsMetricsList', () => ({
    StatisticsMetricsList: ({ metrics, onToggleVisibility, onReorder }: any) => (
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
        </div>
    ),
}));

const mockInitialData: MainPage = {
    id: 1,
    title: 'Тест',
    description: 'Тест',
    image: null,
    mainAboutUs: null,
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
}: {
    children: React.ReactNode;
    defaultValues?: Partial<MainPageFormValues>;
}) => {
    const methods = useForm<MainPageFormValues>({
        defaultValues: {
            statisticsTitleUa: '',
            statisticsTitleEn: '',
            ...defaultValues,
        } as MainPageFormValues,
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('StatisticsBlockForm', () => {
    const mockOnPublish = jest.fn();

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
        render(
            <FormWrapper>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).not.toBeDisabled();
    });

    it('disables publish when image error is set via local state', () => {
        render(
            <FormWrapper>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                />
            </FormWrapper>,
        );

        const submitBtn = screen.getByTestId('submit-btn');
        expect(submitBtn).not.toBeDisabled();

        fireEvent.click(screen.getByTestId('trigger-image-error'));
        expect(submitBtn).toBeDisabled();
    });

    it('updates hidden metrics state when toggling visibility', async () => {
        render(
            <FormWrapper>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                />
            </FormWrapper>,
        );

        fireEvent.click(screen.getByTestId('toggle-first-metric'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-hidden', '101');
        });
    });

    it('updates metrics order when reorder is triggered', async () => {
        render(
            <FormWrapper>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                />
            </FormWrapper>,
        );

        fireEvent.click(screen.getByTestId('reorder-metrics'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '0');
        });
    });

    it('does not hide the last visible metric', async () => {
        render(
            <FormWrapper>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                />
            </FormWrapper>,
        );

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
        render(
            <FormWrapper>
                <StatisticsBlockForm
                    initialData={mockInitialData}
                    isPublishDisabled={false}
                    onPublish={mockOnPublish}
                />
            </FormWrapper>,
        );
        fireEvent.click(screen.getByTestId('trigger-image-error'));
        expect(screen.getByTestId('submit-btn')).toBeDisabled();
        fireEvent.click(screen.getByTestId('clear-image-error'));
        expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
    });
});
