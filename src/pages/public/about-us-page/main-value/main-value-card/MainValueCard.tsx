import cn from 'classnames';
import { SafeHtml } from '@/components/common/safe-html';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { EntityLocalization } from '@/types/common/language';
import styles from './MainValueCard.module.scss';

interface SwipedCardProps {
    index: number;
    imageUrl: string;
    altText: string;
    description: string | null;
    localizations?: EntityLocalization[];
}

export const MainValueCard = ({ index, imageUrl, altText, description, localizations }: SwipedCardProps) => {
    const localizedDescription = useGetLocalization(localizations, {
        description,
    }).description;

    return (
        <div className={cn(styles[`people-card`], styles[`card-${index + 1}`])}>
            <img className={styles[`people-img`]} src={imageUrl} alt={altText} />
            <SafeHtml as="p" className={styles[`people-info`]} html={localizedDescription ?? ''} />
        </div>
    );
};
