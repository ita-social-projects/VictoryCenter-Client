import LoaderIcon from '../../../assets/icons/load.svg';
import { LOADER_TEXT } from '../../../const/common/loader';
import './PageLoader.scss';

export const PageLoader = () => {
    return (
        <div className="full-page-loader">
            <img src={LoaderIcon} alt={LOADER_TEXT.ICON_ALT} className="loader-icon" />
        </div>
    );
};
