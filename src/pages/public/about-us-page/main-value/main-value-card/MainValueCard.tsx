import cn from 'classnames';
import { SafeHtml } from '@/components/common/safe-html';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { AboutUsContent } from '@/types/public/about-us-page';
import styles from './MainValueCard.module.scss';

interface MainValueCardProps {
    person: AboutUsContent;
    index: number;
    imageUrl: string;
    altText: string;
}

export const MainValueCard = ({ person, index, imageUrl, altText }: MainValueCardProps) => {
    const { description } = useGetLocalization(person.localizations, {
        description: person.description,
    });

    return (
        <div className={cn(styles[`people-card`], styles[`card-${index + 1}`])}>
            <img className={styles[`people-img`]} src={imageUrl} alt={altText} />
            <SafeHtml as="p" className={styles[`people-info`]} html={description ?? ''} />
        </div>
    );
};
