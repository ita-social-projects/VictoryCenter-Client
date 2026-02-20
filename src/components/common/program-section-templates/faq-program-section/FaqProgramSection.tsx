import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { FaqCard } from '@/components/public/faq-section/faq-card/FaqCard';
import { PublishedFaqQuestion } from '@/types/public/faq-section';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './FaqProgramSection.module.scss';

export interface FaqProgramSectionProps {
    questions?: PublishedFaqQuestion[];
    mode?: ProgramSectionMode;
    title?: string;
}

export const FaqProgramSection = ({
    questions = [],
    mode = ProgramSectionMode.View,
    title,
}: FaqProgramSectionProps) => {
    const { t } = useTranslation('programsPage');

    const displayTitle = title || t('COMMON_QUESTIONS');
    const isTemplate = mode === ProgramSectionMode.Template;

    return (
        <div
            className={cn(styles['faq-section'], {
                [styles['template']]: isTemplate,
            })}
        >
            <div className={styles['faq-block']}>
                <h2 className={styles['title']}>{displayTitle}</h2>
                <div className={styles['questions-container']}>
                    {questions.map((faq, index) => (
                        <FaqCard key={faq.id || index} faq={faq} className={styles['faq-card-program-section']} />
                    ))}
                </div>
            </div>
        </div>
    );
};
