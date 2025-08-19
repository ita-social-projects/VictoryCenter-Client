import React, { useState } from 'react';
import openIcon from '../../../../../assets/icons/arrow-down-right.svg';
import closeIcon from '../../../../../assets/icons/cross.svg';
import openBlue from '../../../../../assets/icons/arrow-down-right-blue.svg';
import closeBlue from '../../../../../assets/icons/cross-blue.svg';
import './QuestionCard.scss';
import { Question } from '../../../../../types/public/programs-page';

interface QuestionCardProps {
    questionCard: Question;
}
export const QuestionCard: React.FC<QuestionCardProps> = ({ questionCard }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <details className="faq-item" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <summary className="faq-question">
                <p>{questionCard.question}</p>
                <div className="button-icons">
                    <img src={isHovered ? openBlue : openIcon} alt="" aria-hidden="true" className="faq-open" />
                    <img src={isHovered ? closeBlue : closeIcon} alt="" aria-hidden="true" className="faq-close" />
                </div>
            </summary>
            <div className="faq-answer">{questionCard.answer}</div>
        </details>
    );
};
