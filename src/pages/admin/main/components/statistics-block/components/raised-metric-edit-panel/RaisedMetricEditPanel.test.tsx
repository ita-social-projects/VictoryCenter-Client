import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { Metric, MetricLocalization, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { MockMetricEditActions } from '@/utils/test-mocks/main-page-mocks';
import { RaisedMetricEditPanel } from './RaisedMetricEditPanel';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(() => ({})),
}));

jest.mock('@/services/api/admin/reports/funds-expenditures-api', () => ({
    FundsExpendituresApi: {
        getSummary: jest.fn(),
    },
}));

jest.mock('../common/metric-edit-actions/MetricEditActions', () => ({
    MetricEditActions: (props: any) => <MockMetricEditActions {...props} />,
}));

const { FundsExpendituresApi } = require('@/services/api/admin/reports/funds-expenditures-api');

const createMetric = (overrides: Partial<Metric> = {}): Metric => ({
    id: 3,
    name: 'Залучених коштів',
    value: 1000000,
    type: MetricType.Raised,
    prefix: MetricPrefix.None,
    isHidden: false,
    priority: 3,
    localizations: [
        { languageId: 1, name: 'Залучених коштів' },
        { languageId: 2, name: 'Funds raised', value: '25000' },
    ] as MetricLocalization[],
    ...overrides,
});

