import { ReactComponent as LoaderIcon } from '../../../assets/icons/load.svg';
import './PageLoader.scss';

export const PageLoader = () => {
    return (
        <div className="full-page-loader">
            <LoaderIcon className="loader-icon" />
        </div>
    );
};
