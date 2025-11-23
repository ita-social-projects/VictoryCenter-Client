import styles from './FaqCard.module.scss';
import { ReactComponent as OpenIcon } from '../../../../assets/icons/arrow-down-right.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/icons/cross.svg';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';

interface FaqCardProps {
    faq: PublishedFaqQuestion;
}

export const FaqCard = ({ faq }: FaqCardProps) => {
    return (
        <details className={styles['faq-item']}>
            <summary className={styles['question-block']}>
                <p>{faq.questionText}</p>
                <div className={styles['button-icons']}>
                    <OpenIcon className={styles['faq-open']} />
                    <CloseIcon className={styles['faq-close']} />
                </div>
            </summary>
            <div className={styles['answer-block']}>{faq.answerText}</div>
        </details>
    );
};
