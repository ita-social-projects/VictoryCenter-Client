import './FaqCard.scss';
import { ReactComponent as OpenIcon } from '@/assets/icons/arrow-down-right.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/cross.svg';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { PublishedFaqQuestion } from '@/types/public/faq-section';

interface FaqCardProps {
    faq: PublishedFaqQuestion;
}

export const FaqCard = ({ faq }: FaqCardProps) => {
    const { questionText, answerText } = useGetLocalization(faq.localizations, {
        questionText: faq.questionText,
        answerText: faq.answerText,
    });

    return (
        <details className="faq-item">
            <summary className="question-block">
                <p>{questionText}</p>
                <div className="button-icons">
                    <OpenIcon className="faq-open" />
                    <CloseIcon className="faq-close" />
                </div>
            </summary>
            <div className="answer-block">{answerText}</div>
        </details>
    );
};
