import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FieldErrors, useForm } from 'react-hook-form';
import { MetricNameFields } from './MetricNameFields';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ id, label, value, onChange, onBlur, error, maxLength, isRequired }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                value={value ?? ''}
                onChange={onChange}
                onBlur={onBlur}
                maxLength={maxLength}
                required={isRequired}
                data-testid={id}
            />
            {error && <span data-testid={`${id}-error`}>{error}</span>}
        </div>
    ),
}));

const Wrapper = ({
    metricId = 1,
    idPrefix,
    defaultValues = { nameUa: '', nameEn: '' },
    errors = {},
}: {
    metricId?: number | undefined;
    idPrefix?: string;
    defaultValues?: { nameUa: string; nameEn: string };
    errors?: FieldErrors<{ nameUa: string; nameEn: string }>;
}) => {
    const { control } = useForm({ defaultValues });
    return <MetricNameFields metricId={metricId} control={control} errors={errors} idPrefix={idPrefix} />;
};

describe('MetricNameFields', () => {
    it('renders UA and EN inputs with correct labels', () => {
        render(<Wrapper />);

        expect(screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UKR_NAME_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.ENG_NAME_LABEL)).toBeInTheDocument();
    });

    it('renders inputs with default idPrefix "metric"', () => {
        render(<Wrapper metricId={5} />);

        expect(screen.getByTestId('metric-ua-5')).toBeInTheDocument();
        expect(screen.getByTestId('metric-en-5')).toBeInTheDocument();
    });

    it('renders inputs with custom idPrefix', () => {
        render(<Wrapper metricId={3} idPrefix="raised-metric" />);

        expect(screen.getByTestId('raised-metric-ua-3')).toBeInTheDocument();
        expect(screen.getByTestId('raised-metric-en-3')).toBeInTheDocument();
    });

    it('renders initial values from form defaultValues', () => {
        render(<Wrapper defaultValues={{ nameUa: 'Назва UA', nameEn: 'Name EN' }} />);

        expect(screen.getByTestId('metric-ua-1')).toHaveValue('Назва UA');
        expect(screen.getByTestId('metric-en-1')).toHaveValue('Name EN');
    });

    it('shows error message for nameUa when passed via errors prop', () => {
        render(<Wrapper errors={{ nameUa: { message: 'UA name is required', type: 'required' } }} />);

        expect(screen.getByTestId('metric-ua-1-error')).toHaveTextContent('UA name is required');
        expect(screen.queryByTestId('metric-en-1-error')).not.toBeInTheDocument();
    });

    it('shows error message for nameEn when passed via errors prop', () => {
        render(<Wrapper errors={{ nameEn: { message: 'EN name is required', type: 'required' } }} />);

        expect(screen.getByTestId('metric-en-1-error')).toHaveTextContent('EN name is required');
        expect(screen.queryByTestId('metric-ua-1-error')).not.toBeInTheDocument();
    });

    it('does not render error when errors prop is empty', () => {
        render(<Wrapper />);

        expect(screen.queryByTestId('metric-ua-1-error')).not.toBeInTheDocument();
        expect(screen.queryByTestId('metric-en-1-error')).not.toBeInTheDocument();
    });

    it('updates UA input value on change', () => {
        render(<Wrapper />);

        const uaInput = screen.getByTestId('metric-ua-1');
        fireEvent.change(uaInput, { target: { value: 'Нова назва' } });

        expect(uaInput).toHaveValue('Нова назва');
    });

    it('updates EN input value on change', () => {
        render(<Wrapper />);

        const enInput = screen.getByTestId('metric-en-1');
        fireEvent.change(enInput, { target: { value: 'New name' } });

        expect(enInput).toHaveValue('New name');
    });
});
