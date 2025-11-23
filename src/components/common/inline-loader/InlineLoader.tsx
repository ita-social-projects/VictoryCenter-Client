import { ReactComponent as LoaderIcon } from '../../../assets/icons/load.svg';
import styles from './InlineLoader.module.scss';

type Props = {
    size?: number;
};

export const InlineLoader = ({ size = 2 }: Props) => {
    return <LoaderIcon className={styles['loader']} style={{ width: `${size}rem`, height: `${size}rem` }} />;
};
