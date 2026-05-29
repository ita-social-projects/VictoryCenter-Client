import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';

import { RaisedMetricEditPanel } from './RaisedMetricEditPanel';

jest.mock('@/components/admin/button/Button', () => ({
    __esModule: true,
    Button: ({ children, disabled, onClick }: any) => (
        <button type="button" disabled={disabled} onClick={onClick}>
            {children}
        </button>
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
    localizations: [],
    ...overrides,
});

describe('RaisedMetricEditPanel', () => {
    it('renders the panel with header and placeholder message', () => {
        const metric = createMetric();
        render(<RaisedMetricEditPanel metric={metric} onCancel={jest.fn()} />);

        expect(screen.getByText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.TITLE)).toBeInTheDocument();
        expect(screen.getByText(`Редагування метрики "${metric.name}" наразі недоступне.`)).toBeInTheDocument();
    });

    it('renders active Cancel button and disabled Save button', () => {
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={jest.fn()} />);

        const cancelButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL });
        const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });

        expect(cancelButton).not.toBeDisabled();
        expect(saveButton).toBeDisabled();
    });

    it('calls onCancel when Cancel button is clicked', () => {
        const onCancelMock = jest.fn();
        render(<RaisedMetricEditPanel metric={createMetric()} onCancel={onCancelMock} />);

        const cancelButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL });
        fireEvent.click(cancelButton);

        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
});
