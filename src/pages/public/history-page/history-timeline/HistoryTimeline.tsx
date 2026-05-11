import styles from './HistoryTimeline.module.scss';

const TIMELINE_DATES = [
    '09/2023',
    '10/2023',
    '11/2023',
    '12/2023',
    '01/2024',
    '02/2024',
    '03/2024',
    '04/2024',
    '05/2024',
    '06/2024',
    '07/2024',
    '08/2024',
    '09/2024',
    '10/2024',
    '11/2024',
    '12/2024',
    '01/2025',
    '02/2025',
];

const HIGHLIGHTED_DATES = new Set(['12/2023', '03/2024', '06/2024', '09/2024', '12/2024']);

export const HistoryTimeline = () => {
    return (
        <div className={styles.timeline}>
            <div className={styles['dates-row']}>
                {TIMELINE_DATES.map((date) => (
                    <span
                        key={date}
                        className={`${styles.date} ${HIGHLIGHTED_DATES.has(date) ? styles['date--active'] : ''}`}
                    >
                        {date}
                    </span>
                ))}
            </div>
        </div>
    );
};
