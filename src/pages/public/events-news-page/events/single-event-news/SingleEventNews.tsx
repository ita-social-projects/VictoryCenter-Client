import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { EventsNews } from '@/types/public/events-news';
import styles from './SingleEventNews.module.scss';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { Button } from '@/components/public/ui/button/Button';

export const SingleEventNews = memo(
    ({ title = '', date = '', tags = [], description = '', resource = '', imageURL = '' }: EventsNews) => {
        const { t } = useTranslation('eventsNewsPage');
        return (
            <div className={styles['event-card']}>
                <img src={imageURL} alt="Event" className={styles['event-image']} />
                <div className={styles['event-header']}>
                    {tags &&
                        tags.map((tag) => (
                            <span key={tag.id} className={styles['event-tag']}>
                                {tag.name}
                            </span>
                        ))}
                    <span className={styles['event-date']}>
                        {resource && resource + ' | '}
                        {date}
                    </span>
                </div>

                <h4 className={styles['event-title']}>{title}</h4>
                <p className={styles['event-description']}>{description}</p>
                <div>
                    <Button
                        href={PUBLIC_ROUTES.EVENTS_AND_NEWS.FULL}
                        icon={ArrowIcon}
                        iconPosition="right"
                        variant="tertiary"
                    >
                        {t('LINK_TO_ARTICLE')}
                    </Button>
                </div>
            </div>
        );
    },
);
