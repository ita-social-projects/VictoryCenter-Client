import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { EventsNews } from '@/types/public/events-news';
import styles from './SingleEventNews.module.scss';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { Button } from '@/components/public/ui/button/Button';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';

export const SingleEventNews = memo(
    ({
        name = '',
        date = '',
        tags = [],
        description = '',
        resource = '',
        previewImage = '',
        slug = '',
        localizations = [],
    }: EventsNews) => {
        const { t } = useTranslation('eventsNewsPage');
        const navigate = useNavigate();

        const localized = useGetLocalization(localizations, {
            name: name,
            title: name,
            description: description,
        });

        const finalName = localized.title || localized.name;

        const handleClick = () => {
            if (slug) {
                navigate(PUBLIC_ROUTES.EVENTS_NEWS_DETAIL.getPath(slug));
            }
        };

        return (
            <div className={styles['event-card']}>
                <img src={previewImage as string} alt="Event" className={styles['event-image']} />
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

                <h4 className={styles['event-title']}>{finalName}</h4>
                <p className={styles['event-description']}>{localized.description}</p>

                <div>
                    <Button onClick={handleClick} icon={ArrowIcon} iconPosition="right" variant="tertiary">
                        {t('LINK_TO_ARTICLE')}
                    </Button>
                </div>
            </div>
        );
    },
);
