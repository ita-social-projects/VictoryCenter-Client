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

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    __esModule: true,
    ImageInput: require('@/utils/test-mocks/main-page-mocks').MockImageInput,
}));

jest.mock('./components/statistics-preview/StatisticsPreview', () => ({
    StatisticsPreview: ({ language }: any) => <div data-testid="statistics-preview">{language}</div>,
}));

jest.mock('./components/statistics-metrics-list/StatisticsMetricsList', () => ({
    StatisticsMetricsList: () => <div data-testid="metrics-list" />,
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
});
