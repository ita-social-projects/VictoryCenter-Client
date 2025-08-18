import React from 'react';
import { ReactComponent as OpenIcon } from '../../../../../assets/icons/arrow-down-right.svg';
import { ReactComponent as CloseIcon } from '../../../../../assets/icons/cross.svg';
import './QuestionCard.scss';
import { Question } from '../../../../../types/public/programs-page';

interface QuestionCardProps {
    questionCard: Question;
}
export const QuestionCard: React.FC<QuestionCardProps> = ({ questionCard }) => {
    return (
        <details className="faq-item">
            <summary className="faq-question">
                <p>{questionCard.question}</p>
                <div className="button-icons">
                    <OpenIcon aria-hidden={true} className="faq-open" />
                    <CloseIcon aria-hidden={true} className="faq-close" />
                </div>
            </summary>
            <div className="faq-answer">{questionCard.answer}</div>
        </details>
    );
};
