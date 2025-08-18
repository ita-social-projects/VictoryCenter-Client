import { ReactComponent as LoaderIcon } from '../../../assets/icons/load.svg';
import { LOADER_TEXT } from '../../../const/common/common';
import './PageLoader.scss';

export const PageLoader = () => {
    return (
        <div className="full-page-loader">
            <LoaderIcon className="loader-icon" aria-label={LOADER_TEXT.ICON_ALT} role="img" />
        </div>
    );
};
