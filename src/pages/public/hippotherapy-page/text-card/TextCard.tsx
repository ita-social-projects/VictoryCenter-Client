import { HippotherapyDefaultSection } from '@/types/public/hippotherapy-page';
import { SafeHtml } from '@/components/common/safe-html';
import styles from './TextCard.module.scss';

export const TextCard = ({ title, text }: HippotherapyDefaultSection) => {
    return (
        <section className={styles['text-card-section']}>
            <div className={styles['text-card']}>
                <SafeHtml as="p" html={title} />
                <SafeHtml as="p" html={text} />
            </div>
        </section>
    );
};
