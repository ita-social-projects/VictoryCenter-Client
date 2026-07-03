import React from 'react';
import styles from './ProgramCardSkeleton.module.scss';

export const ProgramCardSkeleton: React.FC = () => (
    <div className={styles.root} aria-hidden="true">
        <div className={styles.image} />
        <div className={styles.content}>
            <div className={styles['line-short']} />
            <div className={styles['line-long']} />
        </div>
    </div>
);
