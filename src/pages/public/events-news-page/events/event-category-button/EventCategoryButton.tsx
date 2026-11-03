import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { Tag } from '@/types/public/events-news';
import classNames from 'classnames';
import styles from './EventCategoryButton.module.scss';

export interface EventCategoryButtonProps {
    tag: Tag;
    isActive: boolean;
    onClick: () => void;
}

export const EventCategoryButton = ({ tag, isActive, onClick }: EventCategoryButtonProps) => {
    const { name } = useGetLocalization(tag.localizations, {
        name: tag.name,
    });

    return (
        <button
            onClick={onClick}
            className={classNames({
                [styles['white-button']]: !isActive,
                [styles['black-button']]: isActive,
            })}
        >
            {name}
        </button>
    );
};
