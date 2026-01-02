import cn from './NotFoundMessage.module.scss';
import { DESCRIPTION, TEXT, GO_BACK_BUTTON } from '@/const/public/notfound-page';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { Button } from '@/components/public/ui/button/Button';

export const NotFoundMessage = () => {
    return (
        <div className={cn.root}>
            <div className={cn.header}>
                <h4 className={cn.title}>{TEXT}</h4>
            </div>
            <div className={cn.content}>
                <p className={cn.description}>{DESCRIPTION}</p>
                <div className={cn.actions}>
                    <Button
                        href={PUBLIC_ROUTES.ROOT}
                        icon={ArrowIcon}
                        iconPosition="right"
                        variant="tertiary"
                        size="medium"
                    >
                        {GO_BACK_BUTTON}
                    </Button>
                </div>
            </div>
        </div>
    );
};
