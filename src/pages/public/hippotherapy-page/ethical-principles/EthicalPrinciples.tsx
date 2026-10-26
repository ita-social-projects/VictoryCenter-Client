import { useMediaQuery } from '@/hooks/common/use-media-query/useMediaQuery';
import { HippotherapyEthicsSection } from '@/types/public/hippotherapy-page';
import hippoventionCenterImg from '@/assets/images/ethic.webp';
import styles from './EthicalPrinciples.module.scss';

export const EthicalPrinciples = ({
    title,
    imgURL,
    imgAlternativeText,
    text,
    principles,
}: HippotherapyEthicsSection) => {
    const isDesktop = useMediaQuery('(min-width: 1440px)');

    return (
        <section className={styles['ethical-principles']}>
            {!isDesktop && (
                <div className={styles.imageContainer}>
                    <img
                        src={imgURL || hippoventionCenterImg}
                        className={styles.image}
                        alt={imgAlternativeText ?? 'Група людей на конях'}
                    />
                    <div className={styles.overlay} />
                </div>
            )}
            <div className={styles.text}>
                <div className={styles.heading}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                </div>
                <ul className={styles.principles}>
                    {principles.map((principle, index) => (
                        <li key={index}>{principle}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
};
