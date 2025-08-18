import { useState, useEffect } from 'react';
import { COMMON_QUESTIONS } from '../../../const/public/programs-page';
import { PublishedFaqQuestion } from '../../../types/public/faq-section';
import { FaqCard } from './faq-card/FaqCard';
import './FaqSection.scss';
import { getBySlug } from '../../../utils/mock-data/public/faq-section';

interface FaqSectionProps {
    slug: string;
}

export const FaqSection = ({ slug }: FaqSectionProps) => {
    const [questions, setQuestions] = useState<PublishedFaqQuestion[]>([]);

    useEffect(() => {
        (async () => {
            try {
                // TODO: uncomment when faq integration is implmented
                // const response = await FaqApi.getBySlug(axiosInstance, slug);
                const response = getBySlug(slug);
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
                    {questions.map((item, index) => (
                        <FaqCard key={index} faq={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};
