import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StatisticsBlockForm } from './StatisticsBlockForm';
import { MOCK_MAIN_PAGE_DATA } from '@/utils/mock-data/admin/main-page/main-page';

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
            <button data-testid="reorder-metrics" onClick={() => onReorder([])} type="button" />
        </div>
    ),
}));

describe('StatisticsBlockForm', () => {
    it('renders and pre-fills titles from mock data', async () => {
        render(<StatisticsBlockForm />);

        const uaTitle = screen.getByTestId('statistics-title-ua') as HTMLInputElement;
        const enTitle = screen.getByTestId('statistics-title-en') as HTMLInputElement;

        await waitFor(() => {
            expect(uaTitle.value).toBe(MOCK_MAIN_PAGE_DATA.impactStatistics?.title);
            expect(enTitle.value).toBe(MOCK_MAIN_PAGE_DATA.impactStatistics?.title);
        });
    });

    it('enables publish when form is valid and dirty', async () => {
        render(<StatisticsBlockForm />);

        const uaTitle = screen.getByTestId('statistics-title-ua');
        fireEvent.change(uaTitle, { target: { value: 'Новий заголовок' } });

        await waitFor(() => {
            expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
        });
    });

    it('disables publish when image error is set', async () => {
        render(<StatisticsBlockForm />);

        const uaTitle = screen.getByTestId('statistics-title-ua');
        fireEvent.change(uaTitle, { target: { value: 'Новий заголовок' } });

        await waitFor(() => expect(screen.getByTestId('submit-btn')).not.toBeDisabled());

        fireEvent.click(screen.getByTestId('trigger-image-error'));
        await waitFor(() => expect(screen.getByTestId('submit-btn')).toBeDisabled());
    });

    it('updates hidden metrics state when toggling visibility', async () => {
        render(<StatisticsBlockForm />);

        const firstMetricId = MOCK_MAIN_PAGE_DATA.impactStatistics?.metrics?.[0]?.id ?? 0;

        fireEvent.click(screen.getByTestId('toggle-first-metric'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute(
                'data-hidden',
                firstMetricId ? String(firstMetricId) : '0',
            );
        });
    });

    it('updates metrics order when reorder is triggered', async () => {
        render(<StatisticsBlockForm />);

        fireEvent.click(screen.getByTestId('reorder-metrics'));

        await waitFor(() => {
            expect(screen.getByTestId('statistics-preview')).toHaveAttribute('data-metrics', '0');
        });
    });
});
