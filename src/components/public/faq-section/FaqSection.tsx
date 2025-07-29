import './FaqSection.scss';
import { FaqCard } from './faq-card/FaqCard';
import { useEffect, useState } from 'react';
import { COMMON_QUESTIONS } from '../../../const/public/programs-page';
import { FaqQuestion } from '../../../types/public/faq';
import { FaqApi } from '../../../services/api/public/faq/faq-api';
import { axiosInstance } from '../../../services/api/axios';

interface FaqSectionProps {
    slug: string;
}

export const FaqSection = ({ slug }: FaqSectionProps) => {
    const [questions, setQuestions] = useState<FaqQuestion[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await FaqApi.getBySlug(axiosInstance, slug);
                setQuestions(response);
            } catch {
                setQuestions([]);
            }
        })();
    }, [slug]);

    if (questions.length === 0) {
        return <></>;
    }

    return (
        <div className="qa-section">
            <div className="question-block">
                <h2>{COMMON_QUESTIONS}</h2>
                <div className="qa-block">
                    {questions.map((item, index) => (
                        <FaqCard key={index} faq={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};
