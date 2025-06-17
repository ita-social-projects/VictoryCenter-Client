import React, {useState} from 'react';
import openIcon from '../../../../../assets/program_page_images/icons/arrowDown.svg';
import closeIcon from '../../../../../assets/program_page_images/icons/Cross.svg';
import openBlue from '../../../../../assets/program_page_images/icons/arrowDownBlue.svg';
import closeBlue from '../../../../../assets/program_page_images/icons/crossBlue.svg';
import './QuestionCard.scss'
export interface  QuestionCard {
    question: string;
    answer: string;
}
interface QuestionCardProps{
    questionCard: QuestionCard;
}
export const  QuestionCard: React.FC<QuestionCardProps> = ({questionCard}) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <details className="faq-item"
                 onMouseEnter={() => setIsHovered(true)}
                 onMouseLeave={() => setIsHovered(false)}>
            <summary className="faq-question">
                <p>{questionCard.question}</p>
                <div className="button-icons">
                    <img src={isHovered ? openBlue : openIcon} alt="open-arrow" className="faq-open"/>
                    <img src={isHovered ? closeBlue : closeIcon} alt="close-cross" className="faq-close"/>
                </div>
            </summary>
            <div className="faq-answer">{questionCard.answer}</div>
        </details>
    )
}