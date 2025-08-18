import { ReactComponent as LoaderIcon } from '../../../assets/icons/load.svg';
import { LOADER_TEXT } from '../../../const/common/common';
import './InlineLoader.scss';

type Props = {
    size?: number;
};

export const InlineLoader = ({ size = 2 }: Props) => {
    return (
        <LoaderIcon
            role="img"
            aria-label={LOADER_TEXT.ICON_ALT}
            className="loader"
            style={{ width: `${size}rem`, height: `${size}rem` }}
        />
    );
};
