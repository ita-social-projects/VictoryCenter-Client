import { useTranslation } from 'react-i18next';
import { LinearProgress } from '@mui/material';
import styles from './LoadableContent.module.scss';

interface LoadableContentProps {
    isLoading: boolean;
    error: boolean;
    children: React.ReactNode;
    errorMessage?: string;
}

export const LoadableContent = ({ isLoading, error, errorMessage, children }: LoadableContentProps) => {
    const { t } = useTranslation('global');
    const defaultErrorMessage = t('LOADING_ERROR');

    if (isLoading) {
        return (
            <div className={styles['loadable-content-loader']}>
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return <div className={styles['loadable-content-error-message']}>{errorMessage || defaultErrorMessage}</div>;
    }
    return <>{children}</>;
};
