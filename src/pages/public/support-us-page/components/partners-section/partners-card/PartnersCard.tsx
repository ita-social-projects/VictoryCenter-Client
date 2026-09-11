import styles from './PartnersCard.module.scss';

interface PartnersCardProps {
    imageUrl: string;
    altText: string;
    caption: string;
}

export const PartnersCard = ({ imageUrl, altText, caption }: PartnersCardProps) => {
    return (
        <div className={styles['partners-card']}>
            <img className={styles['partners-img']} src={imageUrl} alt={altText} />
            <p className={styles['partners-caption']}>{caption}</p>
        </div>
    );
};
