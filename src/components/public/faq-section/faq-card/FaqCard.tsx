import cn from 'classnames';
import { ReactComponent as OpenIcon } from '@/assets/icons/arrow-down-right.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/cross.svg';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { PublishedFaqQuestion } from '@/types/public/faq-section';
import styles from './FaqCard.module.scss';

interface FaqCardProps {
    faq: PublishedFaqQuestion;
    className?: string;
}

export const FaqCard = ({ faq, className }: FaqCardProps) => {
    const { questionText, answerText } = useGetLocalization(faq.localizations, {
        questionText: faq.questionText,
        answerText: faq.answerText,
    });

    return (
        <details className={cn(styles['faq-item'], className)}>
            <summary className={styles['question-block']}>
                <p>{questionText}</p>
                <div className={styles['button-icons']}>
                    <OpenIcon className={styles['faq-open']} />
                    <CloseIcon className={styles['faq-close']} />
                </div>
            </summary>
            <div className={styles['answer-block']}>{answerText}</div>
        </details>
    );
};
