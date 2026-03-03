import { Select } from '@/components/common/select/Select';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresTransactionType, ReportFundsExpendituresCategory } from '@/types/admin/reports';
import styles from './FundsExpendituresToolbar.module.scss';

export type TypeFilterValue = FundsExpendituresTransactionType | undefined;
export type CategoryFilterValue = number | undefined;

interface FundsExpendituresToolbarProps {
    categories: ReportFundsExpendituresCategory[];
    selectedType: TypeFilterValue;
    selectedCategoryId: CategoryFilterValue;
    exchangeRate: string | null;
    onTypeChange: (value: TypeFilterValue) => void;
    onCategoryChange: (value: CategoryFilterValue) => void;
}

export const FundsExpendituresToolbar = ({
    categories,
    selectedType,
    selectedCategoryId,
    exchangeRate,
    onTypeChange,
    onCategoryChange,
}: FundsExpendituresToolbarProps) => {
    return (
        <div className={styles.toolbar}>
            <div className={styles.filters}>
                <Select<TypeFilterValue>
                    value={selectedType}
                    onValueChange={onTypeChange}
                    placeholder={FUNDS_EXPENDITURES_TEXT.FILTER.TYPE_PLACEHOLDER}
                >
                    <Select.Option value={undefined} name={FUNDS_EXPENDITURES_TEXT.FILTER.ALL_OPTION} />
                    <Select.Option value="income" name={FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME} />
                    <Select.Option value="expense" name={FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE} />
                </Select>

                <Select<CategoryFilterValue>
                    value={selectedCategoryId}
                    onValueChange={onCategoryChange}
                    placeholder={FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}
                >
                    <Select.Option value={undefined} name={FUNDS_EXPENDITURES_TEXT.FILTER.ALL_OPTION} />
                    {categories.map((category) => (
                        <Select.Option key={category.id} value={category.id} name={category.name} />
                    ))}
                </Select>
            </div>

            {exchangeRate && (
                <div className={styles.exchangeRate}>
                    <span className={styles.exchangeRateLabel}>{FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}</span>
                    <span className={styles.exchangeRateValue}>{exchangeRate}</span>
                </div>
            )}
        </div>
    );
};
