import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { MockMetricEditActions } from '@/utils/test-mocks/main-page-mocks';
import { StatisticsMetricEditPanel } from './StatisticsMetricEditPanel';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    __esModule: true,
    InputWithCharacterLimitGroup: ({ id, value, onChange, onBlur }: any) => (
        <input data-testid={id} value={value ?? ''} onChange={onChange} onBlur={onBlur} />
    ),
}));

jest.mock('@/components/admin/multi-select-input/MultiSelectInput', () => ({
    __esModule: true,
    MultiSelectInput: ({ id, options, value, onChange, getOptionId, getOptionName }: any) => (
        <div data-testid={id} data-selected={value?.[0]?.id ?? ''}>
            {options.map((option: any) => (
                <button
                    key={getOptionId(option)}
                    type="button"
                    data-testid={`${id}-${getOptionId(option)}`}
                    onClick={() => onChange([option])}
                >
                    {getOptionName(option)}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('../common/metric-edit-actions/MetricEditActions', () => ({
    MetricEditActions: (props: any) => <MockMetricEditActions {...props} />,
}));

const createMetric = (overrides: Partial<Metric> = {}): Metric => ({
    id: 1,
    name: 'Назва UA',
    value: 1200,
    type: MetricType.Partners,
    prefix: MetricPrefix.Plus,
    isHidden: false,
    priority: 1,
    localizations: [{ languageId: 1, name: 'Назва UA' } as any, { languageId: 2, name: 'Name EN' } as any],
    ...overrides,
});

describe('StatisticsMetricEditPanel', () => {
    const submitForm = async (onSaveMock: jest.Mock) => {
        fireEvent.blur(screen.getByTestId('metric-ua-1'));
        fireEvent.blur(screen.getByTestId('metric-en-1'));
        fireEvent.blur(screen.getByTestId('metric-val-1'));

        const saveButton = screen.getByTestId('mock-save');
        await waitFor(() => expect(saveButton).not.toBeDisabled());
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onSaveMock).toHaveBeenCalledTimes(1);
        });

        return onSaveMock.mock.calls[0][0];
    };

    it('renders default values and resolved prefix', () => {
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={jest.fn()} />);

        expect(screen.getByTestId('metric-ua-1')).toHaveValue('Назва UA');
        expect(screen.getByTestId('metric-en-1')).toHaveValue('Name EN');
        expect(screen.getByTestId('metric-val-1')).toHaveValue('1 200');
        expect(screen.getByTestId('metric-prefix-1')).toHaveAttribute('data-selected', String(MetricPrefix.Plus));
    });

    it('submits trimmed values and parsed number', async () => {
        const onSave = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={onSave} onCancel={jest.fn()} />);

        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: '  Нова UA  ' } });
        fireEvent.change(screen.getByTestId('metric-en-1'), { target: { value: '  New EN  ' } });
        fireEvent.change(screen.getByTestId('metric-val-1'), { target: { value: '2 345' } });
        fireEvent.click(screen.getByTestId(`metric-prefix-1-${MetricPrefix.Percent}`));

        const updatedMetric = await submitForm(onSave);

        expect(updatedMetric.name).toBe('Нова UA');
        expect(updatedMetric.value).toBe(2345);
        expect(updatedMetric.prefix).toBe(MetricPrefix.Percent);
        expect(updatedMetric.localizations).toEqual([
            { languageId: 1, name: 'Нова UA' },
            { languageId: 2, name: 'New EN' },
        ]);
    });

    it('uses fallback defaults when name and localizations are missing', () => {
        render(
            <StatisticsMetricEditPanel
                metric={createMetric({ name: '', localizations: undefined, prefix: MetricPrefix.Percent })}
                onSave={jest.fn()}
                onCancel={jest.fn()}
            />,
        );

        expect(screen.getByTestId('metric-ua-1')).toHaveValue('');
        expect(screen.getByTestId('metric-en-1')).toHaveValue('');
        expect(screen.getByTestId('metric-prefix-1')).toHaveAttribute('data-selected', String(MetricPrefix.Percent));
    });

    it('preserves non-target localizations when saving', async () => {
        const onSave = jest.fn();
        const metric = createMetric({
            localizations: [
                { languageId: 1, name: 'Назва UA' } as any,
                { languageId: 3, name: 'Third Language' } as any,
            ],
        });

        render(<StatisticsMetricEditPanel metric={metric} onSave={onSave} onCancel={jest.fn()} />);

        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: 'Нова UA' } });
        fireEvent.change(screen.getByTestId('metric-en-1'), { target: { value: 'Name EN' } });

        const updatedMetric = await submitForm(onSave);

        expect(updatedMetric.localizations).toEqual([
            { languageId: 1, name: 'Нова UA' },
            { languageId: 3, name: 'Third Language' },
        ]);
    });

    it('keeps prefix when selecting the same option', async () => {
        const onSave = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={onSave} onCancel={jest.fn()} />);

        fireEvent.click(screen.getByTestId(`metric-prefix-1-${MetricPrefix.Plus}`));
        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: 'Оновлена UA' } });

        const updatedMetric = await submitForm(onSave);

        expect(updatedMetric.prefix).toBe(MetricPrefix.Plus);
    });

    it('handles saving when localizations are undefined', async () => {
        const onSave = jest.fn();
        const metric = createMetric({ localizations: undefined as any });

        render(<StatisticsMetricEditPanel metric={metric} onSave={onSave} onCancel={jest.fn()} />);

        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: 'UA Update' } });
        fireEvent.change(screen.getByTestId('metric-en-1'), { target: { value: 'EN Update' } });

        const updatedMetric = await submitForm(onSave);
        expect(updatedMetric.localizations).toEqual([]);
    });

    it('uses default prefix option when provided prefix is invalid', () => {
        render(
            <StatisticsMetricEditPanel
                metric={createMetric({ prefix: 999 as any })}
                onSave={jest.fn()}
                onCancel={jest.fn()}
            />,
        );

        expect(screen.getByTestId('metric-prefix-1')).toHaveAttribute('data-selected', String(MetricPrefix.None));
    });

    it('handles prefix selection fallbacks in onChange', async () => {
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={jest.fn()} />);

        const noneOption = screen.getByTestId(`metric-prefix-1-${MetricPrefix.None}`);
        fireEvent.click(noneOption);

        await waitFor(() => {
            expect(screen.getByTestId('metric-prefix-1')).toBeInTheDocument();
        });
    });

    it('calls onCancel when cancel action is triggered', () => {
        const onCancelMock = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={onCancelMock} />);

        fireEvent.click(screen.getByTestId('mock-cancel'));

        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
});
