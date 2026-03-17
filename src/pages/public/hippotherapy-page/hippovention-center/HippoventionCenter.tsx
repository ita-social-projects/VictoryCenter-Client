import { HippoventionCenterData } from '@/types/public/hippotherapy-page';
import hippoventionCenterImg from '@/assets/images/public/hippotherapy/hippovention_center.jpg';
import styles from './HippoventionCenter.module.scss';

export const HippoventionCenter = ({ title, imgURL, imgAlternativeText, pros, text }: HippoventionCenterData) => {
    return (
        <section className={styles['hippovention-center']}>
            <img
                src={imgURL ?? hippoventionCenterImg}
                className={styles.image}
                alt={imgAlternativeText ?? 'Група людей на конях'}
            />
            <div className={styles.text}>
                <h3>{title}</h3>
                <div>
                    <ul>
                        {pros.map((pro, index) => (
                            <li key={index}>{pro}</li>
                        ))}
                    </ul>
                    <p>{text}</p>
                </div>
            </div>
        </section>
    );
};
