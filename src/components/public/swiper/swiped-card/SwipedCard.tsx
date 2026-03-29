import cn from 'classnames';
import { SafeHtml } from '@/components/common/safe-html';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { EntityLocalization } from '@/types/common/language';
import styles from './SwipedCard.module.scss';

interface SwipedCardProps {
    index: number;
    imageUrl: string;
    altText: string;
    description: string | null;
    localizations?: EntityLocalization[];
}

export const SwipedCard = ({ index, imageUrl, altText, description, localizations }: SwipedCardProps) => {
    const localizedDescription = useGetLocalization(localizations, {
        description,
    }).description;
    const cardClassName = cn(styles[`swiped-card`], styles[`card-${index + 1}`]);

    return (
        <div className={cardClassName}>
            <img className={styles[`swiped-img`]} src={imageUrl} alt={altText} />
            <SafeHtml as="p" className={styles[`swiped-info`]} html={localizedDescription ?? ''} />
        </div>
    );
};
