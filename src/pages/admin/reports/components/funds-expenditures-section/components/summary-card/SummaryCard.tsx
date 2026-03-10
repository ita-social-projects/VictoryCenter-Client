import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { getUkrainianPlural } from '@/utils/functions/get-ukrainian-plural/get-ukrainian-plural';
import cn from 'classnames';
import styles from './SummaryCard.module.scss';

interface SummaryCardProps {
    title: string;
    uah?: number;
    usd?: number;
    count?: number;
    blueThemeCard?: boolean;
}

export const SummaryCard = ({ title, uah, usd, count, blueThemeCard = false }: SummaryCardProps) => {
    const isCountCard = count !== undefined;

    return (
        <div className={cn(styles.card, { [styles.cardBlue]: blueThemeCard, [styles.cardCount]: isCountCard })}>
            <span className={styles.title}>{title}</span>
            {isCountCard ? (
                <span className={styles.value}>
                    {count}&nbsp;
                    {getUkrainianPlural(count, FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.CATEGORY_SUFFIX_FORMS)}
                </span>
            ) : (
                <div className={styles.amounts}>
                    <span className={styles.amount}>
                        {uah?.toLocaleString('uk-UA')}&nbsp;{FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_UAH}
                    </span>
                    <span className={styles.amount}>
                        {usd?.toLocaleString('uk-UA')}&nbsp;{FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_USD}
                    </span>
                </div>
            )}
        </div>
    );
};
