import { SafeHtml } from '@/components/common/safe-html';
import { Quote } from '@/types/public/hippotherapy-page';
import styles from './QuoteSection.module.scss';

export const QuoteSection = ({ imgURL, imgAlternativeText, text }: Quote) => {
    return (
        <>
            <section className={styles.root}>
                <img src={imgURL} alt={imgAlternativeText} className={styles.image} />
                <SafeHtml data-testid="quote-text" as="p" html={text ?? ''} className={styles.text} />
            </section>
        </>
    );
};
