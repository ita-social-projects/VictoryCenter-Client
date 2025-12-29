import React from 'react';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-down-to-line.svg';
import { Button } from '@/components/public/ui/button';
import styles from './ReportItem.module.scss';

interface ReportItemProps {
    fileUrl?: string;
    label: string;
    buttonLabel: string;
}

export const ReportItem: React.FC<ReportItemProps> = ({ fileUrl, label, buttonLabel }) => {
    const handleClick = () => {
        if (fileUrl) window.open(fileUrl, '_blank');
    };

    return (
        <div className={styles.root}>
            <span className={styles.year}>{label}</span>
            <Button variant="tertiary" icon={ArrowIcon} iconPosition="right" onClick={handleClick}>
                {buttonLabel}
            </Button>
        </div>
    );
};
