import React from 'react';
import { ReactComponent as ArrowIcon } from '../../../../../../../assets/icons/arrow-down-to-line.svg';
import styles from './ReportItem.module.scss';

interface ReportItemProps {
    year: number;
    fileUrl?: string;
    label: string;
    buttonLabel: string;
}

export const ReportItem: React.FC<ReportItemProps> = ({ year, fileUrl, label, buttonLabel }) => {
    const handleClick = () => {
        if (fileUrl) window.open(fileUrl, '_blank');
    };

    return (
        <div className={styles.root}>
            <span className={styles.year}>{label}</span>
            <button className={styles.button} onClick={handleClick} aria-label={`${buttonLabel} ${year}`}>
                {buttonLabel}
                <ArrowIcon />
            </button>
        </div>
    );
};
