import LoaderIcon from '../../../assets/icons/load.svg';
import { LOADER_ALT } from '../../../const/loader/loader';
import './page-loader.scss';

export const PageLoader = () => {
    return (
        <div className="full-page-loader">
            <img
                src={LoaderIcon}
                alt={LOADER_ALT}
                className="loader-icon"
            />
        </div>
    );
};
