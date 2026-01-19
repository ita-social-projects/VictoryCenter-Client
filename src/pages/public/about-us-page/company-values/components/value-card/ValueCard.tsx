import { useTranslation } from 'react-i18next';
import { ValueItem } from '../../CompanyValues';
import styles from './ValueCard.module.scss';
import cn from 'classnames';

interface ValueGroupProps {
    group: ValueItem[];
    groupIndex: number;
}

export function ValueCard({ group, groupIndex }: ValueGroupProps) {
    const { t } = useTranslation('aboutUsPage');
    return (
        <>
            {groupIndex === 0 && (
                <div className={styles.title}>
                    <h2>{t('OUR_VALUES')}</h2>
                </div>
            )}
            <div className={cn(styles.column, styles[`card-${groupIndex + 1}`])}>
                {group.map((val) => (
                    <div className={styles.item} key={val.name}>
                        <h3 className={styles.name}>{val.name}</h3>
                        <div className={styles.description}>{val.description}</div>
                    </div>
                ))}
            </div>
        </>
    );
}
