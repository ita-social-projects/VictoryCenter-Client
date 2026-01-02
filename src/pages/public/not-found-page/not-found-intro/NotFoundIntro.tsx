import cn from './NotFoundIntro.module.scss';
import { ERROR_404 } from '@/const/public/notfound-page';

export const NotFoundIntro = () => {
    return (
        <div className={cn.root}>
            <div className={cn.content}>
                <h1 className={cn.text}>{ERROR_404}</h1>
            </div>
        </div>
    );
};
