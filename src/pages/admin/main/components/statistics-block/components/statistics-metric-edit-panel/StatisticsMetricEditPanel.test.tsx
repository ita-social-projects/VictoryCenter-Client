import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';

import { StatisticsMetricEditPanel } from './StatisticsMetricEditPanel';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    __esModule: true,
    InputWithCharacterLimitGroup: ({ id, value, onChange, onBlur }: any) => (
        <input data-testid={id} value={value ?? ''} onChange={onChange} onBlur={onBlur} />
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    __esModule: true,
    Button: ({ children, buttonStyle: _buttonStyle, ...props }: any) => (
        <button type="button" {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    __esModule: true,
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, onClose, title }: any) =>
        isOpen ? (
            <div data-testid="confirm-modal">
                <div>{title}</div>
                <button type="button" data-testid="confirm-action" onClick={onConfirm}>
                    Confirm
                </button>
                <button type="button" data-testid="cancel-action" onClick={onCancel}>
                    Cancel
                </button>
                <button type="button" data-testid="close-action" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
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
    it('renders default values and resolved prefix', () => {
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={jest.fn()} />);

        expect(screen.getByTestId('metric-ua-1')).toHaveValue('Назва UA');
        expect(screen.getByTestId('metric-en-1')).toHaveValue('Name EN');
        expect(screen.getByTestId('metric-val-1')).toHaveValue('1 200');
        expect(screen.getByTestId('metric-prefix-1')).toHaveAttribute('data-selected', 'Plus');
    });

    it('submits trimmed values and parsed number', async () => {
        const onSave = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={onSave} onCancel={jest.fn()} />);

        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: '  Нова UA  ' } });
        fireEvent.change(screen.getByTestId('metric-en-1'), { target: { value: '  New EN  ' } });
        fireEvent.change(screen.getByTestId('metric-val-1'), { target: { value: '2 345' } });
        fireEvent.click(screen.getByTestId('metric-prefix-1-Percent'));

        const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
        await waitFor(() => expect(saveButton).not.toBeDisabled());
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledTimes(1);
        });

        const updatedMetric = onSave.mock.calls[0][0];
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
                metric={createMetric({ name: '', localizations: undefined, prefix: 2 as any })}
                onSave={jest.fn()}
                onCancel={jest.fn()}
            />,
        );

        expect(screen.getByTestId('metric-ua-1')).toHaveValue('');
        expect(screen.getByTestId('metric-en-1')).toHaveValue('');
        expect(screen.getByTestId('metric-prefix-1')).toHaveAttribute('data-selected', 'Percent');
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
        fireEvent.blur(screen.getByTestId('metric-ua-1'));
        fireEvent.blur(screen.getByTestId('metric-en-1'));
        fireEvent.blur(screen.getByTestId('metric-val-1'));

        const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
        await waitFor(() => expect(saveButton).not.toBeDisabled());
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledTimes(1);
        });

        const updatedMetric = onSave.mock.calls[0][0];
        expect(updatedMetric.localizations).toEqual([
            { languageId: 1, name: 'Нова UA' },
            { languageId: 3, name: 'Third Language' },
        ]);
    });

    it('keeps prefix when selecting the same option', async () => {
        const onSave = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={onSave} onCancel={jest.fn()} />);

        fireEvent.click(screen.getByTestId('metric-prefix-1-Plus'));
        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: 'Оновлена UA' } });
        fireEvent.blur(screen.getByTestId('metric-ua-1'));
        fireEvent.blur(screen.getByTestId('metric-en-1'));
        fireEvent.blur(screen.getByTestId('metric-val-1'));

        const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
        await waitFor(() => expect(saveButton).not.toBeDisabled());
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledTimes(1);
        });

        const updatedMetric = onSave.mock.calls[0][0];
        expect(updatedMetric.prefix).toBe(MetricPrefix.Plus);
    });

    it('opens cancel modal when form is dirty and confirms cancel', async () => {
        const onCancel = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={onCancel} />);

        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: 'Зміна' } });

        fireEvent.click(screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL }));

        expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('confirm-action'));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('closes cancel modal without triggering onCancel', async () => {
        const onCancel = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={onCancel} />);

        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: 'Зміна' } });
        fireEvent.click(screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL }));

        expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('cancel-action'));
        await waitFor(() => {
            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL }));
        expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('close-action'));
        await waitFor(() => {
            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
        });

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('cancels immediately when form is not dirty', () => {
        const onCancel = jest.fn();
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={onCancel} />);

        fireEvent.click(screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.CANCEL }));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });

    it('handles saving when localizations are undefined', async () => {
        const onSave = jest.fn();
        const metric = createMetric({ localizations: undefined as any });

        render(<StatisticsMetricEditPanel metric={metric} onSave={onSave} onCancel={jest.fn()} />);

        fireEvent.change(screen.getByTestId('metric-ua-1'), { target: { value: 'UA Update' } });
        fireEvent.change(screen.getByTestId('metric-en-1'), { target: { value: 'EN Update' } });
        fireEvent.blur(screen.getByTestId('metric-ua-1'));
        fireEvent.blur(screen.getByTestId('metric-en-1'));

        const saveButton = screen.getByRole('button', { name: MAIN_PAGE_TEXT.BUTTONS.SAVE });
        await waitFor(() => expect(saveButton).not.toBeDisabled());
        fireEvent.click(saveButton);

        await waitFor(() => {
            const updatedMetric = onSave.mock.calls[0][0];
            expect(updatedMetric.localizations).toEqual([]);
        });
    });

    it('uses default prefix option when provided prefix is invalid', () => {
        render(
            <StatisticsMetricEditPanel
                metric={createMetric({ prefix: 999 as any })}
                onSave={jest.fn()}
                onCancel={jest.fn()}
            />,
        );

        expect(screen.getByTestId('metric-prefix-1')).toHaveAttribute('data-selected', 'None');
    });

    it('handles prefix selection fallbacks in onChange', async () => {
        render(<StatisticsMetricEditPanel metric={createMetric()} onSave={jest.fn()} onCancel={jest.fn()} />);

        const noneOption = screen.getByTestId('metric-prefix-1-None');
        fireEvent.click(noneOption);

        await waitFor(() => {
            expect(screen.getByTestId('metric-prefix-1')).toBeInTheDocument();
        });
    });
});
