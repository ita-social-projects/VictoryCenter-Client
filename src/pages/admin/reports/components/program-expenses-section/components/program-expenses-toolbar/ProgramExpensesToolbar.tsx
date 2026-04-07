import { Select } from '@/components/common/select/Select';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesProgram } from '@/types/admin/reports';
import styles from './ProgramExpensesToolbar.module.scss';

interface ProgramExpensesToolbarProps {
    programs: ProgramExpensesProgram[];
    selectedProgramId: number | undefined;
    exchangeRate: string | null;
    onProgramChange: (value: number | undefined) => void;
}

export const ProgramExpensesToolbar = ({
    programs,
    selectedProgramId,
    exchangeRate,
    onProgramChange,
}: ProgramExpensesToolbarProps) => {
    return (
        <div className={styles['toolbar-row']}>
            <Select<number | undefined>
                value={selectedProgramId}
                onValueChange={onProgramChange}
                className={styles['program-select']}
                headClassName={styles['program-select-head']}
                optionClassName={styles['program-option']}
                placeholder={PROGRAM_EXPENSES_TEXT.FILTER.PLACEHOLDER}
            >
                <Select.Option value={undefined} name={PROGRAM_EXPENSES_TEXT.FILTER.ALL_OPTION} />
                {programs.map((program) => (
                    <Select.Option key={program.id} value={program.id} name={program.name} />
                ))}
            </Select>

            <div className={styles['exchange-rate']}>
                <span className={styles['exchange-rate-label']}>{FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}</span>
                <span className={styles['exchange-rate-value']}>{exchangeRate ?? '-'}</span>
            </div>
        </div>
    );
};
