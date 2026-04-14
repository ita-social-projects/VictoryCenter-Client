import { HippotherapyResearchesSection } from '@/types/public/hippotherapy-page';
import { ReactComponent as LinkIcon } from '@/assets/icons/square-arrow-out-up-right.svg';
import styles from './ResearchSection.module.scss';

export const ResearchSection = ({ description, researches }: HippotherapyResearchesSection) => {
    return (
        <section className={styles.root}>
            <p className={styles['research-description']}>{description}</p>
            <ul>
                {researches &&
                    researches.map((research, index) => (
                        <li key={index} className={styles.research}>
                            <a href={research.url} target="_blank" rel="noreferrer">
                                {research.text}
                            </a>
                            <LinkIcon />
                        </li>
                    ))}
            </ul>
        </section>
    );
};
