import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '@/services/api/axios';
import { FaqApi } from '@/services/api/public/faq/faq-api';
import { PublishedFaqQuestion } from '@/types/public/faq-section';
import { FaqCard } from './faq-card/FaqCard';
import styles from './FaqSection.module.scss';

interface FaqSectionProps {
    slug: string;
}

export const FaqSection = ({ slug }: FaqSectionProps) => {
    const { t } = useTranslation('programsPage');

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
        <div className={styles['faq-section']}>
            <div className={styles['faq-block']}>
                <h2 className={styles['title']}>{t('COMMON_QUESTIONS')}</h2>
                <div className={styles['questions-container']}>
                    {questions.map((item, _) => (
                        <FaqCard key={item.id} faq={item} className={styles['faq-card-faq-section']} />
                    ))}
                </div>
            </div>
        </div>
    );
};
