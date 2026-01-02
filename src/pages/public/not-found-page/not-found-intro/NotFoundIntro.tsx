import styles from './NotFoundIntro.module.scss';
import { ERROR_404 } from '@/const/public/notfound-page';

export const NotFoundIntro = () => {
    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <h1 className={styles.text}>{ERROR_404}</h1>
            </div>
        </div>
    );
};
