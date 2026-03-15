import cn from 'classnames';
import { ReactComponent as ChevronUp } from '@/assets/icons/chevron-up.svg';
import { ReactComponent as ChevronDown } from '@/assets/icons/chevron-down.svg';
import styles from './SortIcon.module.scss';

interface SortIconProps {
    isActive: boolean;
    direction: 'asc' | 'desc' | null;
}

export const SortIcon = ({ isActive, direction }: SortIconProps) => {
    if (!isActive || !direction) {
        return (
            <span className={styles['sort-icons']}>
                <ChevronUp className={styles['sort-icon']} />
                <ChevronDown className={styles['sort-icon']} />
            </span>
        );
    }

    const Icon = direction === 'asc' ? ChevronUp : ChevronDown;

    return <Icon className={cn(styles['sort-icon'], styles['sort-icon-active'])} />;
};
