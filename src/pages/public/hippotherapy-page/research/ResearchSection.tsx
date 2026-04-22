import { HippotherapyResearchesSection } from '@/types/public/hippotherapy-page';
import { ReactComponent as LinkIcon } from '@/assets/icons/square-arrow-out-up-right.svg';
import styles from './ResearchSection.module.scss';

export const ResearchSection = ({ title, description, researches }: HippotherapyResearchesSection) => {
    return (
        <section className={styles.root}>
            <div className={styles['research-description']}>
                <h2 className={styles['research-title']}>{title}</h2>
                <p>{description}</p>
            </div>
            <ul>
                {researches &&
                    researches.map((research, index) => (
                        <li key={index}>
                            <a href={research.url} target="_blank" className={styles.research} rel="noreferrer">
                                {research.text}
                                <LinkIcon className={styles['link-icon']} />
                            </a>
                        </li>
                    ))}
            </ul>
        </section>
    );
};
