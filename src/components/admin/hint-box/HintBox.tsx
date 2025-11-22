import { ReactComponent as InfoIcon } from '../../../assets/icons/info.svg';
import styles from './HintBox.module.scss';

export interface HintBoxProps {
    title: string;
    text?: string;
}

export const HintBox = ({ title, text }: HintBoxProps) => {
    return (
        <div className={styles['hint-box']}>
            <div className={styles['hint-box-title']}>
                <InfoIcon className={styles['info-icon']} />
                <span>{title}</span>
            </div>
            {text && <span>{text}</span>}
        </div>
    );
};
