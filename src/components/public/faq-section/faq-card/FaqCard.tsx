import './FaqCard.scss';
import { ReactComponent as OpenIcon } from '../../../../assets/icons/arrow-down-right.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/icons/cross.svg';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';

interface FaqCardProps {
    faq: PublishedFaqQuestion;
}

export const FaqCard = ({ faq }: FaqCardProps) => {
    return (
        <details className="faq-item">
            <summary className="question-block">
                <p>{faq.questionText}</p>
                <div className="button-icons">
                    <OpenIcon className="faq-open" />
                    <CloseIcon className="faq-close" />
                </div>
            </summary>
            <div className="answer-block">{faq.answerText}</div>
        </details>
    );
};
