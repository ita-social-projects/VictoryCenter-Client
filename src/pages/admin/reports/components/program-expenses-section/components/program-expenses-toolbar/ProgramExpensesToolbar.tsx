import { MultiSelectInput } from '@/components/admin/multi-select-input/MultiSelectInput';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesProgram } from '@/types/admin/reports';
import styles from './ProgramExpensesToolbar.module.scss';

interface ProgramExpensesToolbarProps {
    programs: ProgramExpensesProgram[];
    selectedProgramIds: number[];
    exchangeRate: string | null;
    onProgramChange: (value: number[]) => void;
}

const ALL_PROGRAMS_FILTER_OPTION_ID = 0;

const ALL_PROGRAMS_FILTER_OPTION: ProgramExpensesProgram = {
    id: ALL_PROGRAMS_FILTER_OPTION_ID,
    name: PROGRAM_EXPENSES_TEXT.FILTER.ALL_OPTION,
};

const isAllProgramsFilterOption = (program: ProgramExpensesProgram) => program.id === ALL_PROGRAMS_FILTER_OPTION_ID;

const getProgramsFilterDisplayValue = (selectedPrograms: ProgramExpensesProgram[]) => {
    if (selectedPrograms.length === 1) return selectedPrograms[0].name;
    if (selectedPrograms.length > 1) {
        return PROGRAM_EXPENSES_TEXT.FILTER.getProgramsCounterLabel(selectedPrograms.length);
    }

    return PROGRAM_EXPENSES_TEXT.FILTER.PROGRAMS_PLACEHOLDER;
};

export const ProgramExpensesToolbar = ({
    programs,
    selectedProgramIds,
    exchangeRate,
    onProgramChange,
}: ProgramExpensesToolbarProps) => {
    const selectedPrograms = programs.filter((program) => selectedProgramIds.includes(program.id));
    const programOptions = [ALL_PROGRAMS_FILTER_OPTION, ...programs];

    const handleProgramChange = (selectedOptions: ProgramExpensesProgram[]) => {
        if (selectedOptions.some(isAllProgramsFilterOption)) {
            onProgramChange([]);
            return;
        }

        onProgramChange(selectedOptions.map((program) => program.id));
    };

    return (
        <div className={styles['toolbar-row']}>
            <div className={styles['program-select']}>
                <MultiSelectInput<ProgramExpensesProgram>
                    id="program-expenses-program-filter"
                    options={programOptions}
                    value={selectedPrograms}
                    getOptionId={(program) => program.id}
                    getOptionName={(program) => program.name}
                    getDisplayValue={getProgramsFilterDisplayValue}
                    isOptionSelected={(program, selectedValues) =>
                        isAllProgramsFilterOption(program)
                            ? selectedValues.length === 0
                            : selectedValues.some((selectedProgram) => selectedProgram.id === program.id)
                    }
                    onChange={handleProgramChange}
                    placeholder={PROGRAM_EXPENSES_TEXT.FILTER.PROGRAMS_PLACEHOLDER}
                />
            </div>

            <div className={styles['exchange-rate']}>
                <span className={styles['exchange-rate-label']}>{FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}</span>
                <span className={styles['exchange-rate-value']}>{exchangeRate ?? '-'}</span>
            </div>
        </div>
    );
};
