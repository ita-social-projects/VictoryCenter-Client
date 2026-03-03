import { HippotherapyDefaultSection } from '@/types/public/hippotherapy-page';
import { SafeHtml } from '@/components/common/safe-html';
import styles from './TextCard.module.scss';

interface TextCardProps {
    content: HippotherapyDefaultSection;
}

export const TextCard = ({ content }: TextCardProps) => {
    return (
        <div className={styles['text-card']}>
            <SafeHtml as="h3" html={content.title} />
            <SafeHtml as="p" html={content.text} />
        </div>
    );
};
