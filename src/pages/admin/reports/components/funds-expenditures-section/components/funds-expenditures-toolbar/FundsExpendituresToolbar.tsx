import { Select } from '@/components/common/select/Select';
import { Button } from '@/components/admin/button/Button';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresTransactionType, ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
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
                        className={cn(styles['filter-select'], {
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
                                <input
                                    type="text"
                                    data-testid="exchange-rate-input"
                                    className={cn(styles['exchange-rate-input'], {
                                        [styles['exchange-rate-input-disabled']]: controlsDisabled,
                                    })}
                                    value={exchangeRate}
                                    maxLength={FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_MAX_LENGTH}
                                    disabled={controlsDisabled}
                                    onChange={(e) => onExchangeRateChange?.(e.target.value)}
                                />
                            ) : (
                                <span className={styles['exchange-rate-value']} data-testid="exchange-rate">
                                    {exchangeRate}
                                </span>
                            )}
                        </div>
                    )}

                    {isEditing && (
                        <div className={styles['editing-actions']} data-testid="editing-actions">
                            <Button
                                buttonStyle="primary"
                                className={cn(styles['add-expense-button'], {
                                    [styles['action-button-disabled-by-row-edit']]: controlsDisabled,
                                })}
                                onClick={onAddExpense}
                                disabled={isAddExpenseDisabled || controlsDisabled}
                            >
                                <PlusIcon className={styles['plus-icon']} />
                                {FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE}
                            </Button>
                            <Button
                                buttonStyle="primary"
                                className={cn(styles['add-income-button'], {
                                    [styles['action-button-disabled-by-row-edit']]: controlsDisabled,
                                })}
                                onClick={onAddIncome}
                                disabled={isAddIncomeDisabled || controlsDisabled}
                            >
                                <PlusIcon className={styles['plus-icon']} />
                                {FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
