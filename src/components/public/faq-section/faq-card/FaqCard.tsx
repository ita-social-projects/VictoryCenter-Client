import './FaqCard.scss';
import React, { useState } from 'react';
import openIcon from '../../../../../assets/icons/arrowDown.svg';
import closeIcon from '../../../../../assets/icons/Cross.svg';
import openBlue from '../../../../../assets/icons/arrowDownBlue.svg';
import closeBlue from '../../../../../assets/icons/crossBlue.svg';
import { FaqQuestion } from '../../../../types/public/faq';

interface FaqCardProps {
    faq: FaqQuestion;
}

export const FaqCard = ({ faq }: FaqCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
        <details className="faq-item" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <summary className="faq-question">
                <p>{faq.question}</p>
                <div className="button-icons">
                    <img src={isHovered ? openBlue : openIcon} alt="" aria-hidden="true" className="faq-open" />
                    <img src={isHovered ? closeBlue : closeIcon} alt="" aria-hidden="true" className="faq-close" />
                </div>
            </summary>
            <div className="faq-answer">{faq.answer}</div>
        </details>
    );
};
