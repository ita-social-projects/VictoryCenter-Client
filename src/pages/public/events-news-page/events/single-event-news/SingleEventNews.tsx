import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as SquareArrowIcon } from '@/assets/icons/square-arrow-out-up-right.svg';
import { EventsNews } from '@/types/public/events-news';
import styles from './SingleEventNews.module.scss';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { Button } from '@/components/public/ui/button/Button';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';

export const SingleEventNews = memo(
    ({
        name = '',
        date = '',
        tag,
        description = '',
        resource = '',
        previewImage = '',
        slug = '',
        localizations = [],
    }: EventsNews) => {
        const { t } = useTranslation('eventsNewsPage');
        const navigate = useNavigate();

        const localized = useGetLocalization(localizations, {
            title: name,
            description: description,
        });

        const localizedTag = useGetLocalization(tag?.localizations, {
            name: tag?.name || '',
        });

        const finalName = localized.title;

        const handleClick = () => {
            if (slug) {
                navigate(PUBLIC_ROUTES.EVENTS_NEWS_DETAIL.getPath(slug));
            }
        };

        return (
            <div className={styles['event-card']}>
                <img src={previewImage as string} alt={name || 'Event'} className={styles['event-image']} />
                <div className={styles['event-header']}>
                    {tag && <span className={styles['event-tag']}>{localizedTag.name}</span>}
                    <span className={styles['event-date']}>
                        {resource ? `${resource} | ` : ''}
                        {date}
                    </span>
                </div>

                <h4 className={styles['event-title']}>{finalName}</h4>
                <p className={styles['event-description']}>{localized.description}</p>

                <div>
                    <Button onClick={handleClick} icon={SquareArrowIcon} iconPosition="right" variant="tertiary">
                        {t('LINK_TO_ARTICLE')}
                    </Button>
                </div>
            </div>
        );
    },
);
