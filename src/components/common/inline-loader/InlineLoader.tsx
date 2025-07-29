import LoaderIcon from '../../../assets/icons/load.svg';
import { LOADER_TEXT } from '../../../const/common/loader';
import './InlineLoader.scss';

type Props = {
    size?: number;
};

export const InlineLoader = ({ size = 2 }: Props) => {
    return (
        <img
            src={LoaderIcon}
            alt={LOADER_TEXT.ICON_ALT}
            className="loader"
            style={{ width: `${size}rem`, height: `${size}rem` }}
        />
    );
};
