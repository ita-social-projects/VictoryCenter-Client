import { Select } from '@/components/common/select/Select';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresTransactionType, ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { FundsRecordActions } from '@/pages/admin/reports/components/funds-expenditures-section/components/common/funds-record-actions/FundsRecordActions';
import cn from 'classnames';
import styles from './FundsExpendituresToolbar.module.scss';

export type TypeFilterValue = FundsExpendituresTransactionType | undefined;
export type CategoryFilterValue = number | undefined;

interface FundsExpendituresToolbarProps {
    categories: ReportFundsExpendituresCategory[];
    selectedType: TypeFilterValue;
    selectedCategoryId: CategoryFilterValue;
    exchangeRate: string | null;
    isEditing: boolean;
    controlsDisabled?: boolean;
    isAddIncomeDisabled: boolean;
    isAddExpenseDisabled: boolean;
    onTypeChange: (value: TypeFilterValue) => void;
    onCategoryChange: (value: CategoryFilterValue) => void;
    onExchangeRateChange?: (value: string) => void;
    onExchangeRateBlur?: () => void;
    exchangeRateError?: string;
    onAddIncome: () => void;
    onAddExpense: () => void;
}

export const FundsExpendituresToolbar = ({
    categories,
    selectedType,
    selectedCategoryId,
    exchangeRate,
    isEditing,
    controlsDisabled = false,
    isAddIncomeDisabled,
    isAddExpenseDisabled,
    onTypeChange,
    onCategoryChange,
    onExchangeRateChange,
    onExchangeRateBlur,
    exchangeRateError,
    onAddIncome,
    onAddExpense,
}: FundsExpendituresToolbarProps) => {
    return (
        <div className={styles.toolbar} data-testid="funds-toolbar" data-controls-disabled={String(controlsDisabled)}>
            <div className={styles['toolbar-row']}>
                <div className={styles.filters}>
                    <Select<TypeFilterValue>
                        value={selectedType}
                        onValueChange={(value) => {
                            if (!controlsDisabled) {
                                onTypeChange(value);
                            }
                        }}
                        placeholder={FUNDS_EXPENDITURES_TEXT.FILTER.TYPE_PLACEHOLDER}
                        className={cn(styles['filter-select'], {
                            [styles['filter-select-disabled']]: controlsDisabled,
                        })}
                        optionClassName={styles['filter-option']}
                    >
                        <Select.Option value={undefined} name={FUNDS_EXPENDITURES_TEXT.FILTER.ALL_OPTION} />
                        <Select.Option value="income" name={FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME} />
                        <Select.Option value="expense" name={FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE} />
                    </Select>

                    <Select<CategoryFilterValue>
                        value={selectedCategoryId}
                        onValueChange={(value) => {
                            if (!controlsDisabled) {
                                onCategoryChange(value);
                            }
                        }}
                        placeholder={FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}
                        className={cn(styles['filter-select'], styles['category-filter-select'], {
                            [styles['filter-select-disabled']]: controlsDisabled,
                        })}
                        optionClassName={styles['filter-option']}
                    >
                        <Select.Option value={undefined} name={FUNDS_EXPENDITURES_TEXT.FILTER.ALL_OPTION} />
                        {categories.map((category) => (
                            <Select.Option key={category.id} value={category.id} name={category.name} />
                        ))}
                    </Select>
                </div>

                <div className={styles['toolbar-right']}>
                    {exchangeRate !== null && (
                        <div className={styles['exchange-rate']} data-testid="exchange-rate-container">
                            <span className={styles['exchange-rate-label']}>
                                {FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}
                            </span>
                            {isEditing ? (
                                <div className={styles['exchange-rate-field']}>
                                    <input
                                        type="text"
                                        data-testid="exchange-rate-input"
                                        className={cn(styles['exchange-rate-input'], {
                                            [styles['exchange-rate-input-disabled']]: controlsDisabled,
                                            [styles['exchange-rate-input-error']]: Boolean(exchangeRateError),
                                        })}
                                        value={exchangeRate}
                                        disabled={controlsDisabled}
                                        onChange={(e) => onExchangeRateChange?.(e.target.value)}
                                        onBlur={onExchangeRateBlur}
                                    />
                                    {exchangeRateError && (
                                        <p className={styles['exchange-rate-error']} data-testid="exchange-rate-error">
                                            {exchangeRateError}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <span className={styles['exchange-rate-value']} data-testid="exchange-rate">
                                    {exchangeRate}
                                </span>
                            )}
                        </div>
                    )}

                    {isEditing && (
                        <FundsRecordActions
                            controlsDisabled={controlsDisabled}
                            isAddExpenseDisabled={isAddExpenseDisabled}
                            isAddIncomeDisabled={isAddIncomeDisabled}
                            onAddExpense={onAddExpense}
                            onAddIncome={onAddIncome}
                            testId="editing-actions"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
