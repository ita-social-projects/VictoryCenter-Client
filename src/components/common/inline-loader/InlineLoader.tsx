import { ReactComponent as LoaderIcon } from '@assets/icons/load.svg';
import './InlineLoader.scss';

type Props = {
    size?: number;
};

export const InlineLoader = ({ size = 2 }: Props) => {
    return <LoaderIcon className="loader" style={{ width: `${size}rem`, height: `${size}rem` }} />;
};
