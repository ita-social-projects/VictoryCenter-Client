import React from 'react';
import styles from './SummarySection.module.scss';

export const SummarySection: React.FC = () => {
    return (
        <section className={styles.root}>
            <div className={styles.collected}>
                <div>1 249 854,09 грн</div>
                <div>Зібрано</div>
            </div>

            <div className={styles.expenses}>
                <div>Основні витрати</div>
            </div>

            <div className={styles.income}>
                <div>Звідки прийшли кошти</div>
            </div>

            <div className={styles.programs}>
                <div>Розподіл коштів по програмах</div>
            </div>

            <div className={styles.lives}>
                <div>205</div>
                <div>Змінених життів</div>
            </div>
        </section>
    );
};
