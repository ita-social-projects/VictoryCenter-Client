import cn from 'classnames';
import { ReactComponent as Logo } from '@/assets/icons/logo.svg';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import styles from './CompanyProfileLogoHeader.module.scss';

interface CompanyProfileLogoHeaderProps {
    isEditMode: boolean;
}

export const CompanyProfileLogoHeader = ({ isEditMode }: CompanyProfileLogoHeaderProps) => {
    return (
        <div
            className={cn(styles['company-header'], {
                [styles['company-header--editing']]: isEditMode,
            })}
        >
            <div className={styles['company-logo-section']}>
                <div className={styles['company-logo-wrapper']}>
                    <Logo className={styles['company-logo-icon']} />
                </div>
            </div>

            <div className={styles['company-text-block']}>
                <h1 className={styles['company-title']}>{COMPANY_PROFILE_TEXT.HEADER.TITLE}</h1>
                <p className={styles['company-subtitle']}>{COMPANY_PROFILE_TEXT.HEADER.SUBTITLE}</p>
            </div>
        </div>
    );
};
