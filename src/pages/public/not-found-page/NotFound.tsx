import { NotFoundMessage } from './not-found-message/NotFoundMessage';
import { NotFoundIntro } from './not-found-intro/NotFoundIntro';
import cn from './NotFound.module.scss';

export const NotFound = () => {
    return (
        <div className={cn.root}>
            <NotFoundIntro />
            <NotFoundMessage />
        </div>
    );
};
