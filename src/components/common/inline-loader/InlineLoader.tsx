import LoaderIcon from '../../../assets/icons/load.svg';
import { LOADER_ALT } from '../../../const/loader/loader';
import './inline-loader.scss';

type Props = {
    size?: number;
};

export const InlineLoader = ({ size = 2 }: Props) => {
    return (
        <img
            src={LoaderIcon}
            alt={LOADER_ALT}
            className="loader"
            style={{ width: `${size}rem`, height: `${size}rem` }}
        />
    );
};
