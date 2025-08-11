import './FaqCard.scss';
import { useState } from 'react';
import openIcon from '../../../../assets/icons/arrow-down-right.svg';
import closeIcon from '../../../../assets/icons/cross.svg';
import openBlue from '../../../../assets/icons/arrow-down-right-blue.svg';
import closeBlue from '../../../../assets/icons/cross-blue.svg';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';

interface FaqCardProps {
    faq: PublishedFaqQuestion;
}

export const FaqCard = ({ faq }: FaqCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
        <details className="faq-item" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <summary className="question-block">
                <p>{faq.questionText}</p>
                <div className="button-icons">
                    <img src={isHovered ? openBlue : openIcon} alt="" className="faq-open" />
                    <img src={isHovered ? closeBlue : closeIcon} alt="" className="faq-close" />
                </div>
            </summary>
            <div className="answer-block">{faq.answerText}</div>
        </details>
    );
};
