import { NavLink } from 'react-router-dom';
import { ReactComponent as ArrowIcon } from '../../../../assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import classNames from 'classnames';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';
import { useTranslation } from 'react-i18next';
import styles from './OurMission.module.scss';

export interface OurMissionProps {
    content?: AboutUsContent[] | null;
    description?: string;
    navigate?: boolean;
    className?: string;
}

export const OurMission = ({ content, description, className, navigate = true }: OurMissionProps) => {
    const { t } = useTranslation('aboutUsPage');

    const descriptionValue = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    const linkContent = (
        <div className={styles['link-block']}>
            <span className={styles['link-title']}>{t('GO_TO_PROGRAMS')}</span>
            <ArrowIcon className={styles['arrow-icon']} />
        </div>
    );

    return (
        <div className={classNames([styles['our-mission-block']], className)}>
            <div className={styles['what-we-do']}>
                <h2 className={styles['mission-title']}>{t('WHAT_WE_DO')}</h2>
                <div className={styles['details-block']}>
                    <p className={styles['mission-details']}>{description ?? descriptionValue}</p>
                    {navigate ? (
                        <NavLink to={PUBLIC_ROUTES.PROGRAMS.FULL} className={styles['link-to-programs']}>
                            {linkContent}
                        </NavLink>
                    ) : (
                        <span className={styles['link-to-programs']}>{linkContent}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
