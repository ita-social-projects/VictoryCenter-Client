import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { Metric, MetricLocalization, MetricPrefix, MetricType } from '@/types/admin/main-page';

import { RaisedMetricEditPanel } from './RaisedMetricEditPanel';

jest.mock('../common/metric-edit-actions/MetricEditActions', () => ({
    MetricEditActions: ({ isFormDirty, isValid, onCancel, onSave }: any) => (
        <div data-testid="metric-actions">
            <button type="button" data-testid="mock-cancel" onClick={onCancel}>
                Cancel
            </button>
            <button type="button" data-testid="mock-save" onClick={onSave} disabled={!isFormDirty || !isValid}>
                Save
            </button>
        </div>
    ),
}));

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

    it('disables value inputs when auto-sync toggle is switched on', async () => {
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

        const uahInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL, { exact: false });
        const usdInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL, { exact: false });

        expect(uahInput).not.toBeDisabled();
        expect(usdInput).not.toBeDisabled();

        const syncToggle = screen.getByRole('switch');
        fireEvent.click(syncToggle);

        await waitFor(() => {
            expect(uahInput).toBeDisabled();
            expect(usdInput).toBeDisabled();
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

    it('calls onCancel when cancel action is triggered', () => {
        const onCancelMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={onCancelMock} />);

        fireEvent.click(screen.getByTestId('mock-cancel'));

        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });

    describe('Validation and editing manually', () => {
        it('shows inline error when input is emptied and removes it when corrected', async () => {
            render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

            const syncToggle = screen.getByRole('switch');
            fireEvent.click(syncToggle);

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

        it('shows inline error for negative numbers', async () => {
            render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

            fireEvent.click(screen.getByRole('switch'));

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

            fireEvent.click(screen.getByRole('switch'));

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
