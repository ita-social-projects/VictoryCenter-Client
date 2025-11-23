import { ReactComponent as LoaderIcon } from '../../../assets/icons/load.svg';
import styles from './PageLoader.module.scss';

export const PageLoader = () => {
    return (
        <div className={styles['full-page-loader']}>
            <LoaderIcon className="loader-icon" />
        </div>
    );
};
