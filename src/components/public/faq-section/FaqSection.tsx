import { useState, useEffect } from 'react';
import { COMMON_QUESTIONS } from '../../../const/public/programs-page';
import { axiosInstance } from '../../../services/api/axios';
import { FaqApi } from '../../../services/api/public/faq/faq-api';
import { PublishedFaqQuestion } from '../../../types/public/faq-section';
import { FaqCard } from './faq-card/FaqCard';
import './FaqSection.scss';

interface FaqSectionProps {
    slug: string;
}

export const FaqSection = ({ slug }: FaqSectionProps) => {
    const [questions, setQuestions] = useState<PublishedFaqQuestion[]>([]);

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
        <div className="faq-section">
            <div className="faq-block">
                <h2>{COMMON_QUESTIONS}</h2>
                <div>
                    {questions.map((item, _) => (
                        <FaqCard key={item.id} faq={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};