describe('RaisedMetricEditPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        FundsExpendituresApi.getSummary.mockResolvedValue({
            totalCollectedUah: 7654321,
            totalCollectedUsd: 182500.5,
        });
    });

    it('renders initial values correctly mapped from UAH and USD localizations', () => {
        const metric = createMetric();
        render(<RaisedMetricEditPanel metric={metric} onCancel={jest.fn()} />);

        expect(screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UKR_NAME_LABEL, { exact: false })).toHaveValue(
            'Залучених коштів',
        );
        expect(screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.ENG_NAME_LABEL, { exact: false })).toHaveValue(
            'Funds raised',
        );
        expect(screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, { exact: false })).toHaveValue(
            '1 000 000',
        );
        expect(screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false })).toHaveValue(
            '25 000',
        );

        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('renders formatted saved USD localization without blanking the field', () => {
        const metric = createMetric({
            localizations: [
                { languageId: 1, name: 'Залучених коштів' },
                { languageId: 2, name: 'Funds raised', value: '120 000' },
            ] as MetricLocalization[],
        });

        render(<RaisedMetricEditPanel metric={metric} onCancel={jest.fn()} />);

        expect(screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false })).toHaveValue(
            '120 000',
        );
    });

    it('enables Save button when form values are changed', async () => {
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

        const saveButton = screen.getByTestId('mock-save');
        expect(saveButton).toBeDisabled();

        const uaNameInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UKR_NAME_LABEL, { exact: false });
        fireEvent.change(uaNameInput, { target: { value: 'Нова назва' } });

        await waitFor(() => {
            expect(saveButton).not.toBeDisabled();
        });
    });

    it('opens confirmation popup and keeps values editable when auto-sync toggle is switched on before confirmation', async () => {
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

        const uahInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, { exact: false });
        const usdInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false });
        const syncToggle = screen.getByRole('switch');

        expect(uahInput).not.toBeDisabled();
        expect(usdInput).not.toBeDisabled();

        fireEvent.click(syncToggle);

        expect(await screen.findByText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.SYNC_CONFIRM_TITLE)).toBeInTheDocument();
        expect(syncToggle).not.toBeChecked();
        expect(uahInput).not.toBeDisabled();
        expect(usdInput).not.toBeDisabled();
        expect(uahInput).toHaveValue('1 000 000');
        expect(usdInput).toHaveValue('25 000');
    });

    it('closes confirmation popup and restores OFF state when auto-sync is declined', async () => {
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

        const uahInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, { exact: false });
        const usdInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false });
        const saveButton = screen.getByTestId('mock-save');

        fireEvent.click(screen.getByRole('switch'));
        fireEvent.click(await screen.findByText('Ні'));

        await waitFor(() => {
            expect(screen.queryByText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.SYNC_CONFIRM_TITLE)).not.toBeInTheDocument();
        });

        expect(screen.getByRole('switch')).not.toBeChecked();
        expect(uahInput).toHaveValue('1 000 000');
        expect(usdInput).toHaveValue('25 000');
        expect(uahInput).not.toBeDisabled();
        expect(usdInput).not.toBeDisabled();
        expect(saveButton).toBeDisabled();
        expect(FundsExpendituresApi.getSummary).not.toHaveBeenCalled();
    });

    it('loads reporting totals as preview, locks amount fields and activates Save when auto-sync is confirmed', async () => {
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

        const uahInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, { exact: false });
        const usdInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false });
        const saveButton = screen.getByTestId('mock-save');

        fireEvent.click(screen.getByRole('switch'));
        fireEvent.click(await screen.findByText('Так'));

        await waitFor(() => {
            expect(screen.getByRole('switch')).toBeChecked();
            expect(uahInput).toHaveValue('7 654 321');
            expect(usdInput).toHaveValue('182 500.5');
            expect(uahInput).toBeDisabled();
            expect(usdInput).toBeDisabled();
            expect(saveButton).not.toBeDisabled();
        });
    });

    it('uses saved auto-sync state and makes values editable immediately after switching it off', async () => {
        render(<RaisedMetricEditPanel metric={createMetric({ isAutoSynced: true })} onCancel={jest.fn()} />);

        const uahInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, { exact: false });
        const usdInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false });

        expect(screen.getByRole('switch')).toBeChecked();
        expect(uahInput).toBeDisabled();
        expect(usdInput).toBeDisabled();
        expect(uahInput).toHaveValue('1 000 000');
        expect(usdInput).toHaveValue('25 000');

        fireEvent.click(screen.getByRole('switch'));

        await waitFor(() => {
            expect(uahInput).not.toBeDisabled();
            expect(usdInput).not.toBeDisabled();
            expect(uahInput).toHaveValue('1 000 000');
            expect(usdInput).toHaveValue('25 000');
        });
    });

    it('preserves decimal raised values on save', async () => {
        const onSaveMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onSave={onSaveMock} onCancel={jest.fn()} />);

        const uahInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, { exact: false });
        const usdInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false });

        fireEvent.change(uahInput, { target: { value: '1234567,89' } });
        fireEvent.change(usdInput, { target: { value: '30000.75' } });
        fireEvent.blur(uahInput);
        fireEvent.blur(usdInput);

        const saveButton = screen.getByTestId('mock-save');

        await waitFor(() => {
            expect(saveButton).not.toBeDisabled();
        });

        fireEvent.click(saveButton);

        await waitFor(() => {
            const savedMetric = onSaveMock.mock.calls[0][0];
            const engLocalization = savedMetric.localizations.find((l: any) => l.languageId === 2);

            expect(savedMetric.value).toBe(1234567.89);
            expect(engLocalization.value).toBe('30000.75');
        });
    });

    it('calls onSave with updated values mapped correctly', async () => {
        const onSaveMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onSave={onSaveMock} onCancel={jest.fn()} />);

        const usdInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false });
        fireEvent.change(usdInput, { target: { value: '30000' } });

        const saveButton = screen.getByTestId('mock-save');

        await waitFor(() => {
            expect(saveButton).not.toBeDisabled();
        });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onSaveMock).toHaveBeenCalledTimes(1);
            const savedMetric = onSaveMock.mock.calls[0][0];

            const engLocalization = savedMetric.localizations.find((l: any) => l.languageId === 2);
            expect(engLocalization.value).toBe('30000');
        });
    });

    it('calls onSave with preview values and isAutoSynced=true after confirmed auto-sync', async () => {
        const onSaveMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onSave={onSaveMock} onCancel={jest.fn()} />);

        fireEvent.click(screen.getByRole('switch'));
        fireEvent.click(await screen.findByText('Так'));

        const saveButton = screen.getByTestId('mock-save');

        await waitFor(() => {
            expect(saveButton).not.toBeDisabled();
        });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onSaveMock).toHaveBeenCalledTimes(1);
            const savedMetric = onSaveMock.mock.calls[0][0];
            const engLocalization = savedMetric.localizations.find((l: any) => l.languageId === 2);

            expect(savedMetric.isAutoSynced).toBe(true);
            expect(savedMetric.value).toBe(7654321);
            expect(engLocalization.value).toBe('182500.5');
        });
    });

    it('returns toggle to OFF and reports sync error when reporting totals cannot be loaded', async () => {
        const onSyncErrorChange = jest.fn();
        FundsExpendituresApi.getSummary.mockRejectedValueOnce(new Error('unavailable'));

        render(
            <RaisedMetricEditPanel
                metric={createMetric()}
                onCancel={jest.fn()}
                onSyncErrorChange={onSyncErrorChange}
            />,
        );

        fireEvent.click(screen.getByRole('switch'));
        fireEvent.click(await screen.findByText('Так'));

        await waitFor(() => {
            expect(screen.getByRole('switch')).not.toBeChecked();
            expect(onSyncErrorChange).toHaveBeenCalledWith(true);
            expect(screen.queryByText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.SYNC_CONFIRM_TITLE)).not.toBeInTheDocument();
        });
    });

    it('calls onCancel when cancel action is triggered', () => {
        const onCancelMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={onCancelMock} />);

        fireEvent.click(screen.getByTestId('mock-cancel'));

        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });

    describe('Validation and editing manually', () => {
        it('shows inline error when input is emptied and removes it when corrected', async () => {
            render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

            const uahInput = await screen.findByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, {
                exact: false,
            });

            fireEvent.change(uahInput, { target: { value: '' } });
            fireEvent.blur(uahInput);

            await waitFor(() => {
                expect(screen.getByText(MAIN_PAGE_VALIDATION.raisedFunds.REQUIRED)).toBeInTheDocument();
            });

            const saveButton = screen.getByTestId('mock-save');
            expect(saveButton).toBeDisabled();

            fireEvent.change(uahInput, { target: { value: '500' } });
            fireEvent.blur(uahInput);

            await waitFor(() => {
                expect(screen.queryByText(MAIN_PAGE_VALIDATION.raisedFunds.REQUIRED)).not.toBeInTheDocument();
                expect(saveButton).not.toBeDisabled();
            });
        });

        it('shows inline error for negative input', async () => {
            render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

            const usdInput = await screen.findByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, {
                exact: false,
            });

            fireEvent.change(usdInput, { target: { value: '-10' } });
            fireEvent.blur(usdInput);

            await waitFor(() => {
                expect(screen.getByText(MAIN_PAGE_VALIDATION.raisedFunds.NEGATIVE)).toBeInTheDocument();
            });
        });

        it('shows inline error for zero', async () => {
            render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

            const uahInput = await screen.findByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, {
                exact: false,
            });

            fireEvent.change(uahInput, { target: { value: '0' } });
            fireEvent.blur(uahInput);

            await waitFor(() => {
                expect(screen.getByText(MAIN_PAGE_VALIDATION.raisedFunds.ZERO)).toBeInTheDocument();
            });
        });
    });
});
