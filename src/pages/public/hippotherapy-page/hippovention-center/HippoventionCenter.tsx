import { useMediaQuery } from '@/hooks/common/use-media-query/useMediaQuery';
import { HippoventionCenterData } from '@/types/public/hippotherapy-page';
import hippoventionCenterImg from '@/assets/images/people-on-horses.webp';
import styles from './HippoventionCenter.module.scss';

export const HippoventionCenter = ({ title, imgURL, imgAlternativeText, pros, text }: HippoventionCenterData) => {
    const isDesktop = useMediaQuery('(min-width: 1440px)');

    return (
        <section className={styles['hippovention-center']}>
            {!isDesktop && (
                <img
                    src={imgURL || hippoventionCenterImg}
                    className={styles.image}
                    alt={imgAlternativeText ?? 'Група людей на конях'}
                />
            )}
            <div className={styles.text}>
                <div className={styles.summary}>
                    <h3>{title}</h3>
                    <ul>
                        {pros.map((pro, index) => (
                            <li key={index}>{pro}</li>
                        ))}
                    </ul>
                </div>
                <p>{text}</p>
            </div>
        </section>
    );
};
