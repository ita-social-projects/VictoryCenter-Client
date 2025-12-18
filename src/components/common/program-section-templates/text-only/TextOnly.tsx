import styles from './TextOnly.module.scss';

export interface TextOnlyProps {
    // TODO: Add props for title and description
}

export const TextOnly = (props: TextOnlyProps) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Template 3</h2>
        </div>
    );
};
