import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric, MetricLocalization, MetricPrefix, MetricType } from '@/types/admin/main-page';

import { RaisedMetricEditPanel } from './RaisedMetricEditPanel';

jest.mock('@/components/admin/button/Button', () => ({
    __esModule: true,
    Button: ({ children, disabled, onClick }: any) => (
        <button type="button" disabled={disabled} onClick={onClick}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="mock-modal">
                <p>{title}</p>
                <button onClick={onConfirm}>Yes</button>
                <button onClick={onCancel}>No</button>
            </div>
        );
    },
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

        const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
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

        const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });

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

    it('calls onCancel directly if form is untouched', () => {
        const onCancelMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={onCancelMock} />);

        const cancelButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL });
        fireEvent.click(cancelButton);

        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });

    it('opens confirmation modal when canceling with dirty form', async () => {
        const onCancelMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={onCancelMock} />);

        const uaNameInput = screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UKR_NAME_LABEL, { exact: false });
        fireEvent.change(uaNameInput, { target: { value: 'Modified' } });

        const cancelButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL });
        fireEvent.click(cancelButton);

        expect(onCancelMock).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Yes'));
        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
});
